import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

class WeeklyChartWidget extends StatelessWidget {
  final List<double>
      weeklyData; // Mảng 7 phần tử, chứa số giờ làm việc (Mon -> Sun)
  final DateTime startDate; // Ngày thứ 2 bắt đầu tuần
  final double maxY;

  const WeeklyChartWidget(
      {super.key,
      required this.weeklyData,
      required this.startDate,
      this.maxY = 12.0});

  @override
  Widget build(BuildContext context) {
    // Tìm ngày hiện tại để highlight
    final currentWeekdayIndex = DateTime.now().weekday - 1;

    // Format tháng: "01/2026"
    String currentMonth = DateFormat("MM/yyyy").format(startDate);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // HEADER: Tiêu đề tháng
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Tuần hiện tại",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  "Tháng $currentMonth",
                  style: const TextStyle(
                      color: Colors.blue,
                      fontSize: 12,
                      fontWeight: FontWeight.bold),
                ),
              )
            ],
          ),

          const SizedBox(height: 25),

          // CHART
          SizedBox(
            height: 200, // Tăng chiều cao xíu
            child: BarChart(
              BarChartData(
                maxY: maxY,
                barTouchData: BarTouchData(
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => Colors.blueGrey,
                    tooltipPadding: const EdgeInsets.all(8),
                    tooltipMargin: 8,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        '${rod.toY.toStringAsFixed(1)} giờ',
                        const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  // BOTTOM TITLES: Ngày + Tên thứ
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize:
                          40, // Tăng reservedHeight để đủ chỗ cho 2 dòng
                      getTitlesWidget: (double value, TitleMeta meta) {
                        int index = value.toInt();
                        if (index < 0 || index >= 7) return const SizedBox();

                        // Tính ngày cụ thể cho cột này
                        DateTime dateOfColumn =
                            startDate.add(Duration(days: index));
                        String dayNumber =
                            DateFormat("dd").format(dateOfColumn);
                        String dayName = "";

                        // Tên thứ (KHỚP VỚI WEB: CN, T2, T3, T4, T5, T6, T7)
                        switch (index) {
                          case 0:
                            dayName = 'CN';
                            break;
                          case 1:
                            dayName = 'T2';
                            break;
                          case 2:
                            dayName = 'T3';
                            break;
                          case 3:
                            dayName = 'T4';
                            break;
                          case 4:
                            dayName = 'T5';
                            break;
                          case 5:
                            dayName = 'T6';
                            break;
                          case 6:
                            dayName = 'T7';
                            break;
                        }

                        // Style cho chữ
                        bool isToday = (index == currentWeekdayIndex);

                        return SideTitleWidget(
                          axisSide: meta.axisSide,
                          space: 8,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(dayName,
                                  style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.grey,
                                      fontWeight: isToday
                                          ? FontWeight.bold
                                          : FontWeight.normal)),
                              Text(dayNumber,
                                  style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: isToday
                                          ? Colors.blue
                                          : Colors.black87)),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: 4,
                  getDrawingHorizontalLine: (value) => FlLine(
                      color: Colors.grey.withOpacity(0.05),
                      strokeWidth: 1,
                      dashArray: [5, 5]),
                ),
                barGroups: List.generate(7, (index) {
                  double val =
                      (index < weeklyData.length) ? weeklyData[index] : 0;

                  // LỰA CHỌN MÀU SẮC
                  Color barColor;
                  if (val >= 6.5) {
                    barColor = Colors.blueAccent; // Đủ công (Full day)
                  } else if (val > 0) {
                    barColor = Colors.orangeAccent; // Thiếu công (Half day)
                  } else {
                    barColor = Colors.grey.shade300; // Không đi làm
                  }

                  // Gradient nhẹ
                  Gradient gradient = LinearGradient(
                      colors: [barColor.withOpacity(0.6), barColor],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter);

                  return BarChartGroupData(
                    x: index,
                    barRods: [
                      BarChartRodData(
                        toY: val,
                        gradient: gradient,
                        width: 22, // Tăng độ rộng cột
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(8)),
                        backDrawRodData: BackgroundBarChartRodData(
                          show: true,
                          toY: maxY,
                          color: Colors.grey.withOpacity(0.03),
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
