# CHARGEX — EV Charging Booking Platform

A full-stack EV Charging Station Booking Platform that enables users to discover nearby charging stations across India, view real-time charger availability, compare pricing, reserve charging slots, and manage bookings through a modern, user-friendly interface.

## Stack

- **Frontend**: React 18 + React Router + Vite + Tailwind CSS + lucide-react + react-leaflet
- **Backend**: Kotlin + Ktor + Exposed ORM + MySQL
- **Maps**: Leaflet with OpenStreetMap tiles, geolocation auto-detect, Haversine distance sorting

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Project structure

```
src/
  components/     Reusable UI (StationCard, SlotPicker, ChargeRing, StatusBadge, BookingCard, Navbar)
  pages/          Route-level screens (Stations, StationDetail, MyBookings, Profile)
  services/api.js All data access — the ONLY file that talks to data
  data/mockData.js Mock station/booking data used until a real backend is wired up
ev-charging-backend/
  src/main/kotlin/com/chargegrid/  Kotlin backend (routes, services, models, config)
  src/main/resources/seed.sql      MySQL seed data (Mumbai + Delhi stations)
all_india_seed.sql                  ~215 stations across all major Indian cities
```

## Team Members

**Mentor:** Antariksh Patil Sir

| Name | Roll Number |
|------|-------------|
| Parth Kariya | VU2F2425052 |

## Features

- Browse EV charging stations across India on an interactive map
- View live port availability (available / waiting / full with wait time)
- Book charging slots and manage bookings
- Driver profile management
- Dark, "tech" visual theme with signature charge-ring gauge
