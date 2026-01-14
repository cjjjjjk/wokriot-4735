import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  // Đợi binding init xong mới gọi được code async
  WidgetsFlutterBinding.ensureInitialized();

  // Load biến môi trường
  await dotenv.load(fileName: ".env");

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WOKRIOT App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.grey[100],
      ),
      home: const LoginScreen(), // Bắt đầu từ Login
    );
  }
}
