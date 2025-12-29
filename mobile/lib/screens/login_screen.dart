import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'home_screen.dart';

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
  // Đã sửa lại đúng theo ý bạn
  static const String serverIp = '172.23.143.174';
  static const String serverPort = '5000';
  static const String baseUrl = 'http://$serverIp:$serverPort';

  Future<void> _handleLogin() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      _showSnackBar("Vui lòng nhập tài khoản và mật khẩu!", isError: true);
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
              "email": username,
              "password": password,
            }),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // --- THÀNH CÔNG ---
        final prefs = await SharedPreferences.getInstance();

        if (data['token'] != null) {
          await prefs.setString('ACCESS_TOKEN', data['token']);
        }

        final userData = data['data'];
        if (userData != null) {
          await prefs.setString('USER_ID',
              (userData['id'] ?? userData['user_id'] ?? '').toString());
          await prefs.setString('FULL_NAME',
              userData['name'] ?? userData['full_name'] ?? 'Nhân viên');
        }

        if (!mounted) return;
        _showSnackBar("Đăng nhập thành công!", isError: false);
        await Future.delayed(const Duration(milliseconds: 500));

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const HomeScreen()),
        );
      } else {
        String message = data['message'] ?? "Đăng nhập thất bại";
        _showSnackBar(message, isError: true);
      }
    } on SocketException {
      _showSnackBar(
          "Không thể kết nối đến Server ($serverIp). Hãy kiểm tra Wifi.",
          isError: true);
    } on TimeoutException {
      _showSnackBar("Kết nối quá lâu (Timeout). Server có đang bật không?",
          isError: true);
    } catch (e) {
      print("LOG: Lỗi không xác định: $e");
      _showSnackBar("Đã có lỗi xảy ra: $e", isError: true);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
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
                TextField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    labelText: "Tài khoản (Email)",
                    prefixIcon: const Icon(Icons.person_outline),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                  ),
                ),
                const SizedBox(height: 16),
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
