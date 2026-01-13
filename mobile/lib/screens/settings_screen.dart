import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // Biến trạng thái cục bộ cho thông báo
  bool _isNotificationEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadLocalSettings();
  }

  // Load trạng thái thông báo từ máy
  Future<void> _loadLocalSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isNotificationEnabled = prefs.getBool('IS_NOTIFY') ?? true;
    });
  }

  // --- XỬ LÝ ĐĂNG XUẤT ---
  void _handleLogout(BuildContext context) async {
    // Hiển thị hộp thoại xác nhận
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Đăng xuất"),
        content: const Text("Bạn có chắc chắn muốn đăng xuất không?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Hủy", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Đồng ý", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    // Nếu người dùng chọn Đồng ý
    if (confirm == true) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('ACCESS_TOKEN'); // Xóa token đăng nhập

      if (!mounted) return;

      // Chuyển về màn hình Login và xóa hết lịch sử trang cũ
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  // --- HIỂN THỊ CHÍNH SÁCH BẢO MẬT ---
  void _showPrivacyPolicy() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2)),
            ),
            Text("Chính sách bảo mật",
                style: Theme.of(context).textTheme.headlineSmall),
            const Divider(),
            const Expanded(
              child: SingleChildScrollView(
                child: Text(
                  "1. Thu thập dữ liệu:\nChúng tôi chỉ thu thập ID nhân viên và dữ liệu chấm công để phục vụ công việc.\n\n"
                  "2. Quyền riêng tư:\nDữ liệu của bạn được bảo mật trên máy chủ nội bộ và không chia sẻ ra bên ngoài.\n\n"
                  "3. Liên hệ:\nNếu có thắc mắc, vui lòng liên hệ bộ phận IT hoặc gửi email về admin@wokriot.com.",
                  style: TextStyle(fontSize: 16, height: 1.5),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Cài đặt"),
        centerTitle: true,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // --- PHẦN 1: CÀI ĐẶT ỨNG DỤNG ---
          _buildHeader("ỨNG DỤNG"),
          Card(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                // 1. Thông báo (Chỉ giữ lại cái này)
                SwitchListTile(
                  secondary: const Icon(Icons.notifications_outlined,
                      color: Colors.orange),
                  title: const Text("Thông báo"),
                  value: _isNotificationEnabled,
                  activeColor: Colors.blue,
                  onChanged: (val) async {
                    setState(() => _isNotificationEnabled = val);
                    // Lưu cài đặt ngay khi bấm
                    final prefs = await SharedPreferences.getInstance();
                    prefs.setBool('IS_NOTIFY', val);
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // --- PHẦN 2: THÔNG TIN ---
          _buildHeader("THÔNG TIN"),
          Card(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.privacy_tip_outlined,
                      color: Colors.grey),
                  title: const Text("Chính sách bảo mật"),
                  trailing: const Icon(Icons.arrow_forward_ios,
                      size: 16, color: Colors.grey),
                  onTap: _showPrivacyPolicy,
                ),
                _buildDivider(),
                const ListTile(
                  leading: Icon(Icons.info_outline, color: Colors.blueGrey),
                  title: Text("Phiên bản ứng dụng"),
                  trailing:
                      Text("v1.0.0", style: TextStyle(color: Colors.grey)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 40),

          // --- NÚT ĐĂNG XUẤT ---
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.withOpacity(0.1),
              foregroundColor: Colors.red,
              elevation: 0,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => _handleLogout(context),
            child: const Text(
              "Đăng xuất",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),

          const SizedBox(height: 20),
          const Center(
            child: Text(
              "WOKRIOT SYSTEM © 2026",
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  // Widget tiêu đề nhỏ
  Widget _buildHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(title,
          style: const TextStyle(
              fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 13)),
    );
  }

  // Widget đường kẻ
  Widget _buildDivider() {
    return const Divider(height: 1, indent: 16, endIndent: 16, thickness: 0.5);
  }
}
