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
                  if (_reasonController.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Vui lòng nhập lý do trước khi gửi!"),
                        backgroundColor: Colors.red,
                        behavior: SnackBarBehavior.floating,
                        duration: Duration(
                            milliseconds: 1000), // Lỗi thì hiện 1s cho kịp đọc
                      ),
                    );
                    return;
                  }

                  // --- 2. LƯU THÔNG BÁO VÀO MÁY ---
                  await NotificationHelper.addNotification(
                      "Gửi đơn thành công",
                      "Bạn đã gửi đơn $_selectedType. Lý do: ${_reasonController.text}",
                      "request");

                  if (!context.mounted) return;

                  // --- 3. HIỂN THỊ THÔNG BÁO THÀNH CÔNG (0.5s) ---
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text("Đã gửi đơn $_selectedType thành công!"),
                      backgroundColor: Colors.green,
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(
                          milliseconds: 500), // <--- ĐÃ SỬA: 0.5 giây
                    ),
                  );

                  // --- 4. ĐỢI 0.5s RỒI MỚI ĐÓNG MÀN HÌNH ---
                  // (Để người dùng kịp nhìn thấy thông báo trước khi quay về trang chủ)
                  await Future.delayed(const Duration(milliseconds: 500));

                  if (context.mounted) {
                    Navigator.pop(context);
                  }
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
