import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Import các file cần thiết (Đảm bảo đường dẫn đúng)
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        // Khởi tạo AuthProvider và kiểm tra trạng thái đăng nhập ngay lập tức
        ChangeNotifierProvider(
            create: (_) => AuthProvider()..checkLoginStatus()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WOKRIOT Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      // Logic điều hướng: Đã đăng nhập -> Home, Chưa -> Login
      home: Consumer<AuthProvider>(
        builder: (context, auth, child) {
          if (auth.isAuthenticated) {
            return const HomeScreen();
          } else {
            return const LoginScreen();
          }
        },
      ),
    );
  }
}
