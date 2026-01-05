import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// --- IMPORT CÁC FILE CẦN THIẾT ---
import '../services/mqtt_service.dart';
import '../models/attendance_model.dart';
import '../utils/notification_helper.dart';
import '../config/app_config.dart';
import '../widgets/weekly_chart.dart'; // Import widget biểu đồ mới

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
  String get baseUrl => AppConfig.baseUrl;

  // Biến hiển thị User
  String _fullName = "Đang tải...";
  String _userId = "---";

  // --- QUẢN LÝ TRẠNG THÁI ---
  String _currentStatus = "NONE";
  String _displayTime = "--:--";

  // biến cho ui mới
  bool _isLoading = true;
  Color _statusColor = Colors.grey;
  IconData _statusIcon = Icons.info_outline;
  String _todayStatus = "Chưa có dữ liệu";
  String _lastCheckTime = "--:--";

  // Biến cho Biểu đồ
  List<double> _weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Mặc định 7 ngày = 0
  DateTime _startOfWeek = DateTime.now(); // Ngày bắt đầu tuần

  final List<AttendanceHistory> _history = [];

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _loadHistory();
    _fetchTodayData();
    _fetchWeeklyData();
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
    if (mounted) {
      setState(() {
        _fullName = prefs.getString('FULL_NAME') ?? "Nhân viên";
        _userId = prefs.getString('USER_ID') ?? "---";
      });
    }
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
        final bodyJSON = jsonDecode(response.body);
        final data = bodyJSON['data']; // Dữ liệu nằm trong key 'data'

        String status = "NONE";
        String time = "--:--";

        if (data != null && data['times'] != null) {
          List<dynamic> times = data['times'];
          if (times.isNotEmpty) {
            var lastEntry = times.last; // [time_str, code]
            time = lastEntry[0];

            if (times.length % 2 != 0) {
              status = "CHECK_IN";
            } else {
              status = "CHECK_OUT";
            }
          }
        }

        _updateUI(status, time);
      }
    } catch (e) {
      print("LỖI KẾT NỐI API: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --- HÀM MỚI: LẤY DỮ LIỆU TUẦN ---
  Future<void> _fetchWeeklyData() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('ACCESS_TOKEN');
    if (token == null) return;

    try {
      final now = DateTime.now();

      // KHỚP VỚI WEB: Tuần bắt đầu từ Chủ Nhật (weekday = 7 trong Dart)
      int currentDay = now.weekday % 7; // 0=CN, 1=T2, ...6=T7

      // Tính ngày Chủ Nhật đầu tuần
      DateTime startOfWeek = now.subtract(Duration(days: currentDay));
      // Reset giờ về 0h00
      startOfWeek =
          DateTime(startOfWeek.year, startOfWeek.month, startOfWeek.day);

      DateTime endOfWeek = startOfWeek.add(const Duration(days: 6));
      endOfWeek =
          DateTime(endOfWeek.year, endOfWeek.month, endOfWeek.day, 23, 59, 59);

      // Sử dụng API range mới
      final startDateStr =
          "${startOfWeek.year}-${startOfWeek.month.toString().padLeft(2, '0')}-${startOfWeek.day.toString().padLeft(2, '0')}";
      final endDateStr =
          "${endOfWeek.year}-${endOfWeek.month.toString().padLeft(2, '0')}-${endOfWeek.day.toString().padLeft(2, '0')}";

      final url = Uri.parse(
          '$baseUrl/api/worked-day/range?start_date=$startDateStr&end_date=$endDateStr');
      final response = await http.get(url, headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      });

      if (response.statusCode == 200) {
        final bodyJSON = jsonDecode(response.body);
        final List<dynamic> days = bodyJSON['data']['worked_days'];

        List<double> newWeeklyData = [0, 0, 0, 0, 0, 0, 0];

        for (var dayData in days) {
          DateTime date = DateTime.parse(dayData['date']); // YYYY-MM-DD

          double hours = (dayData['total_times'] ?? 0).toDouble();

          // Map weekday to array index: CN=0, T2=1, ..., T7=6
          int index = date.weekday % 7;
          if (index >= 0 && index < 7) {
            newWeeklyData[index] = hours;
          }
        }

        if (mounted) {
          setState(() {
            _weeklyData = newWeeklyData;
            _startOfWeek = startOfWeek; // Cập nhật ngày bắt đầu tuần (Chủ Nhật)
          });
        }
      }
    } catch (e) {
      print("LOG: Lỗi lấy dữ liệu tuần: $e");
    }
  }

  // --- LOGIC MQTT ---
  void _setupMqtt() async {
    await _mqttService.initialize();

    _mqttService.onDataReceived = (status, msg, time) async {
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

      setState(() => _isLoading = false);
      _updateUI(status, time);

      String notifType = "info";
      String notifTitle = "Thông báo";

      if (status == "CHECK_IN") {
        notifTitle = "Check-in Thành công";
        notifType = "checkin";
      } else if (status == "CHECK_OUT") {
        notifTitle = "Check-out Thành công";
        notifType = "checkout";
      }

      await NotificationHelper.addNotification(
          notifTitle, "Ghi nhận lúc $time. $msg", notifType);

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

  // cập nhật giao diện dựa trên trạng thái
  void _updateUI(String status, String time) {
    if (!mounted) return;

    setState(() {
      _currentStatus = status;
      _displayTime = time;
      _lastCheckTime = time;

      switch (status) {
        case "CHECK_IN":
          _statusColor = Colors.orange.shade700;
          _statusIcon = Icons.timer;
          _todayStatus = "Đang làm việc";
          break;
        case "CHECK_OUT":
          _statusColor = Colors.green.shade700;
          _statusIcon = Icons.check_circle_outline;
          _todayStatus = "Đã hoàn thành";
          break;
        default:
          _statusColor = Colors.blue.shade700;
          _statusIcon = Icons.login;
          _todayStatus = "Sẵn sàng";
      }
    });
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
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.blue.shade100,
              child: Text(
                _fullName.isNotEmpty ? _fullName[0].toUpperCase() : "U",
                style: const TextStyle(
                    color: Colors.blue, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Xin chào, $_fullName",
                    style: const TextStyle(fontSize: 14, color: Colors.grey)),
                const Text("WOKRIOT APP",
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87)),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: Colors.grey.withOpacity(0.2), blurRadius: 5)
                ]),
            child: IconButton(
              icon: const Icon(Icons.notifications_outlined,
                  color: Colors.black54),
              onPressed: () {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const NotificationScreen()));
              },
            ),
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await _fetchTodayData();
          await _fetchWeeklyData();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. CHART AREA (Đã cập nhật)
              WeeklyChartWidget(
                  weeklyData: _weeklyData, startDate: _startOfWeek),

              const SizedBox(height: 24),

              // 2. STATUS CARD
              const Text("Trạng thái hôm nay",
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black54)),
              const SizedBox(height: 12),

              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                                color: _statusColor.withOpacity(0.2),
                                blurRadius: 15,
                                offset: const Offset(0, 8))
                          ],
                          border: Border.all(
                              color: _statusColor.withOpacity(0.1), width: 1)),
                      child: Row(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                                color: _statusColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(15)),
                            child: Icon(_statusIcon,
                                color: _statusColor, size: 30),
                          ),
                          const SizedBox(width: 20),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_todayStatus,
                                  style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: _statusColor)),
                              const SizedBox(height: 5),
                              Row(
                                children: [
                                  const Icon(Icons.access_time,
                                      size: 14, color: Colors.grey),
                                  const SizedBox(width: 4),
                                  Text("Cập nhật: $_lastCheckTime",
                                      style: const TextStyle(
                                          fontSize: 14, color: Colors.grey)),
                                ],
                              ),
                            ],
                          )
                        ],
                      ),
                    ),

              const SizedBox(height: 30),

              // 3. UTILITIES GRID
              const Text("Tiện ích nhanh",
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black54)),
              const SizedBox(height: 12),

              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.5,
                children: [
                  _buildMenuCard(Icons.history_edu, "Lịch sử\nChấm công",
                      Colors.blueAccent, () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) =>
                                HistoryScreen(historyData: _history)));
                  }),
                  _buildMenuCard(
                      Icons.send_rounded, "Gửi đơn\nTừ xa", Colors.orangeAccent,
                      () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const RequestScreen()));
                  }),
                  _buildMenuCard(Icons.person_outline, "Hồ sơ\nCá nhân",
                      Colors.purpleAccent, () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => ProfileScreen(
                                fullName: _fullName, userId: _userId)));
                  }),
                  _buildMenuCard(
                      Icons.settings_outlined, "Cài đặt\nChung", Colors.grey,
                      () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text("Tính năng đang phát triển")));
                  }),
                ],
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuCard(
      IconData icon, String title, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
                color: Colors.grey.withOpacity(0.08),
                blurRadius: 10,
                offset: const Offset(0, 4))
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                  color: color.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(icon, size: 28, color: color),
            ),
            const SizedBox(height: 10),
            Text(title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87)),
          ],
        ),
      ),
    );
  }
}
