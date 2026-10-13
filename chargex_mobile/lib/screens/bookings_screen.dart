import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/booking_provider.dart';
import 'booking_pass_screen.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  int _tabIndex = 0; // 0: upcoming, 1: completed, 2: cancelled

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<BookingProvider>(context, listen: false).fetchMyBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    final bookingProv = Provider.of<BookingProvider>(context);

    final list = _tabIndex == 0
        ? bookingProv.upcomingBookings
        : _tabIndex == 1
            ? bookingProv.completedBookings
            : bookingProv.cancelledBookings;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0E14),
        elevation: 0,
        title: const Text(
          'My Bookings',
          style: TextStyle(
            color: Color(0xFFEAF0F6),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF131A24),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF2A3441)),
              ),
              child: Row(
                children: [
                  _buildTab(0, 'Upcoming'),
                  _buildTab(1, 'Completed'),
                  _buildTab(2, 'Cancelled'),
                ],
              ),
            ),
          ),

          Expanded(
            child: bookingProv.isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF35C6F4)),
                  )
                : list.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.calendar_month, size: 48, color: Colors.grey[700]),
                            const SizedBox(height: 12),
                            const Text(
                              'No bookings found',
                              style: TextStyle(color: Color(0xFF8896A6)),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: const Color(0xFF35C6F4),
                        onRefresh: () => bookingProv.fetchMyBookings(),
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: list.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final b = list[index];

                            return GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => BookingPassScreen(booking: b),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF131A24),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFF2A3441)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            b.stationName,
                                            style: const TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFFEAF0F6),
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: b.status == 'upcoming'
                                                ? const Color(0x2035C6F4)
                                                : b.status == 'completed'
                                                    ? const Color(0x202ED573)
                                                    : const Color(0x20FF4D4F),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            b.status.toUpperCase(),
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontFamily: 'monospace',
                                              fontWeight: FontWeight.bold,
                                              color: b.status == 'upcoming'
                                                  ? const Color(0xFF35C6F4)
                                                  : b.status == 'completed'
                                                      ? const Color(0xFF2ED573)
                                                      : const Color(0xFFFF4D4F),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        const Icon(Icons.access_time, size: 14, color: Color(0xFF8896A6)),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${b.date} · ${b.startTime}',
                                          style: const TextStyle(
                                            fontFamily: 'monospace',
                                            fontSize: 12,
                                            color: Color(0xFFEAF0F6),
                                          ),
                                        ),
                                        const Spacer(),
                                        Text(
                                          '${b.portId.toUpperCase()} (${b.powerKw}kW)',
                                          style: const TextStyle(
                                            fontFamily: 'monospace',
                                            fontSize: 11,
                                            color: Color(0xFF35C6F4),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Plate: ${b.vehicleRegNumber ?? "N/A"}',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: Color(0xFF8896A6),
                                            fontFamily: 'monospace',
                                          ),
                                        ),
                                        if (b.status == 'upcoming')
                                          OutlinedButton(
                                            style: OutlinedButton.styleFrom(
                                              side: const BorderSide(color: Color(0xFFFF4D4F)),
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                              minimumSize: const Size(0, 28),
                                            ),
                                            onPressed: () async {
                                              await bookingProv.cancelBooking(b.id);
                                            },
                                            child: const Text(
                                              'Cancel',
                                              style: TextStyle(
                                                color: Color(0xFFFF4D4F),
                                                fontSize: 11,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(int index, String label) {
    final isSelected = _tabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0x2535C6F4) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFF8896A6),
            ),
          ),
        ),
      ),
    );
  }
}

