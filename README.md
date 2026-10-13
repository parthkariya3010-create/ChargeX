# CHARGEX — Full-Stack EV Charging Platform & Mobile App

A complete, multi-platform Electric Vehicle (EV) charging discovery, slot booking, and infrastructure management system built for the **Semester 5 Mini Project**.

CHARGEX integrates a **Driver Web Application**, an **Admin & Station Host Operations Center**, a **Kotlin REST Backend with Role-Based Access Control**, a **MySQL Database**, and a cross-platform **Flutter Mobile Application**.

---

## 🏆 Syllabus Mapping & Course Milestones

| Lab Experiment / Phase | Description | Implementation in CHARGEX |
| :--- | :--- | :--- |
| **Front-End (React)** *(Expt 2–3)* | Admin dashboard for managing operations | **Admin & Host Portal** (`/admin`): Add/edit/delete charging hubs, configure port tariffs (₹/kWh), manage live bookings, inspect network utilization metrics. |
| **Backend (Kotlin)** *(Expt 6–9)* | CRUD APIs for business operations | **Kotlin + Ktor REST Microservice**: Full CRUD endpoints for stations, ports, bookings, users, and admin statistics. |
| **Database Integration** *(Expt 7)* | Persistent relational storage | **MySQL Database (`chargegrid`)**: Exposed ORM tables for `users` (RBAC), `vehicles`, `stations`, `ports`, `station_amenities`, and `bookings`. |
| **Authentication** *(Expt 8)* | Role-based access control (RBAC) | **JWT Authentication & RBAC**: Differentiated permissions for `ADMIN`, `HOST` (Station Operator), and `DRIVER` roles with BCrypt salted password hashing. |
| **Mobile (Flutter)** *(Expt 11–15)* | Cross-platform student/user mobile app | **CHARGEX Mobile App (`chargex_mobile`)**: Complete Flutter app with station locator, OpenStreetMap pins, live `ChargeRing` port gauge, 30-min slot booking, and digital QR charging pass. |
| **Final Demo** *(Expt 15)* | Fully functional multi-platform system | Seamless end-to-end integration between Web Driver, Admin Web, Flutter Mobile, and Kotlin API. |

---

## 🛠️ Technology Stack

- **Web Frontend**: React 18, React Router v6, Vite 5, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet
- **Backend**: Kotlin 2.0, Ktor 2.3 (Netty Engine), JetBrains Exposed ORM 0.51, HikariCP, MySQL Connector/J
- **Security**: JWT (HMAC-256 with 24-hr expiry), BCrypt (cost factor 12)
- **Mobile App**: Flutter 3 (Dart), Provider state management, `flutter_map`, `http`, `shared_preferences`, `qr_flutter`
- **Database**: MySQL 8.0+

---

## 🚀 Quick Start Guide

### 1. Database Setup
Ensure MySQL is running on port 3306.

**Option A (MySQL Workbench - Recommended):**
1. Open MySQL Workbench and connect to your local instance.
2. Go to **File** -> **Open SQL Script...** (or press `Ctrl+Shift+O`).
3. Select `all_india_seed.sql` located in the root folder of this project.
4. Click the **Execute** button (the yellow ⚡ lightning icon).
*(This automatically creates the `chargegrid` database, all required tables, and seeds ~215 charging stations across Indian metropolitan areas).*

**Option B (MySQL CLI / Terminal):**
```bash
mysql -u root -p -e "source all_india_seed.sql"
```

*(Note: If you had previously created the `chargegrid` database before the role-based auth update, run `ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'DRIVER';` or simply re-import `all_india_seed.sql`).*

### 2. Run Kotlin Backend
```bash
cd ev-charging-backend
./gradlew run
```
The server will start at `http://localhost:8081`. Test health endpoint: `GET http://localhost:8081/api/health`.

### 3. Run Web App (Driver + Admin Portal)
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

#### Demo Credentials for Viva / Evaluation:
| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@chargex.in` | `admin123` | Full access (`/admin`, manage all hubs & network bookings) |
| **Station Host** | `host@chargex.in` | `host123` | Host access (`/admin`, manage own charging hubs & ports) |
| **EV Driver** | `driver@chargex.in` | `driver123` | Driver access (Browse hubs, book slots, digital QR pass) |

*(Quick-fill buttons are built directly into the Login screen for instant testing!)*

### 4. Run Flutter Mobile App
```bash
cd chargex_mobile
flutter pub get
flutter run
```

---

## 📁 Repository Structure

```
CHARGEX/
├── src/                                  # React Web Application
│   ├── components/                       # ChargeRing, StatusBadge, MapView, Navbar, etc.
│   ├── context/AuthContext.jsx           # JWT Session & RBAC (isAdmin, isHost, isStaff)
│   ├── pages/
│   │   ├── Stations.jsx                  # Station explorer (List & Map view)
│   │   ├── StationDetail.jsx             # 5-day slot calendar & port selector
│   │   ├── MyBookings.jsx                # Driver booking reservations
│   │   ├── Profile.jsx                   # EV specs & driver details
│   │   ├── Login.jsx & Signup.jsx        # Auth with role picker & quick demo fill
│   │   └── admin/                        # Admin & Station Host Dashboard
│   │       ├── AdminDashboard.jsx        # Operations Center & analytics metrics
│   │       ├── ManageStations.jsx        # Charging station & port CRUD modals
│   │       └── ManageBookings.jsx        # Network reservations manager
│   └── services/api.js                   # Unified REST client gateway
├── ev-charging-backend/                  # Kotlin Backend
│   └── src/main/kotlin/com/chargegrid/
│       ├── config/                       # Security (JWT, RBAC), CORS, Database, Routing
│       ├── dto/                          # Requests.kt & Responses.kt DTOs
│       ├── models/Tables.kt              # Exposed ORM schema (Users with roles, Stations, Ports, Bookings)
│       ├── routes/                       # AuthRoutes, StationRoutes, BookingRoutes, AdminRoutes, ProfileRoutes
│       └── services/                     # AuthService, StationService, BookingService, AdminService
├── chargex_mobile/                       # Flutter Mobile Application
│   ├── pubspec.yaml                      # Mobile dependencies
│   └── lib/
│       ├── main.dart                     # App root & MultiProvider
│       ├── models/                       # Station, Booking, User, Port
│       ├── services/api_service.dart     # Mobile HTTP client
│       ├── providers/                    # AuthProvider, StationProvider, BookingProvider
│       ├── widgets/                      # ChargeRing, StatusBadge
│       └── screens/                      # Home, Map, StationDetail, BookingPass, Bookings, Profile
├── all_india_seed.sql                    # Production seed with ~215 stations
└── README.md
```

---

## 👥 Team Details

**Mentor:** Antariksh Patil Sir

| Name | Roll Number |
| :--- | :--- |
| Parth Kariya | VU2F2425052 |

---

## ✨ Features Summary

- **Interactive Map**: Browse EV charging stations across India on an interactive OpenStreetMap view.
- **Real-Time Availability**: Live port availability (available / waiting / full with real-time wait estimation).
- **Slot Booking**: Book charging slots and manage upcoming and past charging reservations.
- **Driver Profile**: Vehicle registry, connector matching, and history tracking.
- **Admin Dashboard**: Full CRUD management of stations, ports, tariffs, and network statistics.
- **Mobile App**: Cross-platform Flutter mobile client with digital QR ticketing.
- **Theme Switching**: Dark / Light / System preference mode with theme switcher.

