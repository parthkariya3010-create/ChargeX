class Vehicle {
  final String? make;
  final String? model;
  final String? regNumber;
  final String? connectorType;

  Vehicle({
    this.make,
    this.model,
    this.regNumber,
    this.connectorType,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      make: json['make'] as String?,
      model: json['model'] as String?,
      regNumber: json['regNumber'] as String?,
      connectorType: json['connectorType'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'make': make,
        'model': model,
        'regNumber': regNumber,
        'connectorType': connectorType,
      };
}

class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final Vehicle? vehicle;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.role = 'DRIVER',
    this.vehicle,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'DRIVER',
      vehicle: json['vehicle'] != null
          ? Vehicle.fromJson(json['vehicle'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'vehicle': vehicle?.toJson(),
      };
}

