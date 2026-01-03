import 'package:flutter/material.dart';
import '../utils/notification_helper.dart'; // Import file vừa tạo ở Bước 1

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
    setState(() {
      _notifications = list;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Thông báo"),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: () async {
              await NotificationHelper.clearAll(); // Xóa hết
              _loadData(); // Load lại
            },
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text("Chưa có thông báo nào"))
              : ListView.builder(
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final item = _notifications[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      child: ListTile(
                        leading: _buildIcon(item.type),
                        title: Text(item.title,
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.body),
                            const SizedBox(height: 5),
                            Text(item.time,
                                style: const TextStyle(
                                    fontSize: 12, color: Colors.grey)),
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
    if (type == 'request') return const Icon(Icons.send, color: Colors.blue);
    return const Icon(Icons.notifications);
  }
}
