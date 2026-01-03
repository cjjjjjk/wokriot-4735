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

  // Biến trạng thái giao diện
  String _todayStatus = "Chưa Check-in";
  String _lastCheckTime = "--:--";
  Color _statusColor = Colors.grey;
  IconData _statusIcon = Icons.fingerprint;
  bool _isLoading = true;

  // Biến cho Biểu đồ
  List<double> _weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Mặc định 7 ngày = 0
  DateTime _startOfWeek = DateTime.now(); // Ngày bắt đầu tuần

  final List<AttendanceHistory> _history = [];

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _fetchTodayData();
    _fetchWeeklyData();
    _setupMqtt();
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
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
      ).timeout(const Duration(seconds: 5));

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
      print("LOG: Lỗi kết nối API: $e");
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
