import 'package:flutter/material.dart';
import '../models/attendance_model.dart'; // Import model để hiểu dữ liệu

class HistoryScreen extends StatelessWidget {
  // Nhận danh sách lịch sử từ màn hình Home truyền sang
  final List<AttendanceHistory> historyData;

  const HistoryScreen({super.key, required this.historyData});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch sử chấm công')),
      body: historyData.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 80, color: Colors.grey),
                  SizedBox(height: 10),
                  Text("Chưa có dữ liệu chấm công",
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: historyData.length,
              itemBuilder: (context, index) {
                final item = historyData[index];
                final isCheckIn =
                    item.status.contains("Vào"); // Kiểm tra để đổi màu icon

                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isCheckIn
                          ? Colors.green.withOpacity(0.2)
                          : Colors.orange.withOpacity(0.2),
                      child: Icon(
                        isCheckIn ? Icons.login : Icons.logout,
                        color: isCheckIn ? Colors.green : Colors.orange,
                      ),
                    ),
                    title: Text("Ngày: ${item.date}",
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                            "Giờ: ${isCheckIn ? item.checkIn : item.checkOut}"),
                        Text("Trạng thái: ${item.status}"),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
