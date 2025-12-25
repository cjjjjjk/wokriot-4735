import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  String _userName = "admin"; // Biến lưu tên người dùng

  // 👇 Getter này chính là cái bạn đang thiếu
  String get userName => _userName;
  bool get isAuthenticated => _isAuthenticated;

  // Kiểm tra xem đã đăng nhập chưa khi mở app
  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _isAuthenticated = prefs.getBool('isLoggedIn') ?? false;
    _userName = prefs.getString('username') ?? "Khách"; // Lấy tên từ bộ nhớ
    notifyListeners();
  }

  // Hàm đăng nhập
  Future<bool> login(String username, String password) async {
    // Giả lập check pass (Sau này sẽ gọi API thật ở đây)
    if (username == "admin" && password == "123456") {
      _isAuthenticated = true;
      _userName = username; // Lưu lại tên người dùng

      // Lưu vào bộ nhớ máy để lần sau không phải nhập lại
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLoggedIn', true);
      await prefs.setString('username', username);

      notifyListeners();
      return true;
    }
    return false;
  }

  // Hàm đăng xuất
  Future<void> logout() async {
    _isAuthenticated = false;
    _userName = "Khách";

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Xóa sạch bộ nhớ

    notifyListeners();
  }
}
