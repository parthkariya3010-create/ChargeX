import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/station.dart';
import '../models/booking.dart';
import '../models/user.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator, or localhost / LAN IP
  static String baseUrl = 'http://localhost:8081';

  static const String _tokenKey = 'cg_mobile_token';

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  Map<String, String> _headers([String? token]) {
    final h = <String, String>{
      'Content-Type': 'application/json',
    };
    if (token != null) {
      h['Authorization'] = 'Bearer $token';
    }
    return h;
  }

  // --- Auth ---

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'Login failed (${res.statusCode})');
    }

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    await saveToken(data['token'] as String);
    return data;
  }

  Future<Map<String, dynamic>> signup(
    String name,
    String email,
    String password,
    String? phone, [
    String role = 'DRIVER',
  ]) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/signup'),
      headers: _headers(),
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'role': role,
      }),
    );

    if (res.statusCode != 201 && res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'Signup failed');
    }

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    await saveToken(data['token'] as String);
    return data;
  }

  // --- Stations ---

  Future<List<Station>> getStations({double? lat, double? lng}) async {
    var url = '$baseUrl/api/stations';
    if (lat != null && lng != null) {
      url += '?lat=$lat&lng=$lng';
    }

    final res = await http.get(Uri.parse(url), headers: _headers());
    if (res.statusCode != 200) {
      throw Exception('Failed to load stations');
    }

    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => Station.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Station> getStationById(String stationId, {double? lat, double? lng}) async {
    var url = '$baseUrl/api/stations/$stationId';
    if (lat != null && lng != null) {
      url += '?lat=$lat&lng=$lng';
    }

    final res = await http.get(Uri.parse(url), headers: _headers());
    if (res.statusCode != 200) {
      throw Exception('Station not found');
    }

    return Station.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<List<TimeSlot>> getAvailableSlots(
    String stationId,
    String portId,
    String dateISO,
  ) async {
    final url = '$baseUrl/api/stations/$stationId/ports/$portId/slots?date=$dateISO';
    final res = await http.get(Uri.parse(url), headers: _headers());
    if (res.statusCode != 200) {
      throw Exception('Failed to load slots');
    }

    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => TimeSlot.fromJson(e as Map<String, dynamic>)).toList();
  }

  // --- Bookings ---

  Future<Booking> createBooking({
    required String stationId,
    required String portId,
    required String date,
    required String startTime,
    required String vehicleRegNumber,
  }) async {
    final token = await getToken();
    final res = await http.post(
      Uri.parse('$baseUrl/api/bookings'),
      headers: _headers(token),
      body: jsonEncode({
        'stationId': stationId,
        'portId': portId,
        'date': date,
        'startTime': startTime,
        'vehicleRegNumber': vehicleRegNumber,
      }),
    );

    if (res.statusCode != 201 && res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'Booking failed');
    }

    return Booking.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<List<Booking>> getMyBookings() async {
    final token = await getToken();
    final res = await http.get(
      Uri.parse('$baseUrl/api/bookings/me'),
      headers: _headers(token),
    );

    if (res.statusCode != 200) {
      throw Exception('Failed to load bookings');
    }

    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => Booking.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<bool> cancelBooking(String bookingId) async {
    final token = await getToken();
    final res = await http.post(
      Uri.parse('$baseUrl/api/bookings/$bookingId/cancel'),
      headers: _headers(token),
    );

    return res.statusCode == 200;
  }

  // --- Profile ---

  Future<User> getProfile() async {
    final token = await getToken();
    final res = await http.get(
      Uri.parse('$baseUrl/api/profile'),
      headers: _headers(token),
    );

    if (res.statusCode != 200) {
      throw Exception('Failed to load profile');
    }

    return User.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }
}

