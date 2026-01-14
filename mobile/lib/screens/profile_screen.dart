import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert'; // Thư viện để mã hóa JSON

import '../screens/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  final String fullName;
  final String userId;

  const ProfileScreen({
    super.key,
    required this.fullName,
    required this.userId,
  });

  // --- HÀM ĐĂNG XUẤT (ĐÃ SỬA) ---
  Future<void> _handleLogout(BuildContext context) async {
    // 1. Hiện hộp thoại hỏi cho chắc chắn
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Đăng xuất"),
        content: const Text("Bạn có chắc chắn muốn đăng xuất không?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Không", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Có, Đăng xuất",
                style:
                    TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    // Nếu người dùng chọn "Không" hoặc bấm ra ngoài thì dừng lại
    if (confirm != true) return;

    // 2. Thực hiện xóa dữ liệu AN TOÀN
    final prefs = await SharedPreferences.getInstance();

    // ⚠️ CHỈ XÓA Token và Info, KHÔNG dùng prefs.clear() để bảo vệ lịch sử
    await prefs.remove('ACCESS_TOKEN');
    await prefs.remove('USER_ID');
    await prefs.remove('FULL_NAME');

    // 3. Chuyển về màn hình đăng nhập
    if (context.mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false, // Xóa hết stack trang cũ
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // --- TẠO DỮ LIỆU JSON CHO QR ---
    // Tạo một object map chứa thông tin
    Map<String, dynamic> qrDataMap = {
      "uid": userId,
      "name": fullName,
      "type": "staff_access",
      "app": "wokriot",
      "timestamp": DateTime.now()
          .millisecondsSinceEpoch
          .toString() // Thêm thời gian để mỗi lần mở QR là một mã mới (bảo mật)
    };

    // Chuyển Map thành chuỗi JSON String
    String qrDataString = jsonEncode(qrDataMap);
    // ----------------------------------

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA), // Màu nền nhẹ nhàng
      appBar: AppBar(
        title: const Text("Hồ sơ cá nhân",
            style: TextStyle(color: Colors.black87)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 20),
            // Avatar
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.blueAccent, width: 2),
              ),
              child: const CircleAvatar(
                radius: 50,
                backgroundColor: Colors.blueAccent,
                child: Icon(Icons.person, size: 60, color: Colors.white),
              ),
            ),
            const SizedBox(height: 15),

            // Tên nhân viên
            Text(
              fullName,
              style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 5),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(20)),
              child: Text("ID: $userId",
                  style: TextStyle(
                      color: Colors.grey[700], fontWeight: FontWeight.bold)),
            ),

            const SizedBox(height: 40),

            // 👇👇 KHU VỰC HIỂN THỊ MÃ QR
            Container(
              padding: const EdgeInsets.all(25),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                      color: Colors.blue.withOpacity(0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 10))
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.qr_code_scanner, color: Colors.blue[700]),
                      const SizedBox(width: 10),
                      const Text("Mã định danh cá nhân",
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Widget tạo mã QR
                  QrImageView(
                    data: qrDataString, // Dùng chuỗi JSON vừa tạo
                    version: QrVersions.auto,
                    size: 220.0,
                    gapless: false,
                    // Có thể thêm logo vào giữa QR nếu muốn
                    // embeddedImage: const AssetImage('assets/images/logo.png'),
                    // embeddedImageStyle: const QrEmbeddedImageStyle(size: Size(40, 40)),
                  ),

                  const SizedBox(height: 15),
                  const Text(
                    "Đưa mã này vào máy quét để chấm công",
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ),
            // 👆👆 HẾT PHẦN QR

            const SizedBox(height: 50),

            // Nút đăng xuất
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.logout_rounded, color: Colors.white),
                label: const Text("Đăng xuất khỏi thiết bị",
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent.shade200,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15))),
                onPressed: () => _handleLogout(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
