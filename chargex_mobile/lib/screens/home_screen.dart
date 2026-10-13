import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/station_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/charge_ring.dart';
import '../widgets/status_badge.dart';
import 'station_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<StationProvider>(context, listen: false).fetchStations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final stationProv = Provider.of<StationProvider>(context);
    final auth = Provider.of<AuthProvider>(context);
    final stations = stationProv.filteredStations;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0E14),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0x2035C6F4),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.bolt, color: Color(0xFF35C6F4), size: 20),
            ),
            const SizedBox(width: 8),
            const Text(
              'CHARGE',
              style: TextStyle(
                color: Color(0xFFEAF0F6),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Text(
              'X',
              style: TextStyle(
                color: Color(0xFF35C6F4),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF8896A6)),
            onPressed: () => stationProv.fetchStations(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Greeting & Search
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, ${auth.user?.name.split(" ")[0] ?? "Driver"} 👋',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFEAF0F6),
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Find EV charging stations near you',
                  style: TextStyle(fontSize: 12, color: Color(0xFF8896A6)),
                ),
                const SizedBox(height: 12),

                // Search Box
                TextField(
                  controller: _searchCtrl,
                  onChanged: stationProv.setSearchQuery,
                  style: const TextStyle(color: Color(0xFFEAF0F6), fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Search by station or city...',
                    hintStyle: const TextStyle(color: Color(0xFF8896A6)),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF8896A6), size: 20),
                    filled: true,
                    fillColor: const Color(0xFF131A24),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF2A3441)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF35C6F4)),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('all', 'All Hubs', stationProv),
                      const SizedBox(width: 8),
                      _buildFilterChip('available', 'Available now', stationProv),
                      const SizedBox(width: 8),
                      _buildFilterChip('waiting', 'Short wait', stationProv),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Stations List
          Expanded(
            child: stationProv.isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF35C6F4)),
                  )
                : stations.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.ev_station, size: 48, color: Colors.grey[700]),
                            const SizedBox(height: 12),
                            const Text(
                              'No charging stations found',
                              style: TextStyle(color: Color(0xFF8896A6)),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: const Color(0xFF35C6F4),
                        onRefresh: () => stationProv.fetchStations(),
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: stations.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final s = stations[index];
                            final uniqueTypes = s.ports.map((p) => p.type).toSet().toList();

                            return GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => StationDetailScreen(stationId: s.id),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF131A24),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFF2A3441)),
                                ),
                                child: Row(
                                  children: [
                                    ChargeRing(ports: s.ports, size: 54),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  s.name,
                                                  style: const TextStyle(
                                                    color: Color(0xFFEAF0F6),
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              if (s.rating != null)
                                                Row(
                                                  children: [
                                                    const Icon(Icons.star, color: Color(0xFFFFB020), size: 14),
                                                    const SizedBox(width: 2),
                                                    Text(
                                                      s.rating.toString(),
                                                      style: const TextStyle(
                                                        color: Color(0xFF8896A6),
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${s.address}, ${s.city}',
                                            style: const TextStyle(
                                              color: Color(0xFF8896A6),
                                              fontSize: 12,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 8),
                                          Wrap(
                                            spacing: 6,
                                            runSpacing: 4,
                                            children: [
                                              StatusBadge(status: s.status, waitMins: s.waitMins),
                                              ...uniqueTypes.map(
                                                (t) => Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    borderRadius: BorderRadius.circular(6),
                                                    border: Border.all(color: const Color(0xFF2A3441)),
                                                  ),
                                                  child: Text(
                                                    t,
                                                    style: const TextStyle(
                                                      fontSize: 10,
                                                      fontFamily: 'monospace',
                                                      color: Color(0xFF8896A6),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
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

  Widget _buildFilterChip(String key, String label, StationProvider prov) {
    final isSelected = prov.statusFilter == key;
    return GestureDetector(
      onTap: () => prov.setStatusFilter(key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0x2535C6F4) : const Color(0xFF131A24),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFF2A3441),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isSelected ? const Color(0xFF35C6F4) : const Color(0xFF8896A6),
          ),
        ),
      ),
    );
  }
}

