import 'package:flutter/material.dart';
import 'package:provider/provider.dart'; // Import thư viện Provider
import '../providers/auth_provider.dart'; // Import logic Auth

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isObscure = true;
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;

  void _handleLogin() async {
    // 1. Lấy dữ liệu từ ô nhập
    String username = _usernameController.text;
    String password = _passwordController.text;

    setState(() {
      _isLoading = true; // Hiện vòng xoay loading
    });

    // 2. GỌI QUA AUTH PROVIDER (Thay vì gọi ApiService trực tiếp)
    // Đây là bước quan trọng nhất để dùng được tính năng "Đăng nhập giả lập"
    bool success = await context.read<AuthProvider>().login(username, password);

    setState(() {
      _isLoading = false; // Tắt loading
    });

    if (success) {
      // Nếu thành công, không cần làm gì cả.
      // Vì main.dart đang lắng nghe, nó sẽ tự động chuyển sang HomeScreen
    } else {
      // Báo lỗi
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Đăng nhập thất bại! Kiểm tra lại tài khoản/mật khẩu."),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 50),
              const Center(
                child: Icon(Icons.lock_clock, size: 80, color: Colors.blue),
              ),
              const SizedBox(height: 20),
              const Center(
                child: Text(
                  "WOKRIOT-4735",
                  style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue),
                ),
              ),
              const SizedBox(height: 50),
              TextField(
                controller: _usernameController,
                decoration: InputDecoration(
                  labelText: "Tài khoản (admin)",
                  prefixIcon: const Icon(Icons.person),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _passwordController,
                obscureText: _isObscure,
                decoration: InputDecoration(
                  labelText: "Mật khẩu (123456)",
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(
                        _isObscure ? Icons.visibility : Icons.visibility_off),
                    onPressed: () => setState(() => _isObscure = !_isObscure),
                  ),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
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
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          "ĐĂNG NHẬP",
                          style: TextStyle(
                              fontSize: 18,
                              color: Colors.white,
                              fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
