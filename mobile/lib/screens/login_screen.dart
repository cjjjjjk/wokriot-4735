import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'home_screen.dart'; // Đảm bảo đã import đúng file HomeScreen

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _isPasswordVisible = false;

  // --- CẤU HÌNH SERVER ---
  // Bạn kiểm tra lại IP nếu cần thiết
  static const String serverIp = '172.23.143.174';
  static const String serverPort = '5000';
  static const String baseUrl = 'http://$serverIp:$serverPort';

  Future<void> _handleLogin() async {
    final email = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      _showSnackBar("Vui lòng nhập Email và Mật khẩu!", isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final url = Uri.parse('$baseUrl/api/login');
      print("LOG: Đang gọi API: $url");

      final response = await http
          .post(
            url,
            headers: {"Content-Type": "application/json"},
            body: jsonEncode({
              "email": email, // Server yêu cầu field là 'email'
              "password": password, // Server yêu cầu field là 'password'
            }),
          )
          .timeout(const Duration(seconds: 10));

      print("LOG: Response Status: ${response.statusCode}");
      print("LOG: Response Body: ${response.body}");

      final bodyJSON = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // --- ĐĂNG NHẬP THÀNH CÔNG ---

        // Cấu trúc Server trả về: { "data": { "token": "...", "user": { "id": 1, ... } } }
        final dataContainer = bodyJSON['data'];

        if (dataContainer != null) {
          final prefs = await SharedPreferences.getInstance();

          // 1. Lấy và Lưu Token
          if (dataContainer['token'] != null) {
            await prefs.setString('ACCESS_TOKEN', dataContainer['token']);
          }

          // 2. Lấy object User (quan trọng: phải chui vào trong key 'user')
          final userObj = dataContainer['user'];

          if (userObj != null) {
            // Lấy ID (chuyển sang String vì server trả về Int)
            String userId = (userObj['id'] ?? '').toString();

            // Lấy Tên (key bên server là 'full_name')
            String fullName = userObj['full_name'] ?? 'Nhân viên';

            // 3. Lưu vào bộ nhớ để HomeScreen và ProfileScreen dùng
            await prefs.setString('USER_ID', userId);
            await prefs.setString('FULL_NAME', fullName);

            print("LOG: Đã lưu -> ID: $userId, Name: $fullName");
          }
        }

        if (!mounted) return;
        _showSnackBar("Đăng nhập thành công!", isError: false);

        // Đợi xíu cho mượt
        await Future.delayed(const Duration(milliseconds: 500));

        // Chuyển màn hình
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const HomeScreen()),
        );
      } else {
        // --- ĐĂNG NHẬP THẤT BẠI ---
        String message = bodyJSON['message'] ?? "Đăng nhập thất bại";
        _showSnackBar(message, isError: true);
      }
    } on SocketException {
      _showSnackBar("Lỗi kết nối mạng. Kiểm tra IP $serverIp", isError: true);
    } on TimeoutException {
      _showSnackBar("Kết nối quá lâu. Server có đang bật không?",
          isError: true);
    } catch (e) {
      print("LOG: Error: $e");
      _showSnackBar("Lỗi ứng dụng: $e", isError: true);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red.shade600 : Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo Area
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.apartment_rounded,
                      size: 60, color: Colors.blue),
                ),
                const SizedBox(height: 20),
                const Text(
                  "WOKRIOT SYSTEM",
                  style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87),
                ),
                const SizedBox(height: 8),
                const Text(
                  "Đăng nhập hệ thống chấm công",
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 40),

                // Input Email
                TextField(
                  controller: _usernameController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText:
                        "Email", // Đã sửa label thành Email cho khớp logic
                    prefixIcon: const Icon(Icons.email_outlined),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                  ),
                ),
                const SizedBox(height: 16),

                // Input Password
                TextField(
                  controller: _passwordController,
                  obscureText: !_isPasswordVisible,
                  decoration: InputDecoration(
                    labelText: "Mật khẩu",
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isPasswordVisible
                            ? Icons.visibility
                            : Icons.visibility_off,
                        color: Colors.grey,
                      ),
                      onPressed: () {
                        setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                  ),
                ),
                const SizedBox(height: 30),

                // Button Login
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 2,
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2),
                          )
                        : const Text(
                            "ĐĂNG NHẬP",
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
