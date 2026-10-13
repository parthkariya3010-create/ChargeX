import 'package:flutter/material.dart';
import '../models/station.dart';
import '../services/api_service.dart';

class StationProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  List<Station> _stations = [];
  bool _loading = false;
  String _searchQuery = '';
  String _statusFilter = 'all'; // all, available, waiting

  List<Station> get stations => _stations;
  bool get isLoading => _loading;
  String get searchQuery => _searchQuery;
  String get statusFilter => _statusFilter;

  List<Station> get filteredStations {
    return _stations.where((s) {
      final matchesSearch = s.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.address.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.city.toLowerCase().contains(_searchQuery.toLowerCase());

      final matchesStatus = _statusFilter == 'all' || s.status == _statusFilter;
      return matchesSearch && matchesStatus;
    }).toList();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void setStatusFilter(String filter) {
    _statusFilter = filter;
    notifyListeners();
  }

  Future<void> fetchStations({double? lat, double? lng}) async {
    _loading = true;
    notifyListeners();

    try {
      _stations = await _api.getStations(lat: lat, lng: lng);
    } catch (_) {
      // In case server is offline during development, fallback gracefully
      _stations = [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}

