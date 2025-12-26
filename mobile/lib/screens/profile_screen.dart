import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart'; // 1. Import thư viện QR
import '../providers/auth_provider.dart';
import '../screens/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Lấy thông tin user từ Provider
    final authProvider = Provider.of<AuthProvider>(context);
    // Giả lập mã nhân viên (nếu chưa có API thật thì dùng tên đăng nhập làm mã)
    final String employeeCode = authProvider.userName ?? "NV123456";

    return Scaffold(
      appBar: AppBar(
        title: const Text("Hồ sơ cá nhân"),
        centerTitle: true,
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
              authProvider.userName,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const Text("Lập trình viên Mobile",
                style: TextStyle(color: Colors.grey)),

            const SizedBox(height: 30),

            // 👇👇 KHU VỰC HIỂN THỊ MÃ QR
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: const Offset(0, 5))
                ],
              ),
              child: Column(
                children: [
                  const Text("Mã định danh (Quét để chấm công)",
                      style:
                          TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 15),

                  // Widget tạo mã QR
                  QrImageView(
                    data: employeeCode, // Dữ liệu được mã hóa (Mã NV)
                    version: QrVersions.auto,
                    size: 200.0, // Kích thước
                    gapless: false,
                    // Bạn có thể thêm logo vào giữa mã QR nếu thích
                    // embeddedImage: const AssetImage('assets/logo.png'),
                  ),

                  const SizedBox(height: 10),
                  Text(
                    "ID: $employeeCode",
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, letterSpacing: 1.5),
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
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: () {
                  authProvider.logout();
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
