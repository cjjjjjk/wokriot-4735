// File: lib/utils/notification_helper.dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationModel {
  final String title;
  final String body;
  final String time;
  final String type; // 'checkin', 'checkout', 'request', 'info'

  NotificationModel({
    required this.title,
    required this.body,
    required this.time,
    required this.type,
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'body': body,
        'time': time,
        'type': type,
      };

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      title: json['title'],
      body: json['body'],
      time: json['time'],
      type: json['type'],
    );
  }
}

class NotificationHelper {
  static const String _key = 'LOCAL_NOTIFICATIONS';

  static Future<List<NotificationModel>> getNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_key);
    if (data == null) return [];
    final List<dynamic> decoded = jsonDecode(data);
    return decoded.map((e) => NotificationModel.fromJson(e)).toList();
  }

  static Future<void> addNotification(
      String title, String body, String type) async {
    final prefs = await SharedPreferences.getInstance();
    final List<NotificationModel> currentList = await getNotifications();

    final newNotif = NotificationModel(
      title: title,
      body: body,
      time: DateTime.now().toString().substring(0, 16),
      type: type,
    );

    currentList.insert(0, newNotif); // Thêm vào đầu danh sách
    final String encoded =
        jsonEncode(currentList.map((e) => e.toJson()).toList());
    await prefs.setString(_key, encoded);
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
