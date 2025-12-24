import 'package:flutter/material.dart';
import 'login_screen.dart'; // Để dùng cho nút Đăng xuất
import 'history_screen.dart';
import 'request_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Dữ liệu giả lập (Sau này sẽ lấy từ API)
  String userName = "Nguyễn Văn A";
  String studentId = "SV001";
  bool isCheckedIn = true; // Thử đổi thành false để xem giao diện thay đổi
  String checkInTime = "07:55 AM";
  String checkOutTime = "--:--";

  // Hàm xử lý đăng xuất
  void _handleLogout() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100], // Màu nền nhẹ
      appBar: AppBar(
        title: const Text("WOKRIOT Dashboard"),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            onPressed: _handleLogout,
            tooltip: "Đăng xuất",
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Phần chào hỏi (Đã thêm sự kiện bấm)
            InkWell(
              onTap: () {
                // Chuyển sang trang Profile
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const ProfileScreen()),
                );
              },
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.blue,
                    // Thử thêm ảnh avatar nếu muốn, không thì để icon mặc định
                    child: Icon(Icons.person, size: 35, color: Colors.white),
                  ),
                  const SizedBox(width: 15),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Xin chào, $userName",
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold)),
                      Text("MSNV: $studentId",
                          style: const TextStyle(color: Colors.grey)),
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 25),

            // 2. Thẻ trạng thái chấm công (Quan trọng nhất)
            const Text("Hôm nay",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                // Đổi màu nền dựa trên trạng thái (Xanh lá / Cam)
                color: isCheckedIn ? Colors.green[600] : Colors.orange[400],
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.3),
                    spreadRadius: 2,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Icon(
                    isCheckedIn
                        ? Icons.check_circle_outline
                        : Icons.access_time,
                    size: 50,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    isCheckedIn ? "ĐÃ CHECK-IN THÀNH CÔNG" : "CHƯA CHECK-IN",
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 15),
                  // Hiển thị giờ
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildTimeInfo("Giờ vào", checkInTime),
                      Container(height: 40, width: 1, color: Colors.white54),
                      _buildTimeInfo("Giờ ra", checkOutTime),
                    ],
                  )
                ],
              ),
            ),

            const SizedBox(height: 25),

            // 3. Grid Menu chức năng
            const Text("Chức năng",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),

            GridView.count(
              shrinkWrap: true, // Để Grid nằm gọn trong ScrollView
              physics:
                  const NeverScrollableScrollPhysics(), // Không cuộn riêng lẻ
              crossAxisCount: 2, // 2 cột
              crossAxisSpacing: 15,
              mainAxisSpacing: 15,
              childAspectRatio: 1.3, // Tỷ lệ chiều rộng/cao
              children: [
                _buildMenuCard(
                    icon: Icons.history,
                    title: "Lịch sử",
                    color: Colors.blue,
                    onTap: () {
                      // Lệnh chuyển trang
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const HistoryScreen()),
                      );
                    }),
                _buildMenuCard(
                    icon: Icons.edit_calendar,
                    title: "Xin nghỉ / OT",
                    color: Colors.orange,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const RequestScreen()),
                      );
                    }),
                _buildMenuCard(
                    icon: Icons.notifications,
                    title: "Thông báo",
                    color: Colors.purple,
                    onTap: () {}),
                _buildMenuCard(
                    icon: Icons.settings,
                    title: "Cài đặt",
                    color: Colors.grey,
                    onTap: () {}),
              ],
            )
          ],
        ),
      ),
    );
  }

  // Widget con để hiển thị Giờ check-in/out
  Widget _buildTimeInfo(String label, String time) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white70)),
        const SizedBox(height: 5),
        Text(time,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold)),
      ],
    );
  }

  // Widget con để tạo các nút menu
  Widget _buildMenuCard(
      {required IconData icon,
      required String title,
      required Color color,
      required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(15),
      child: Container(
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
            boxShadow: [
              BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 3)
            ]),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 30, color: color),
            ),
            const SizedBox(height: 10),
            Text(title,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
