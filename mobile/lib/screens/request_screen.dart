import 'package:flutter/material.dart';
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Gửi đơn từ"),
        elevation: 1,
      ),
      body: SingleChildScrollView(
        // Dùng SingleChildScrollView để tránh lỗi bàn phím che mất nút
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Chọn loại đơn:",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
              ),
              value: _selectedType,
              items: ['Xin nghỉ phép', 'Xin đi muộn', 'Xin làm thêm giờ (OT)']
                  .map((String value) =>
                      DropdownMenuItem(value: value, child: Text(value)))
                  .toList(),
              onChanged: (val) => setState(() => _selectedType = val!),
            ),
            const SizedBox(height: 25),
            const Text("Lý do (*):",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            TextField(
              controller: _reasonController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: "Nhập lý do chi tiết...",
                hintStyle: TextStyle(color: Colors.grey[400]),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                  elevation: 2,
                ),
                onPressed: () async {
                  // --- 1. KIỂM TRA ĐẦU VÀO (VALIDATION) ---
                  // .trim() để cắt bỏ khoảng trắng thừa ở đầu/cuối
                  if (_reasonController.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Vui lòng nhập lý do trước khi gửi!"),
                        backgroundColor: Colors.red, // Báo lỗi màu đỏ
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                    return; // DỪNG LẠI TẠI ĐÂY, không chạy code bên dưới nữa
                  }
                  // ----------------------------------------

                  // --- 2. LƯU THÔNG BÁO VÀO MÁY ---
                  await NotificationHelper.addNotification(
                      "Gửi đơn thành công",
                      "Bạn đã gửi đơn $_selectedType. Lý do: ${_reasonController.text}",
                      "request");
                  // -----------------------------

                  if (!context.mounted) return;

                  // Hiển thị thông báo thành công
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text("Đã gửi đơn $_selectedType thành công!"),
                      backgroundColor: Colors.green,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );

                  // Quay về màn hình chính
                  Navigator.pop(context);
                },
                child: const Text("GỬI ĐƠN NGAY",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
