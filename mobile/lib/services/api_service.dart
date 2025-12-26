import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // ⚠️ QUAN TRỌNG: Thay đổi IP này theo máy tính chạy Backend của bạn
  // - Nếu chạy trên máy ảo Android (Emulator): dùng 'http://10.0.2.2:3000/api'
  // - Nếu chạy trên điện thoại thật: dùng IP LAN của máy tính (VD: 'http://192.168.1.15:3000/api')
  // - Đừng dùng 'localhost' nếu chạy trên điện thoại/máy ảo!
  // SỬA LẠI DÒNG NÀY:
  static const String baseUrl = 'http://192.168.1.59:3000/api';

  // 1. Hàm Đăng nhập
  static Future<bool> login(String username, String password) async {
    try {
      final url = Uri.parse('$baseUrl/auth/login');

      // Gửi request POST
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        // Nếu thành công -> Lưu token vào máy
        final data = jsonDecode(response.body);
        final String token =
            data['token']; // Giả sử Backend trả về key là 'token'

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('username', username);

        return true; // Đăng nhập thành công
      } else {
        print('Lỗi đăng nhập: ${response.body}');
        return false; // Sai tài khoản/mật khẩu
      }
    } catch (e) {
      print('Lỗi kết nối: $e');
      return false; // Lỗi mạng hoặc server sập
    }
  }

  // 2. Hàm lấy Header kèm Token (Dùng cho các request cần bảo mật)
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token', // Gửi kèm token chuẩn JWT
    };
  }

  // 3. Lấy thông tin User (Profile)
  static Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final url = Uri.parse('$baseUrl/user/profile');
      final headers = await _getHeaders();

      final response = await http.get(url, headers: headers);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Lỗi lấy profile: $e');
    }
    return null;
  }

  // 4. Lấy lịch sử chấm công
  static Future<List<dynamic>> getAttendanceHistory() async {
    try {
      final url = Uri.parse('$baseUrl/attendance/history');
      final headers = await _getHeaders();

      final response = await http.get(url, headers: headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Giả sử server trả về list trong key 'data' hoặc trả về list trực tiếp
        return data['data'] ?? [];
      }
    } catch (e) {
      print('Lỗi lấy lịch sử: $e');
    }
    return []; // Trả về rỗng nếu lỗi
  }

  // 5. Gửi đơn xin phép (OT/Nghỉ...)
  static Future<bool> sendRequest(
      String type, String reason, String date) async {
    try {
      final url = Uri.parse('$baseUrl/requests/create');
      final headers = await _getHeaders();

      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'type': type,
          'reason': reason,
          'date': date,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Lỗi gửi đơn: $e');
      return false;
    }
  }

  // 6. Đăng xuất (Xóa token)
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
