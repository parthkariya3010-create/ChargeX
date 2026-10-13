# CHARGEX Mobile App (Flutter)

Cross-platform mobile application for EV drivers to discover charging stations, inspect live port availability, book 30-minute charging slots, and present digital QR charging passes.

This app fulfills **Phase 5 (Experiments 11–15)** of the Semester 5 Mini Project curriculum.

---

## 📱 Features

1. **Station Explorer**: Browse all nearby EV charging stations across Indian metros with live port status and distance calculation.
2. **Interactive Map**: OpenStreetMap integration with status-coded markers (Available / Waiting / Full).
3. **Live Port Gauge**: Custom signature `ChargeRing` widget rendering availability ratios (e.g. `2/4`).
4. **Slot Booking**: 5-day calendar selector, 30-minute time intervals, vehicle registration input, and reservation confirmation.
5. **Digital Charging Pass**: Displays dynamic QR code with reservation ID and hardware specs for the charging station operator to scan upon arrival.
6. **Role-Based Auth**: Sign in / Sign up as EV Driver or Station Host with JWT token persistence.
7. **Driver Profile**: EV specifications (Make, Model, License plate, Connector standard).

---

## 🛠️ Project Structure

```
chargex_mobile/
├── pubspec.yaml                  # Dependencies (provider, http, flutter_map, qr_flutter, etc.)
└── lib/
    ├── main.dart                 # MultiProvider bootstrap & theme configuration
    ├── models/
    │   ├── station.dart          # Station, Port, and TimeSlot data models
    │   ├── booking.dart          # Booking reservation data model
    │   └── user.dart             # Driver Profile & EV Vehicle models
    ├── services/
    │   └── api_service.dart      # REST API client with SharedPreferences token storage
    ├── providers/
    │   ├── auth_provider.dart    # Login, signup, token lifecycle management
    │   ├── station_provider.dart # Search, status filtering, station fetching
    │   └── booking_provider.dart # Slot booking, cancellation, user reservations
    ├── widgets/
    │   ├── charge_ring.dart      # CustomPainter circular arc port availability gauge
    │   └── status_badge.dart     # Live status pill indicator
    └── screens/
        ├── login_screen.dart     # Sign in with one-tap demo fill buttons
        ├── signup_screen.dart    # Driver / Host registration
        ├── home_screen.dart      # Nearby station list with search & filters
        ├── map_screen.dart       # Full-screen interactive map with pins
        ├── station_detail_screen.dart # Port picker & 30-minute slot calendar
        ├── bookings_screen.dart  # Active & past bookings
        ├── booking_pass_screen.dart   # Digital QR pass
        ├── profile_screen.dart   # Vehicle specs & sign out
        └── main_navigation_screen.dart# Bottom navigation bar
```

---

## 🚀 How to Run

### 1. Ensure the Kotlin Backend is running
The backend runs at `http://localhost:8081`.

### 2. Network Configuration in `lib/services/api_service.dart`
- **Android Emulator**: Uses `http://10.0.2.2:8081` (Android loopback address)
- **iOS Simulator / Chrome / Desktop**: Uses `http://localhost:8081`
- **Physical Phone**: Change to your machine's Wi-Fi IP (e.g. `http://192.168.1.5:8081`)

### 3. Launch App
```bash
cd chargex_mobile
flutter pub get
flutter run
```
To run on Chrome:
```bash
flutter run -d chrome
```

