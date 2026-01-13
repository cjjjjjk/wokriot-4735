import 'dart:io';
import 'package:flutter/foundation.dart'; // Để dùng kIsWeb
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get serverIp {
    // 1. Web ->localhost
    if (kIsWeb) {
      return '127.0.0.1';
    }

    // 2. Android
    if (Platform.isAndroid) {
      return dotenv.env['SERVER_IP'] ?? '10.0.2.2';
    }

    // 3. iOS/Windows/Linux -> localhost
    return '192.168.1.59';
  }

  static String get serverPort => dotenv.env['SERVER_PORT'] ?? '5000';
  static String get baseUrl => 'http://$serverIp:$serverPort';
}
