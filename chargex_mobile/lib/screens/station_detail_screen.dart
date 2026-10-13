import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/station.dart';
import '../services/api_service.dart';
import '../providers/booking_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/status_badge.dart';
import 'booking_pass_screen.dart';

class StationDetailScreen extends StatefulWidget {
  final String stationId;

  const StationDetailScreen({super.key, required this.stationId});

  @override
  State<StationDetailScreen> createState() => _StationDetailScreenState();
}

class _StationDetailScreenState extends State<StationDetailScreen> {
  final ApiService _api = ApiService();
  Station? _station;
  bool _loadingStation = true;

  // Booking states
  late List<DateTime> _days;
  int _selectedDayIndex = 0;
  String? _selectedPortId;
  List<TimeSlot> _slots = [];
  bool _loadingSlots = false;
  String? _selectedTime;
  final _plateCtrl = TextEditingController(text: 'MH-02-EV-7890');
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _days = List.generate(5, (i) => DateTime.now().add(Duration(days: i)));
    _loadStation();
  }

  Future<void> _loadStation() async {
    try {
      final s = await _api.getStationById(widget.stationId);
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.user?.vehicle?.regNumber != null) {
        _plateCtrl.text = auth.user!.vehicle!.regNumber!;
      }

      setState(() {
        _station = s;
        _loadingStation = false;
        final firstAvail = s.ports.firstWhere(
          (p) => p.status != 'full',
          orElse: () => s.ports.isNotEmpty ? s.ports.first : Port(id: 'p1', type: 'DC Fast', powerKw: 50, pricePerKwh: 18, status: 'available'),
        );
        _selectedPortId = firstAvail.id;
      });

      _loadSlots();
    } catch (_) {
      setState(() => _loadingStation = false);
    }
  }

  Future<void> _loadSlots() async {
    if (_selectedPortId == null) return;
    setState(() {
      _loadingSlots = true;
      _selectedTime = null;
    });

    final dateStr = DateFormat('yyyy-MM-dd').format(_days[_selectedDayIndex]);
    try {
      final slots = await _api.getAvailableSlots(
        widget.stationId,
        _selectedPortId!,
        dateStr,
      );
      setState(() {
        _slots = slots;
        _loadingSlots = false;
      });
    } catch (_) {
      setState(() {
        _slots = [];
        _loadingSlots = false;
      });
    }
  }

  Future<void> _handleBook() async {
    if (_selectedPortId == null || _selectedTime == null || _plateCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select port, time slot, and vehicle plate')),
      );
      return;
    }

    setState(() => _submitting = true);
    final bookingProv = Provider.of<BookingProvider>(context, listen: false);
    final dateStr = DateFormat('yyyy-MM-dd').format(_days[_selectedDayIndex]);

    try {
      final booking = await bookingProv.bookSlot(
        stationId: widget.stationId,
        portId: _selectedPortId!,
        date: dateStr,
        startTime: _selectedTime!,
        vehicleRegNumber: _plateCtrl.text.trim(),
      );

      setState(() => _submitting = false);
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => BookingPassScreen(booking: booking),
          ),
        );
      }
    } catch (e) {
      setState(() => _submitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: const Color(0xFFFF4D4F),
          ),
        );
      }
    }
  }

  String _formatTime12(String t) {
    final parts = t.split(':');
    final h = int.parse(parts[0]);
    final m = parts[1];
    final period = h >= 12 ? 'PM' : 'AM';
    final h12 = h % 12 == 0 ? 12 : h % 12;
    return '$h12:$m $period';
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingStation) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0E14),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF35C6F4))),
      );
    }

    if (_station == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0A0E14),
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: const Center(
          child: Text('Station not found', style: TextStyle(color: Color(0xFF8896A6))),
        ),
      );
    }

    final s = _station!;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0E14),
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFFEAF0F6)),
        title: Text(
          s.name,
          style: const TextStyle(color: Color(0xFFEAF0F6), fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF131A24),
          border: Border(top: BorderSide(color: Color(0xFF2A3441))),
        ),
        child: ElevatedButton(
          onPressed: _submitting || _selectedTime == null ? null : _handleBook,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF35C6F4),
            disabledBackgroundColor: const Color(0xFF2A3441),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: _submitting
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0A0E14)),
                )
              : Text(
                  _selectedTime == null ? 'Select Time Slot' : 'Confirm Reservation',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0A0E14),
                  ),
                ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Station summary header
            Row(
              children: [
                StatusBadge(status: s.status, waitMins: s.waitMins),
                const SizedBox(width: 8),
                if (s.rating != null)
                  Row(
                    children: [
                      const Icon(Icons.star, color: Color(0xFFFFB020), size: 14),
                      const SizedBox(width: 2),
                      Text(
                        '${s.rating}',
                        style: const TextStyle(color: Color(0xFF8896A6), fontSize: 12),
                      ),
                    ],
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '${s.address}, ${s.city}',
              style: const TextStyle(color: Color(0xFF8896A6), fontSize: 13),
            ),
            const SizedBox(height: 16),

            // Amenities
            if (s.amenities.isNotEmpty) ...[
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: s.amenities
                    .map((a) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1C2531),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            a,
                            style: const TextStyle(color: Color(0xFF8896A6), fontSize: 11),
                          ),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 20),
            ],

            // Step 1: Select Port
            const Text(
              '1. SELECT CHARGING PORT',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF35C6F4),
              ),
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: s.ports.map((p) {
                  final isSelected = _selectedPortId == p.id;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedPortId = p.id);
                      _loadSlots();
                    },
                    child: Container(
                      margin: const EdgeInsets.only(right: 10),
                      padding: const EdgeInsets.all(12),
                      width: 140,
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0x2535C6F4) : const Color(0xFF131A24),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFF2A3441),
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                p.id.toUpperCase(),
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                  color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFFEAF0F6),
                                ),
                              ),
                              Text(
                                '${p.powerKw}kW',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF8896A6)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            p.type,
                            style: const TextStyle(fontSize: 12, color: Color(0xFFEAF0F6)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '₹${p.pricePerKwh}/kWh',
                            style: const TextStyle(
                              fontSize: 11,
                              fontFamily: 'monospace',
                              color: Color(0xFF35C6F4),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 24),

            // Step 2: Select Date
            const Text(
              '2. SELECT DATE',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF35C6F4),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: List.generate(_days.length, (i) {
                final d = _days[i];
                final isSelected = _selectedDayIndex == i;
                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _selectedDayIndex = i);
                      _loadSlots();
                    },
                    child: Container(
                      margin: EdgeInsets.only(right: i < _days.length - 1 ? 6 : 0),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0x2535C6F4) : const Color(0xFF131A24),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFF2A3441),
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            DateFormat('EEE').format(d),
                            style: TextStyle(
                              fontSize: 10,
                              color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFF8896A6),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            DateFormat('d').format(d),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFFEAF0F6),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),

            // Step 3: Select Time Slot
            const Text(
              '3. SELECT TIME SLOT',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF35C6F4),
              ),
            ),
            const SizedBox(height: 10),

            _loadingSlots
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator(color: Color(0xFF35C6F4)),
                    ),
                  )
                : _slots.isEmpty
                    ? const Text('No slots available', style: TextStyle(color: Color(0xFF8896A6)))
                    : GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          childAspectRatio: 2.2,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemCount: _slots.length,
                        itemBuilder: (context, idx) {
                          final slot = _slots[idx];
                          final isSelected = _selectedTime == slot.startTime;

                          return GestureDetector(
                            onTap: slot.available
                                ? () => setState(() => _selectedTime = slot.startTime)
                                : null,
                            child: Container(
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0x3035C6F4)
                                    : slot.available
                                        ? const Color(0xFF131A24)
                                        : const Color(0xFF1C2531).withOpacity(0.4),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isSelected
                                      ? const Color(0xFF35C6F4)
                                      : const Color(0xFF2A3441),
                                ),
                              ),
                              child: Text(
                                _formatTime12(slot.startTime),
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isSelected
                                      ? const Color(0xFF35C6F4)
                                      : slot.available
                                          ? const Color(0xFFEAF0F6)
                                          : const Color(0xFF8896A6).withOpacity(0.4),
                                  decoration: slot.available ? null : TextDecoration.lineThrough,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
            const SizedBox(height: 24),

            // Step 4: Vehicle Reg Number
            const Text(
              '4. VEHICLE REGISTRATION NUMBER',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF35C6F4),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _plateCtrl,
              style: const TextStyle(
                fontFamily: 'monospace',
                color: Color(0xFFEAF0F6),
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
              decoration: InputDecoration(
                hintText: 'MH-01-AB-1234',
                prefixIcon: const Icon(Icons.directions_car, color: Color(0xFF35C6F4)),
                filled: true,
                fillColor: const Color(0xFF131A24),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF2A3441)),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

