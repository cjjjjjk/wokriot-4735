class AppUrls {
  // Thay đổi IP này theo máy tính chạy Backend của bạn
  static const String baseUrl = 'http://192.168.1.10:3000/api'; 
  
  static const String login = '$baseUrl/auth/login';
  static const String attendanceHistory = '$baseUrl/attendance/history';
  static const String requestOt = '$baseUrl/requests/create';
}