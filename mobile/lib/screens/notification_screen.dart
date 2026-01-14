import 'package:flutter/material.dart';
import '../utils/notification_helper.dart'; // Import file Helper

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final list = await NotificationHelper.getNotifications();
    if (mounted) {
      setState(() {
        _notifications = list;
        _isLoading = false;
      });
    }
  }

  // --- HÀM MỚI: Hộp thoại xác nhận xóa ---
  void _confirmDeleteAll(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Xác nhận xóa"),
        content:
            const Text("Bạn có chắc chắn muốn xóa TẤT CẢ thông báo không?"),
        actions: [
          // Nút KHÔNG
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop(); // Đóng hộp thoại
            },
            child: const Text("Không", style: TextStyle(color: Colors.grey)),
          ),
          // Nút CÓ
          TextButton(
            onPressed: () async {
              // 1. Gọi lệnh xóa trong bộ nhớ máy
              await NotificationHelper.clearAll();

              // 2. Cập nhật giao diện ngay lập tức
              if (mounted) {
                setState(() {
                  _notifications.clear(); // Xóa sạch list đang hiển thị
                });

                Navigator.of(ctx).pop(); // Đóng hộp thoại

                // 3. Hiển thị thông báo nhỏ
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Đã xóa sạch thông báo!")),
                );
              }
            },
            child: const Text("Có, xóa hết",
                style:
                    TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA), // Thêm màu nền cho đẹp
      appBar: AppBar(
        title: const Text("Thông báo", style: TextStyle(color: Colors.black)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Colors.black), // Icon màu đen
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
            onPressed: () {
              // GỌI HÀM XÁC NHẬN TẠI ĐÂY
              if (!_isLoading && _notifications.isNotEmpty) {
                _confirmDeleteAll(context);
              } else if (_notifications.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Danh sách đang trống!")),
                );
              }
            },
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_off_outlined,
                          size: 80, color: Colors.grey[300]),
                      const SizedBox(height: 10),
                      Text("Chưa có thông báo nào",
                          style: TextStyle(color: Colors.grey[500])),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(10),
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final item = _notifications[index];
                    return Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                              color: Colors.grey[100], shape: BoxShape.circle),
                          child: _buildIcon(item.type),
                        ),
                        title: Text(
                          item.title,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(item.body,
                                style: TextStyle(
                                    fontSize: 13, color: Colors.grey[800])),
                            const SizedBox(height: 6),
                            Text(
                              item.time,
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                  fontStyle: FontStyle.italic),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  Widget _buildIcon(String type) {
    if (type == 'checkin') return const Icon(Icons.login, color: Colors.green);
    if (type == 'checkout')
      return const Icon(Icons.logout, color: Colors.orange);
    if (type == 'request')
      return const Icon(Icons.send_to_mobile, color: Colors.blue);
    return const Icon(Icons.notifications, color: Colors.blueGrey);
  }
}
