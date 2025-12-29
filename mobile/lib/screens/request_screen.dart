import 'package:flutter/material.dart';
// 1. Import helper vừa tạo
import '../utils/notification_helper.dart';

class RequestScreen extends StatefulWidget {
  const RequestScreen({super.key});

  @override
  State<RequestScreen> createState() => _RequestScreenState();
}

class _RequestScreenState extends State<RequestScreen> {
  String _selectedType = 'Xin nghỉ phép';
  final TextEditingController _reasonController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Gửi đơn từ"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Chọn loại đơn:",
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(border: OutlineInputBorder()),
              value: _selectedType,
              items: ['Xin nghỉ phép', 'Xin đi muộn', 'Xin làm thêm giờ (OT)']
                  .map((String value) =>
                      DropdownMenuItem(value: value, child: Text(value)))
                  .toList(),
              onChanged: (val) => setState(() => _selectedType = val!),
            ),
            const SizedBox(height: 20),
            const Text("Lý do:", style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: _reasonController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: "Nhập lý do chi tiết...",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                // 2. Thêm từ khóa async để dùng await
                onPressed: () async {
                  // --- LƯU THÔNG BÁO VÀO MÁY ---
                  await NotificationHelper.addNotification(
                      "Gửi đơn thành công",
                      "Bạn đã gửi đơn $_selectedType. Lý do: ${_reasonController.text}",
                      "request");
                  // -----------------------------

                  if (!context.mounted) return;

                  // Hiển thị thông báo (SnackBar)
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text("Đã gửi đơn $_selectedType thành công!"),
                      backgroundColor: Colors.green,
                    ),
                  );

                  // Quay về màn hình chính
                  Navigator.pop(context);
                },
                child: const Text("GỬI ĐƠN NGAY",
                    style: TextStyle(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
