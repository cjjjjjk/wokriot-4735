import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; // Thư viện xử lý ngày tháng

class RequestScreen extends StatefulWidget {
  const RequestScreen({super.key});

  @override
  State<RequestScreen> createState() => _RequestScreenState();
}

class _RequestScreenState extends State<RequestScreen> {
  final _formKey = GlobalKey<FormState>();

  // Các biến lưu dữ liệu form
  String _selectedType = 'Xin đi muộn'; // Mặc định
  final TextEditingController _reasonController = TextEditingController();
  final TextEditingController _dateController = TextEditingController();

  // Danh sách các loại đơn
  final List<String> _requestTypes = [
    'Xin đi muộn',
    'Xin về sớm',
    'Xin nghỉ phép',
    'Đăng ký OT (Làm thêm)',
    'Quên Check-in/out'
  ];

  @override
  void initState() {
    super.initState();
    // Tự động điền ngày hôm nay vào ô chọn ngày
    _dateController.text = DateFormat('dd/MM/yyyy').format(DateTime.now());
  }

  // Hàm hiển thị lịch để chọn ngày
  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2024),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        _dateController.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  // Hàm xử lý khi bấm Gửi
  void _submitRequest() {
    if (_formKey.currentState!.validate()) {
      // Mockup logic gửi đơn
      // Sau này sẽ gọi API: POST /api/requests

      // Hiển thị loading giả
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đang gửi đơn...')),
      );

      // Giả lập delay 1 giây rồi báo thành công
      Future.delayed(const Duration(seconds: 1), () {
        if (!mounted) return;

        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text("Thành công"),
            content: const Text("Đơn của bạn đã được gửi và đang chờ duyệt."),
            icon: const Icon(Icons.check_circle, color: Colors.green, size: 50),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Đóng Dialog
                  Navigator.pop(context); // Quay về màn hình chính
                },
                child: const Text("Đóng"),
              )
            ],
          ),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Tạo đơn mới"),
        backgroundColor:
            Colors.orange, // Màu cam cho khác biệt với các trang kia
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Thông tin đơn",
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.blueGrey)),
              const SizedBox(height: 20),

              // 1. Dropdown chọn loại đơn
              DropdownButtonFormField<String>(
                value: _selectedType,
                decoration: InputDecoration(
                  labelText: "Loại yêu cầu",
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
                  prefixIcon: const Icon(Icons.category),
                ),
                items: _requestTypes.map((String type) {
                  return DropdownMenuItem<String>(
                    value: type,
                    child: Text(type),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _selectedType = newValue!;
                  });
                },
              ),
              const SizedBox(height: 20),

              // 2. Ô chọn ngày (Readonly - chỉ chọn qua lịch)
              TextFormField(
                controller: _dateController,
                readOnly: true, // Không cho gõ tay
                decoration: InputDecoration(
                  labelText: "Ngày áp dụng",
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
                  prefixIcon: const Icon(Icons.calendar_today),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.edit_calendar),
                    onPressed: () => _selectDate(context),
                  ),
                ),
                onTap: () => _selectDate(context),
              ),
              const SizedBox(height: 20),

              // 3. Ô nhập lý do
              TextFormField(
                controller: _reasonController,
                maxLines: 4, // Cho phép nhập nhiều dòng
                decoration: InputDecoration(
                  labelText: "Lý do chi tiết",
                  hintText: "VD: Xe hỏng, nhà có việc bận...",
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
                  alignLabelWithHint: true,
                ),
                // Bắt buộc phải nhập
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập lý do';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 30),

              // 4. Nút Gửi
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _submitRequest,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text(
                    "GỬI YÊU CẦU",
                    style: TextStyle(
                        fontSize: 18,
                        color: Colors.white,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
