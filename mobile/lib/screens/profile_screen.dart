import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Để xóa cache khi logout
import 'dart:convert'; // <--- 1. Thêm thư viện này để tạo chuỗi JSON

import '../screens/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  // Khai báo biến để nhận dữ liệu từ HomeScreen gửi sang
  final String fullName;
  final String userId;

  const ProfileScreen({
    super.key,
    required this.fullName,
    required this.userId,
  });

  // Hàm xử lý Đăng xuất
  Future<void> _handleLogout(BuildContext context) async {
    // a. Xóa dữ liệu lưu trong máy
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Xóa hết token, user_id, full_name...

    // b. Chuyển hướng về màn hình đăng nhập và xóa sạch lịch sử trang cũ
    if (context.mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false, // Xóa hết các trang trước đó khỏi stack
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // --- 2. TẠO DỮ LIỆU JSON CHO QR ---
    // Đóng gói thông tin thành chuỗi JSON để QR chứa nhiều dữ liệu hơn
    String qrData = jsonEncode({
      "uid": userId,
      "name": fullName,
      "type": "staff_access", // Đánh dấu đây là mã nhân viên
      "app": "wokriot",
      "timestamp": DateTime.now()
          .millisecondsSinceEpoch
          .toString() // Thêm thời gian (tùy chọn) để tăng tính bảo mật
    });
    // ----------------------------------

    return Scaffold(
      appBar: AppBar(
        title: const Text("Hồ sơ cá nhân"),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar
            const CircleAvatar(
              radius: 50,
              backgroundColor: Colors.blueAccent,
              child: Icon(Icons.person, size: 60, color: Colors.white),
            ),
            const SizedBox(height: 15),

            // Tên nhân viên
            Text(
              fullName,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 5),
            Text("Mã NV: $userId", style: const TextStyle(color: Colors.grey)),

            const SizedBox(height: 30),

            // 👇👇 KHU VỰC HIỂN THỊ MÃ QR
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: const [
                  BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, 5))
                ],
              ),
              child: Column(
                children: [
                  const Text("Mã định danh (Quét để chấm công)",
                      style:
                          TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 20),

                  // Widget tạo mã QR
                  QrImageView(
                    data: qrData, // <--- SỬA QUAN TRỌNG: Dùng chuỗi JSON
                    version: QrVersions.auto,
                    size: 200.0,
                    gapless: false,
                    backgroundColor: Colors.white,
                  ),

                  const SizedBox(height: 15),
                  // Vẫn hiển thị ID dạng chữ cho dễ đọc (dù QR chứa cả JSON)
                  Text(
                    "ID: $userId",
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                        fontSize: 18),
                  ),
                ],
              ),
            ),
            // 👆👆 HẾT PHẦN QR

            const SizedBox(height: 40),

            // Nút đăng xuất
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.logout, color: Colors.white),
                label: const Text("Đăng xuất"),
                style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10))),
                onPressed: () => _handleLogout(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
