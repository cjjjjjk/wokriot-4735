import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Import các file của bạn
import '../services/mqtt_service.dart';
import '../models/attendance_model.dart';
import 'history_screen.dart';
import 'request_screen.dart';
import 'login_screen.dart';
import 'profile_screen.dart'; // <--- Đã thêm import ProfileScreen

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

  // Biến trạng thái giao diện
  String _todayStatus = "Chưa Check-in";
  String _lastCheckTime = "--:--";
  Color _statusColor = Colors.grey;
  IconData _statusIcon = Icons.fingerprint;
  bool _isLoading = true;

  final List<AttendanceHistory> _history = [];

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _fetchTodayData();
    _setupMqtt();
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _fullName = prefs.getString('FULL_NAME') ?? "Nhân viên";
      _userId = prefs.getString('USER_ID') ?? "---";
    });
  }

  // --- LOGIC GỌI API ĐỂ LẤY TRẠNG THÁI BAN ĐẦU ---
  Future<void> _fetchTodayData() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('ACCESS_TOKEN');

    if (token == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    try {
      final url = Uri.parse('$baseUrl/api/worked-day/day');
      print("LOG: Đang lấy dữ liệu hôm nay: $url");

      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        String status = "NONE";
        String time = "--:--";

        if (data['check_in'] != null) {
          status = "CHECK_IN";
          time = data['check_in'];
        }
        if (data['check_out'] != null) {
          status = "CHECK_OUT";
          time = data['check_out'];
        }

        _updateUI(status, time);
      }
    } catch (e) {
      print("LOG: Lỗi kết nối API: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --- LOGIC MQTT ---
  void _setupMqtt() async {
    await _mqttService.initialize();

    _mqttService.onDataReceived = (status, msg, time) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
      });

      _updateUI(status, time);

      // Thêm vào lịch sử cục bộ để hiển thị ngay
      setState(() {
        _history.insert(
            0,
            AttendanceHistory(
              date: DateTime.now().toString().split(' ')[0],
              checkIn: status == "CHECK_IN" ? time : "--:--",
              checkOut: status == "CHECK_OUT" ? time : "--:--",
              status: status == "CHECK_IN" ? "Vào làm" : "Ra về",
            ));
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: _statusColor),
      );
    };
  }

  void _updateUI(String status, String time) {
    if (!mounted) return;
    setState(() {
      _lastCheckTime = time;
      if (status == "CHECK_IN") {
        _todayStatus = "Đã vào (Check-in)";
        _statusColor = Colors.green;
        _statusIcon = Icons.login;
      } else if (status == "CHECK_OUT") {
        _todayStatus = "Đã về (Check-out)";
        _statusColor = Colors.orange;
        _statusIcon = Icons.logout;
      } else {
        _todayStatus = "Chưa Check-in";
        _statusColor = Colors.grey;
        _statusIcon = Icons.fingerprint;
      }
    });
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
            // Hiển thị tên thiết bị hoặc tiêu đề app
            const Text("WOKRIOT-4735",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        // --- ĐÃ XÓA MÃ QR Ở ĐÂY THEO YÊU CẦU ---
        actions: [
          // Có thể thêm nút thông báo hoặc cài đặt khác nếu muốn
          IconButton(
              icon: const Icon(Icons.notifications_none), onPressed: () {})
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
                const Text("Hôm nay",
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey)),
                const SizedBox(height: 10),

                // Card Trạng thái
                _isLoading
                    ? const Center(
                        child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: CircularProgressIndicator(),
                      ))
                    : Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(15),
                          boxShadow: [
                            const BoxShadow(
                                color: Colors.black12,
                                blurRadius: 10,
                                offset: Offset(0, 5))
                          ],
                          border: Border(
                              left: BorderSide(color: _statusColor, width: 5)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                  color: _statusColor.withOpacity(0.1),
                                  shape: BoxShape.circle),
                              child: Icon(_statusIcon,
                                  color: _statusColor, size: 30),
                            ),
                            const SizedBox(width: 15),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_todayStatus,
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: _statusColor)),
                                const SizedBox(height: 5),
                                Text("Thời gian: $_lastCheckTime",
                                    style: const TextStyle(
                                        fontSize: 14, color: Colors.grey)),
                              ],
                            )
                          ],
                        ),
                      ),

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
                    // --- NÚT HỒ SƠ CÁ NHÂN ĐÃ ĐƯỢC CẬP NHẬT ---
                    _buildMenuCard(
                        Icons.person, "Hồ sơ\ncá nhân", Colors.purple, () {
                      // Chuyển sang màn hình Profile và truyền dữ liệu
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ProfileScreen(
                            fullName: _fullName, // Truyền tên
                            userId: _userId, // Truyền ID để tạo QR
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
          boxShadow: [const BoxShadow(color: Colors.black12, blurRadius: 5)],
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
