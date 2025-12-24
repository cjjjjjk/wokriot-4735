import 'package:flutter/material.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  // Dữ liệu giả lập (Sau này sẽ lấy từ API /api/attendance/history)
  final List<Map<String, dynamic>> _historyData = [
    {
      "date": "24/12/2025",
      "check_in": "07:55",
      "check_out": "--:--",
      "status": "Đang làm việc",
      "color": Colors.blue
    },
    {
      "date": "23/12/2025",
      "check_in": "07:50",
      "check_out": "17:30",
      "status": "Hợp lệ",
      "color": Colors.green
    },
    {
      "date": "22/12/2025",
      "check_in": "08:15", // Đi muộn
      "check_out": "17:35",
      "status": "Đi muộn",
      "color": Colors.red
    },
    {
      "date": "21/12/2025",
      "check_in": "07:58",
      "check_out": "17:31",
      "status": "Hợp lệ",
      "color": Colors.green
    },
    {
      "date": "20/12/2025",
      "check_in": "07:55",
      "check_out": "--:--", // Quên check-out
      "status": "Thiếu giờ ra",
      "color": Colors.orange
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text("Lịch sử chấm công"),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          // Nút lọc tháng (UI giả)
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text("Chức năng chọn tháng đang phát triển")));
            },
          )
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _historyData.length,
        itemBuilder: (context, index) {
          final item = _historyData[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  // Cột 1: Ngày tháng (Nổi bật)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Text(
                          item['date'].substring(0, 2), // Lấy ngày (VD: 24)
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue),
                        ),
                        Text(
                          "Thg ${item['date'].substring(3, 5)}", // Lấy tháng (VD: 12)
                          style: const TextStyle(
                              fontSize: 12, color: Colors.blueGrey),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 15),

                  // Cột 2: Thời gian Check-in/out
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.login,
                                size: 16, color: Colors.green),
                            const SizedBox(width: 5),
                            Text("Vào: ${item['check_in']}",
                                style: const TextStyle(
                                    fontWeight: FontWeight.w500)),
                          ],
                        ),
                        const SizedBox(height: 5),
                        Row(
                          children: [
                            const Icon(Icons.logout,
                                size: 16, color: Colors.orange),
                            const SizedBox(width: 5),
                            Text("Ra:   ${item['check_out']}",
                                style: const TextStyle(
                                    fontWeight: FontWeight.w500)),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Cột 3: Trạng thái (Badge)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: item['color'].withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: item['color'], width: 1),
                    ),
                    child: Text(
                      item['status'],
                      style: TextStyle(
                        color: item['color'],
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  )
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
