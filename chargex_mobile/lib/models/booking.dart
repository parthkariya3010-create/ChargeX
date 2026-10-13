class Booking {
  final String id;
  final String stationId;
  final String stationName;
  final String stationAddress;
  final String portId;
  final String portType;
  final int powerKw;
  final double pricePerKwh;
  final String date;
  final String startTime;
  final String? vehicleRegNumber;
  final String status;
  final String? createdAt;

  Booking({
    required this.id,
    required this.stationId,
    required this.stationName,
    required this.stationAddress,
    required this.portId,
    required this.portType,
    required this.powerKw,
    required this.pricePerKwh,
    required this.date,
    required this.startTime,
    this.vehicleRegNumber,
    required this.status,
    this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      stationId: json['stationId'] as String,
      stationName: json['stationName'] as String? ?? 'Charging Hub',
      stationAddress: json['stationAddress'] as String? ?? '',
      portId: json['portId'] as String? ?? 'p1',
      portType: json['portType'] as String? ?? 'DC Fast',
      powerKw: (json['powerKw'] as num?)?.toInt() ?? 50,
      pricePerKwh: (json['pricePerKwh'] as num?)?.toDouble() ?? 18.0,
      date: json['date'] as String,
      startTime: json['startTime'] as String,
      vehicleRegNumber: json['vehicleRegNumber'] as String?,
      status: json['status'] as String? ?? 'upcoming',
      createdAt: json['createdAt'] as String?,
    );
  }
}

