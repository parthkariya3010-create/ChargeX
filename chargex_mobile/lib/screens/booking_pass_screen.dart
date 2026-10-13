import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/booking.dart';

class BookingPassScreen extends StatelessWidget {
  final Booking booking;

  const BookingPassScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0E14),
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFFEAF0F6)),
        title: const Text(
          'Digital Charging Pass',
          style: TextStyle(
            color: Color(0xFFEAF0F6),
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            children: [
              // Success checkmark badge
              Container(
                width: 60,
                height: 60,
                decoration: const BoxDecoration(
                  color: Color(0x202ED573),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  color: Color(0xFF2ED573),
                  size: 36,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Slot Confirmed',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFEAF0F6),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Present this QR pass when arriving at the charging station',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Color(0xFF8896A6)),
              ),
              const SizedBox(height: 24),

              // Digital Pass Ticket Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF131A24),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF2A3441)),
                ),
                child: Column(
                  children: [
                    // QR Code
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: QrImageView(
                        data: 'CHARGEX:${booking.id}:${booking.stationId}:${booking.portId}',
                        version: QrVersions.auto,
                        size: 160.0,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      booking.id,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF35C6F4),
                      ),
                    ),
                    const Divider(color: Color(0xFF2A3441), height: 32),

                    // Details Rows
                    _buildTicketRow('Station', booking.stationName),
                    const SizedBox(height: 10),
                    _buildTicketRow('Port', '${booking.portId.toUpperCase()} (${booking.portType} · ${booking.powerKw}kW)'),
                    const SizedBox(height: 10),
                    _buildTicketRow('Date & Time', '${booking.date} · ${booking.startTime}'),
                    const SizedBox(height: 10),
                    _buildTicketRow('Vehicle Reg', booking.vehicleRegNumber ?? 'MH-01-EV-0001'),
                    const SizedBox(height: 10),
                    _buildTicketRow('Tariff', '₹${booking.pricePerKwh}/kWh'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF35C6F4),
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size.fromHeight(48),
                ),
                child: const Text(
                  'Done',
                  style: TextStyle(
                    color: Color(0xFF0A0E14),
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTicketRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Color(0xFF8896A6)),
        ),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFFEAF0F6),
            ),
          ),
        ),
      ],
    );
  }
}

