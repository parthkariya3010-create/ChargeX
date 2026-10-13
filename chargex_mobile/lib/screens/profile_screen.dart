import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final vehicle = user?.vehicle;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0E14),
        elevation: 0,
        title: const Text(
          'Driver Profile',
          style: TextStyle(
            color: Color(0xFFEAF0F6),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Avatar & Name
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF131A24),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF2A3441)),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: const Color(0x2535C6F4),
                    child: Text(
                      user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'U',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF35C6F4),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'EV Driver',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFEAF0F6),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.email ?? '',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF8896A6)),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0x207B61FF),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            user?.role ?? 'DRIVER',
                            style: const TextStyle(
                              fontSize: 10,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF7B61FF),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Vehicle Specs Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF131A24),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF2A3441)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.electric_car, color: Color(0xFF35C6F4), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Primary EV Specification',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFEAF0F6),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFF2A3441), height: 24),
                  _buildDetailRow('Vehicle Make & Model', '${vehicle?.make ?? "Tata"} ${vehicle?.model ?? "Nexon EV Max"}'),
                  const SizedBox(height: 10),
                  _buildDetailRow('Registration Plate', vehicle?.regNumber ?? 'MH-02-EV-7890'),
                  const SizedBox(height: 10),
                  _buildDetailRow('Connector Standard', vehicle?.connectorType ?? 'CCS 2 (Combined Charging System)'),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Sign Out
            OutlinedButton.icon(
              onPressed: () => auth.logout(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFF4D4F)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size.fromHeight(48),
              ),
              icon: const Icon(Icons.logout, color: Color(0xFFFF4D4F), size: 18),
              label: const Text(
                'Sign Out',
                style: TextStyle(
                  color: Color(0xFFFF4D4F),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF8896A6))),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFFEAF0F6),
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }
}

