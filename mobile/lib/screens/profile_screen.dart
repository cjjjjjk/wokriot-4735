import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:convert'; // Thư viện để mã hóa JSON

class ProfileScreen extends StatelessWidget {
  final String fullName;
  final String userId;

  const ProfileScreen({
    super.key,
    required this.fullName,
    required this.userId,
  });

  @override
  Widget build(BuildContext context) {
    // --- TẠO DỮ LIỆU JSON CHO QR (GIỮ NGUYÊN) ---
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

            // 👇👇 KHU VỰC HIỂN THỊ MÃ QR (GIỮ NGUYÊN)
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

            // ĐÃ XÓA NÚT ĐĂNG XUẤT Ở ĐÂY
            const SizedBox(height: 50),
          ],
        ),
      ),
    );
  }
}
