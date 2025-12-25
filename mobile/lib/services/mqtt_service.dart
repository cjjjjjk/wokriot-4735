import 'dart:async';
import 'dart:convert'; // [BẮT BUỘC] Để đọc JSON
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class AttendanceMQTTService {
  // SỬA THÀNH MOSQUITTO
  final String broker = 'test.mosquitto.org';
  final int port = 1883; // Cổng chuẩn của Mosquitto

  // Topic riêng của bạn (nên đặt dài chút để không bị trùng với người khác trên server này)
  final String topicToSubscribe = 'wokriot/attendance/notify/NV001';

  late MqttServerClient client;
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  // Callback báo tin về màn hình Home
  Function(String status, String msg, String time)? onDataReceived;

  Future<void> initialize() async {
    await _setupNotifications();
    await _connectMQTT();
  }

  // 1. Cấu hình thông báo
  Future<void> _setupNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings);

    final platform =
        flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    await platform?.requestNotificationsPermission();
  }

  // 2. Kết nối MQTT (Cấu hình riêng cho Mosquitto)
  Future<void> _connectMQTT() async {
    String clientId = 'flutter_nv001_${DateTime.now().millisecondsSinceEpoch}';
    client = MqttServerClient(broker, clientId);
    client.port = port;
    client.keepAlivePeriod = 60;
    client.logging(on: true); // Bật log lên để xem nó chạy thế nào
    client.onConnected = _onConnected;
    client.onDisconnected = () => print("MQTT: Đã ngắt kết nối");

    final connMess = MqttConnectMessage()
        .withClientIdentifier(clientId)
        .startClean() // Mosquitto thích Clean Session = true
        .withWillQos(MqttQos.atLeastOnce);
    client.connectionMessage = connMess;

    try {
      print('MQTT: Đang kết nối tới $broker...');
      await client.connect();
    } catch (e) {
      print('MQTT: Lỗi kết nối - $e');
      client.disconnect();
    }
  }

  void _onConnected() {
    print('MQTT: === KẾT NỐI THÀNH CÔNG VỚI MOSQUITTO ===');
    client.subscribe(topicToSubscribe, MqttQos.atMostOnce);

    client.updates!.listen((List<MqttReceivedMessage<MqttMessage?>>? c) {
      final MqttPublishMessage recMess = c![0].payload as MqttPublishMessage;
      final String pt =
          MqttPublishPayload.bytesToStringAsString(recMess.payload.message);

      print('MQTT: Nhận tin nhắn: $pt');
      _processMessage(pt);
    });
  }

  // 3. Xử lý tin nhắn
  void _processMessage(String payload) {
    try {
      final data = jsonDecode(payload);

      String status = data['status'] ?? 'UNKNOWN';
      String msg = data['msg'] ?? 'Thông báo chấm công';
      String time = data['time'] ?? '??:??';

      // Hiện thông báo Popup
      _showNotification("WOKRIOT Thông báo", msg);

      // Bắn về Home để đổi màu
      if (onDataReceived != null) {
        onDataReceived!(status, msg, time);
      }
    } catch (e) {
      print("Lỗi JSON: $e");
    }
  }

  Future<void> _showNotification(String title, String body) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'attendance_channel_id',
      'Chấm công',
      importance: Importance.max,
      priority: Priority.high,
    );
    await flutterLocalNotificationsPlugin.show(
        0, title, body, const NotificationDetails(android: androidDetails));
  }
}
