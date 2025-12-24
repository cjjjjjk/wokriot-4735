class AttendanceModel {
  final String date;
  final String? checkIn;
  final String? checkOut;
  final String status; // "late", "on_time", "absent"

  AttendanceModel({
    required this.date,
    this.checkIn,
    this.checkOut,
    required this.status,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      date: json['date'] ?? '',
      checkIn: json['check_in'],
      checkOut: json['check_out'],
      status: json['status'] ?? 'unknown',
    );
  }
}