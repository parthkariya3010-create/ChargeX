class Port {
  final String id;
  final String type;
  final int powerKw;
  final double pricePerKwh;
  final String status;
  final int waitMins;

  Port({
    required this.id,
    required this.type,
    required this.powerKw,
    required this.pricePerKwh,
    required this.status,
    this.waitMins = 0,
  });

  factory Port.fromJson(Map<String, dynamic> json) {
    return Port(
      id: json['id'] as String,
      type: json['type'] as String,
      powerKw: (json['powerKw'] as num).toInt(),
      pricePerKwh: (json['pricePerKwh'] as num).toDouble(),
      status: json['status'] as String? ?? 'available',
      waitMins: (json['waitMins'] as num?)?.toInt() ?? 0,
    );
  }
}

class Station {
  final String id;
  final String name;
  final String address;
  final String city;
  final double? latitude;
  final double? longitude;
  final double? distanceKm;
  final double? rating;
  final String status;
  final int waitMins;
  final List<String> amenities;
  final List<Port> ports;

  Station({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    this.latitude,
    this.longitude,
    this.distanceKm,
    this.rating,
    required this.status,
    this.waitMins = 0,
    this.amenities = const [],
    this.ports = const [],
  });

  factory Station.fromJson(Map<String, dynamic> json) {
    return Station(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      city: json['city'] as String,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      rating: (json['rating'] as num?)?.toDouble(),
      status: json['status'] as String? ?? 'available',
      waitMins: (json['waitMins'] as num?)?.toInt() ?? 0,
      amenities: (json['amenities'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      ports: (json['ports'] as List<dynamic>?)
              ?.map((p) => Port.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  int get availablePortsCount =>
      ports.where((p) => p.status == 'available').length;
}

class TimeSlot {
  final String startTime;
  final bool available;

  TimeSlot({required this.startTime, required this.available});

  factory TimeSlot.fromJson(Map<String, dynamic> json) {
    return TimeSlot(
      startTime: json['startTime'] as String,
      available: json['available'] as bool? ?? true,
    );
  }
}

