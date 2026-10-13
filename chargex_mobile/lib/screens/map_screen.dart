import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../providers/station_provider.dart';
import '../models/station.dart';
import '../widgets/status_badge.dart';
import 'station_detail_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  Station? _selectedStation;

  @override
  Widget build(BuildContext context) {
    final stationProv = Provider.of<StationProvider>(context);
    final stations = stationProv.stations;

    // Default center: Mumbai (19.076, 72.877)
    final initialCenter = stations.isNotEmpty && stations.first.latitude != null
        ? LatLng(stations.first.latitude!, stations.first.longitude!)
        : const LatLng(19.0760, 72.8777);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0E14),
        elevation: 0,
        title: const Text(
          'Station Map',
          style: TextStyle(
            color: Color(0xFFEAF0F6),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: initialCenter,
              initialZoom: 12.0,
              onTap: (_, __) {
                setState(() => _selectedStation = null);
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'in.chargex.mobile',
              ),
              MarkerLayer(
                markers: stations
                    .where((s) => s.latitude != null && s.longitude != null)
                    .map((s) {
                  Color pinColor;
                  if (s.status == 'available') {
                    pinColor = const Color(0xFF2ED573);
                  } else if (s.status == 'waiting') {
                    pinColor = const Color(0xFFFFB020);
                  } else {
                    pinColor = const Color(0xFFFF4D4F);
                  }

                  return Marker(
                    point: LatLng(s.latitude!, s.longitude!),
                    width: 36,
                    height: 36,
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedStation = s);
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: pinColor,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black38,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.bolt,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Selected Station Drawer
          if (_selectedStation != null)
            Positioned(
              bottom: 24,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF131A24),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2A3441)),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black54,
                      blurRadius: 12,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            _selectedStation!.name,
                            style: const TextStyle(
                              color: Color(0xFFEAF0F6),
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        StatusBadge(
                          status: _selectedStation!.status,
                          waitMins: _selectedStation!.waitMins,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_selectedStation!.address}, ${_selectedStation!.city}',
                      style: const TextStyle(color: Color(0xFF8896A6), fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${_selectedStation!.availablePortsCount} of ${_selectedStation!.ports.length} ports available',
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: Color(0xFF35C6F4),
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => StationDetailScreen(
                                  stationId: _selectedStation!.id,
                                ),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF35C6F4),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 8,
                            ),
                          ),
                          child: const Text(
                            'Book Slot',
                            style: TextStyle(
                              color: Color(0xFF0A0E14),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

