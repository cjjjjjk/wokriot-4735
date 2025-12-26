import 'package:flutter/material.dart';
import '../services/mqtt_service.dart';
import '../models/attendance_model.dart'; // đã có file model
import 'history_screen.dart'; // tồn tại trong cùng thư mục screens
import 'request_screen.dart'; // tồn tại trong cùng thư mục screens

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final AttendanceMQTTService _mqttService = AttendanceMQTTService();

  // Biến trạng thái giao diện
  String _todayStatus = "Chưa Check-in";
  String _lastCheckTime = "--:--";
  Color _statusColor = Colors.grey;
  IconData _statusIcon = Icons.fingerprint;

  // Danh sách lịch sử tạm thời
  final List<AttendanceHistory> _history = [];

  @override
  void initState() {
    super.initState();
    _setupMqtt();
  }

  // Cấu hình MQTT để nghe tin nhắn
  void _setupMqtt() async {
    await _mqttService.initialize();

    // Hứng dữ liệu từ file service bắn sang
    _mqttService.onDataReceived = (status, msg, time) {
      if (!mounted) return; // Nếu màn hình đã đóng thì không làm gì cả

      setState(() {
        _lastCheckTime = time;

        // Lưu vào lịch sử
        _history.insert(
            0,
            AttendanceHistory(
              date: DateTime.now().toString().split(' ')[0],
              checkIn: status == "CHECK_IN" ? time : "--:--",
              checkOut: status == "CHECK_OUT" ? time : "--:--",
              status: status == "CHECK_IN" ? "Vào làm" : "Ra về",
            ));

        // Cập nhật giao diện thẻ màu
        if (status == "CHECK_IN") {
          _todayStatus = "Đã vào (Check-in)";
          _statusColor = Colors.green;
          _statusIcon = Icons.login;
        } else if (status == "CHECK_OUT") {
          _todayStatus = "Đã về (Check-out)";
          _statusColor = Colors.orange;
          _statusIcon = Icons.logout;
        }
      });

      // Hiện thông báo nhỏ bên dưới màn hình (SnackBar)
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: _statusColor),
      );
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Xin chào, Ngân Văn Thiện", style: TextStyle(fontSize: 14)),
            Text("WOKRIOT-4735",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_2),
            onPressed: () {
              // Chỗ này tạm thời để trống hoặc hiện Dialog
              showDialog(
                  context: context,
                  builder: (c) => const AlertDialog(
                      title: Text("Mã QR của tôi"),
                      content: Icon(Icons.qr_code, size: 100)));
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- PHẦN 1: CARD TRẠNG THÁI  ---
              const Text("Hôm nay",
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey)),
              const SizedBox(height: 10),

              Container(
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
                  border:
                      Border(left: BorderSide(color: _statusColor, width: 5)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                          color: _statusColor.withOpacity(0.1),
                          shape: BoxShape.circle),
                      child: Icon(_statusIcon, color: _statusColor, size: 30),
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

              // --- PHẦN 2: MENU DẠNG LƯỚI (GRID) ---
              const Text("Tiện ích",
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey)),
              const SizedBox(height: 10),

              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2, // 2 cột
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
                      Icons.person, "Hồ sơ\ncá nhân", Colors.purple, () {}),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Widget con để vẽ nút bấm Menu
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
