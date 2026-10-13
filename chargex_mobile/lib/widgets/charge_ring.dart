import 'dart:math';
import 'package:flutter/material.dart';
import '../models/station.dart';

class ChargeRing extends StatelessWidget {
  final List<Port> ports;
  final double size;

  const ChargeRing({
    super.key,
    required this.ports,
    this.size = 52.0,
  });

  @override
  Widget build(BuildContext context) {
    final total = ports.length;
    final available = ports.where((p) => p.status == 'available').length;
    final fraction = total > 0 ? available / total : 0.0;

    Color color;
    if (available > 0) {
      color = const Color(0xFF2ED573); // success green
    } else if (ports.any((p) => p.status == 'waiting')) {
      color = const Color(0xFFFFB020); // warning amber
    } else {
      color = const Color(0xFFFF4D4F); // danger red
    }

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _RingPainter(
              fraction: fraction,
              activeColor: color,
              trackColor: const Color(0xFF2A3441),
              strokeWidth: 4.5,
            ),
          ),
          Text(
            '$available/$total',
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Color(0xFFEAF0F6),
            ),
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double fraction;
  final Color activeColor;
  final Color trackColor;
  final double strokeWidth;

  _RingPainter({
    required this.fraction,
    required this.activeColor,
    required this.trackColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Track circle
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    canvas.drawCircle(center, radius, trackPaint);

    // Active arc
    final sweep = 2 * pi * max(fraction, fraction > 0 ? 0.05 : 0.0);
    final activePaint = Paint()
      ..color = activeColor
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      sweep,
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) {
    return oldDelegate.fraction != fraction || oldDelegate.activeColor != activeColor;
  }
}

