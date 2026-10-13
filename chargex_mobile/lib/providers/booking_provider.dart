import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../services/api_service.dart';

class BookingProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  List<Booking> _bookings = [];
  bool _loading = false;

  List<Booking> get bookings => _bookings;
  bool get isLoading => _loading;

  List<Booking> get upcomingBookings =>
      _bookings.where((b) => b.status == 'upcoming').toList();

  List<Booking> get completedBookings =>
      _bookings.where((b) => b.status == 'completed').toList();

  List<Booking> get cancelledBookings =>
      _bookings.where((b) => b.status == 'cancelled').toList();

  Future<void> fetchMyBookings() async {
    _loading = true;
    notifyListeners();

    try {
      _bookings = await _api.getMyBookings();
    } catch (_) {
      _bookings = [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<Booking> bookSlot({
    required String stationId,
    required String portId,
    required String date,
    required String startTime,
    required String vehicleRegNumber,
  }) async {
    final booking = await _api.createBooking(
      stationId: stationId,
      portId: portId,
      date: date,
      startTime: startTime,
      vehicleRegNumber: vehicleRegNumber,
    );

    _bookings.insert(0, booking);
    notifyListeners();
    return booking;
  }

  Future<bool> cancelBooking(String bookingId) async {
    final ok = await _api.cancelBooking(bookingId);
    if (ok) {
      await fetchMyBookings();
    }
    return ok;
  }
}

