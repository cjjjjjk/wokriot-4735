import 'dart:convert';

class AttendanceHistory {
  final String date;
  final String checkIn;
  final String checkOut;
  final String status;

  AttendanceHistory({
    required this.date,
    required this.checkIn,
    required this.checkOut,
    required this.status,
  });

  // 1. Hàm chuyển từ Object sang JSON (để lưu)
  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'checkIn': checkIn,
      'checkOut': checkOut,
      'status': status,
    };
  }

  // 2. Hàm chuyển từ JSON sang Object (để đọc)
  factory AttendanceHistory.fromJson(Map<String, dynamic> json) {
    return AttendanceHistory(
      date: json['date'] ?? '',
      checkIn: json['checkIn'] ?? '--:--',
      checkOut: json['checkOut'] ?? '--:--',
      status: json['status'] ?? '',
    );
  }

  // 3. Helper để mã hóa list thành chuỗi String
  static String encode(List<AttendanceHistory> list) => json.encode(
        list.map<Map<String, dynamic>>((item) => item.toJson()).toList(),
      );

  // 4. Helper để giải mã chuỗi String thành list
  static List<AttendanceHistory> decode(String listString) =>
      (json.decode(listString) as List<dynamic>)
          .map<AttendanceHistory>((item) => AttendanceHistory.fromJson(item))
          .toList();
}
