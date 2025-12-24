import 'package:flutter/material.dart';
import 'login_screen.dart'; // Để dùng cho nút Đăng xuất

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // Mock Data (Dữ liệu giả lập)
  final String userName = "Nguyễn Văn A";
  final String studentId = "SV20194735";
  final String className = "Kỹ thuật máy tính K64";
  final String email = "a.nguyenvan@sis.hust.edu.vn";
  final String phoneNumber = "0988 123 456";
  final String rfidCode = "A3-E4-11-89"; // Mã thẻ từ giả lập

  // Hàm xử lý đăng xuất
  void _handleLogout(BuildContext context) {
    // Xóa stack và về màn login
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (Route<dynamic> route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Thông tin cá nhân"),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 1. Header: Avatar + Tên
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(bottom: 30),
              decoration: const BoxDecoration(
                color: Colors.blue,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const CircleAvatar(
                      radius: 50,
                      backgroundImage: NetworkImage(
                          "https://i.pravatar.cc/300"), // Ảnh mạng giả lập
                      // Nếu lỗi mạng sẽ hiện màu xám
                      backgroundColor: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    userName,
                    style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    studentId,
                    style: const TextStyle(fontSize: 16, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 2. Danh sách thông tin
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildInfoTile(Icons.class_, "Lớp / Ngành", className),
                  _buildInfoTile(Icons.email, "Email", email),
                  _buildInfoTile(Icons.phone, "Số điện thoại", phoneNumber),

                  const Divider(height: 30, thickness: 1),

                  // Phần quan trọng của đồ án IoT
                  _buildInfoTile(Icons.nfc, "Mã thẻ RFID", rfidCode,
                      isHighlight: true),

                  const SizedBox(height: 30),

                  // 3. Nút chức năng
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: () => _handleLogout(context),
                      icon: const Icon(Icons.logout, color: Colors.red),
                      label: const Text("Đăng xuất",
                          style: TextStyle(color: Colors.red)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.red),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  // Widget con để hiển thị từng dòng thông tin
  Widget _buildInfoTile(IconData icon, String title, String value,
      {bool isHighlight = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: isHighlight ? Colors.orange[50] : Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: isHighlight ? Border.all(color: Colors.orange) : null,
      ),
      child: Row(
        children: [
          Icon(icon,
              color: isHighlight ? Colors.orange : Colors.blueGrey, size: 28),
          const SizedBox(width: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(color: Colors.grey, fontSize: 12)),
              const SizedBox(height: 4),
              Text(value,
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isHighlight ? Colors.deepOrange : Colors.black87)),
            ],
          )
        ],
      ),
    );
  }
}
