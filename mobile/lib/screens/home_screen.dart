import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// --- IMPORT CÁC FILE CẦN THIẾT ---
import '../services/mqtt_service.dart';
import '../models/attendance_model.dart';
import '../utils/notification_helper.dart';

import 'history_screen.dart';
import 'request_screen.dart';
import 'profile_screen.dart';
import 'notification_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final AttendanceMQTTService _mqttService = AttendanceMQTTService();

  // --- CẤU HÌNH SERVER ---
  static const String serverIp = '172.23.143.174';
  static const String baseUrl = 'http://$serverIp:5000';

  // Biến hiển thị User
  String _fullName = "Đang tải...";
  String _userId = "---";

  // --- QUẢN LÝ TRẠNG THÁI ---
  String _currentStatus = "NONE";
  String _displayTime = "--:--";

  // --- ĐÃ SỬA: THÊM BIẾN BỊ THIẾU ---
  bool _isLoading = true;

  final List<AttendanceHistory> _history = [];

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _loadHistory();
    _fetchTodayData();
    _setupMqtt();
  }

  // --- 1. TẢI LỊCH SỬ TỪ MÁY ---
  Future<void> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final String? historyString = prefs.getString('ATTENDANCE_HISTORY');
    if (historyString != null) {
      if (mounted) {
        setState(() {
          _history.clear();
          _history.addAll(AttendanceHistory.decode(historyString));
        });
      }
    }
  }

  // --- 2. LƯU LỊCH SỬ VÀO MÁY ---
  Future<void> _saveHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final String encodedData = AttendanceHistory.encode(_history);
    await prefs.setString('ATTENDANCE_HISTORY', encodedData);
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _fullName = prefs.getString('FULL_NAME') ?? "Nhân viên";
      _userId = prefs.getString('USER_ID') ?? "---";
    });
  }

  // --- 3. LẤY TRẠNG THÁI TỪ SERVER (ĐÃ SỬA LOGIC PARSE JSON) ---
  Future<void> _fetchTodayData() async {
    print("------- BẮT ĐẦU GỌI API -------");
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('ACCESS_TOKEN');

    if (token == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    try {
      final url = Uri.parse('$baseUrl/api/worked-day/day');
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
      ).timeout(const Duration(seconds: 5));

      print("Response Body: ${response.body}"); // Xem log ở đây

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);

        // --- LOGIC MỚI DỰA TRÊN HÌNH 5 ---
        // Cấu trúc JSON: { "data": { "times": ["08:00", "17:00"], ... }, ... }
        if (body['is_success'] == true && body['data'] != null) {
          final data = body['data'];
          List<dynamic> times =
              data['times'] ?? []; // Lấy danh sách giờ chấm công

          String serverCheckIn = "";
          String serverCheckOut = "";

          if (times.isNotEmpty) {
            // Phần tử đầu tiên là Check-in
            serverCheckIn = times[0].toString();

            // Nếu có nhiều hơn 1 phần tử, phần tử cuối cùng là Check-out
            if (times.length >= 2) {
              serverCheckOut = times.last.toString();
            }
          }

          if (mounted) {
            setState(() {
              // Khôi phục trạng thái
              if (serverCheckOut.isNotEmpty) {
                _currentStatus = "CHECK_OUT";
                _displayTime = serverCheckOut;
              } else if (serverCheckIn.isNotEmpty) {
                _currentStatus = "CHECK_IN";
                _displayTime = serverCheckIn;
              } else {
                _currentStatus = "NONE";
                _displayTime = "--:--";
              }

              // Tự động thêm vào lịch sử
              if (_currentStatus != "NONE") {
                final String todayDate =
                    DateTime.now().toString().split(' ')[0];
                bool hasTodayHistory =
                    _history.any((item) => item.date == todayDate);

                if (!hasTodayHistory) {
                  _history.insert(
                      0,
                      AttendanceHistory(
                        date: todayDate,
                        checkIn:
                            serverCheckIn.isNotEmpty ? serverCheckIn : "--:--",
                        checkOut: serverCheckOut.isNotEmpty
                            ? serverCheckOut
                            : "--:--",
                        status:
                            _currentStatus == "CHECK_IN" ? "Vào làm" : "Ra về",
                      ));
                  _saveHistory();
                }
              }
            });
          }
        }
      }
    } catch (e) {
      print("LỖI KẾT NỐI API: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --- 4. LOGIC MQTT ---
  void _setupMqtt() async {
    await _mqttService.initialize();

    _mqttService.onDataReceived = (status, msg, serverTime) async {
      if (!mounted) return;

      final now = DateTime.now();
      final String realTime =
          "${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}";

      // --- CHẶN LẶP LẠI ---
      if (status == "CHECK_IN") {
        if (_currentStatus == "CHECK_IN") {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text("Bạn đã Check-in rồi!"),
            backgroundColor: Colors.redAccent,
          ));
          return;
        }
        if (_currentStatus == "CHECK_OUT") {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text("Bạn đã hoàn thành ca làm việc rồi!"),
            backgroundColor: Colors.redAccent,
          ));
          return;
        }
      }

      if (status == "CHECK_OUT") {
        if (_currentStatus == "CHECK_OUT") {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text("Bạn đã Check-out rồi!"),
            backgroundColor: Colors.redAccent,
          ));
          return;
        }
        if (_currentStatus == "NONE") {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text("Bạn chưa Check-in thì không thể Check-out!"),
            backgroundColor: Colors.redAccent,
          ));
          return;
        }
      }

      // --- XỬ LÝ THÀNH CÔNG ---
      String successMessage = "";
      if (status == "CHECK_IN") {
        successMessage = "Bạn đã Check-in thành công!";
      } else {
        successMessage = "Bạn đã Check-out thành công!";
      }

      setState(() {
        _isLoading = false;
        if (status == "CHECK_IN") {
          _currentStatus = "CHECK_IN";
          _displayTime = realTime;
        } else if (status == "CHECK_OUT") {
          _currentStatus = "CHECK_OUT";
          _displayTime = realTime;
        }
      });

      await NotificationHelper.addNotification(
          successMessage,
          "Ghi nhận lúc $realTime.",
          status == "CHECK_IN" ? "checkin" : "checkout");

      setState(() {
        _history.insert(
            0,
            AttendanceHistory(
              date: DateTime.now().toString().split(' ')[0],
              checkIn: status == "CHECK_IN" ? realTime : "--:--",
              checkOut: status == "CHECK_OUT" ? realTime : "--:--",
              status: status == "CHECK_IN" ? "Vào làm" : "Ra về",
            ));
      });

      _saveHistory();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text("$successMessage (Lúc $realTime)"),
            backgroundColor: Colors.blueAccent),
      );
    };
  }

  // --- 5. WIDGET TRẠNG THÁI (ĐÃ SỬA LỖI Colors -> Icons) ---
  Widget _buildStatusCard() {
    Color cardColor;
    String statusTitle;
    String statusDesc;
    IconData statusIcon; // Đổi type thành IconData

    switch (_currentStatus) {
      case "CHECK_IN":
        cardColor = Colors.orange.shade700;
        statusTitle = "ĐANG LÀM VIỆC";
        statusDesc = "Đã vào lúc $_displayTime.\nĐừng quên Check-out khi về!";
        statusIcon = Icons.timer; // ĐÃ SỬA: Dùng Icons thay vì Colors
        break;
      case "CHECK_OUT":
        cardColor = Colors.green.shade700;
        statusTitle = "ĐÃ HOÀN THÀNH";
        statusDesc = "Đã về lúc $_displayTime.\nHẹn gặp lại bạn vào ngày mai!";
        statusIcon = Icons.check_circle_outline; // ĐÃ SỬA
        break;
      default: // NONE
        cardColor = Colors.blue.shade700;
        statusTitle = "SẴN SÀNG";
        statusDesc = "Vui lòng quét mã để Check-in\nbắt đầu ca làm việc.";
        statusIcon = Icons.login; // ĐÃ SỬA
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: cardColor.withOpacity(0.4),
              blurRadius: 10,
              offset: const Offset(0, 5))
        ],
      ),
      child: Column(
        children: [
          Icon(statusIcon, size: 45, color: Colors.white),
          const SizedBox(height: 10),
          Text(
            statusTitle,
            style: const TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(
            statusDesc,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Xin chào, $_fullName", style: const TextStyle(fontSize: 14)),
            const Text("WOKRIOT-SYSTEM",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const NotificationScreen()),
              );
            },
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchTodayData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Trạng thái hôm nay",
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey)),
                const SizedBox(height: 10),

                // Đã có biến _isLoading, không còn lỗi nữa
                _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _buildStatusCard(),

                const SizedBox(height: 30),
                const Text("Tiện ích",
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey)),
                const SizedBox(height: 10),

                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 15,
                  mainAxisSpacing: 15,
                  childAspectRatio: 1.3,
                  children: [
                    _buildMenuCard(
                        Icons.history, "Lịch sử\nChấm công", Colors.blue, () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) =>
                                  HistoryScreen(historyData: _history)));
                    }),
                    _buildMenuCard(Icons.edit_calendar, "Gửi đơn\nXin nghỉ/OT",
                        Colors.orange, () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => const RequestScreen()));
                    }),
                    _buildMenuCard(
                        Icons.person, "Hồ sơ\ncá nhân", Colors.purple, () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ProfileScreen(
                            fullName: _fullName,
                            userId: _userId,
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuCard(
      IconData icon, String title, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 5)],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 35, color: color),
            const SizedBox(height: 10),
            Text(title,
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
