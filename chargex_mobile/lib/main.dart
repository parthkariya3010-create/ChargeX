import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/station_provider.dart';
import 'providers/booking_provider.dart';
import 'screens/main_navigation_screen.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final authProvider = AuthProvider();
  await authProvider.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authProvider),
        ChangeNotifierProvider(create: (_) => StationProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
      ],
      child: const ChargeXApp(),
    ),
  );
}

class ChargeXApp extends StatelessWidget {
  const ChargeXApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CHARGEX - EV Charging Booking',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0E14),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF35C6F4),
          surface: Color(0xFF131A24),
          background: const Color(0xFF0A0E14),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0A0E14),
          elevation: 0,
        ),
        fontFamily: 'Inter',
      ),
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return auth.isAuthenticated
              ? const MainNavigationScreen()
              : const LoginScreen();
        },
      ),
    );
  }
}

