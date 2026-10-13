import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final int waitMins;

  const StatusBadge({
    super.key,
    required this.status,
    this.waitMins = 0,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    String label;

    switch (status) {
      case 'available':
        bg = const Color(0x202ED573);
        text = const Color(0xFF2ED573);
        label = 'Available now';
        break;
      case 'waiting':
        bg = const Color(0x20FFB020);
        text = const Color(0xFFFFB020);
        label = waitMins > 0 ? '~$waitMins min wait' : 'Short wait';
        break;
      default:
        bg = const Color(0x20FF4D4F);
        text = const Color(0xFFFF4D4F);
        label = 'Full';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: text,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

