class AttendanceHistory {
  final String date; // Ngày (VD: 2023-12-25)
  final String checkIn; // Giờ vào
  final String checkOut; // Giờ ra
  final String status; // Trạng thái (Vào làm / Ra về)

  AttendanceHistory({
    required this.date,
    required this.checkIn,
    required this.checkOut,
    required this.status,
  });
}
