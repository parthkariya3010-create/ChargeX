import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  User? _user;
  String? _token;
  bool _loading = false;
  String? _error;

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null && _user != null;
  bool get isLoading => _loading;
  String? get error => _error;

  Future<void> init() async {
    _token = await _api.getToken();
    if (_token != null) {
      try {
        _user = await _api.getProfile();
      } catch (_) {
        _token = null;
        await _api.clearToken();
      }
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _api.login(email, password);
      _token = res['token'] as String;
      _user = User.fromJson(res['user'] as Map<String, dynamic>);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signup(
    String name,
    String email,
    String password,
    String? phone, [
    String role = 'DRIVER',
  ]) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _api.signup(name, email, password, phone, role);
      _token = res['token'] as String;
      _user = User.fromJson(res['user'] as Map<String, dynamic>);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await _api.clearToken();
    notifyListeners();
  }
}

