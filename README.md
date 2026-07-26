# CHARGEX — EV Charging Booking

A React frontend for an EV charging station booking app: browse stations, see
live port availability (available / waiting / full with wait time), book a
charging slot, manage bookings, and edit a driver profile.

## Stack

- React 18 + React Router
- Vite
- Tailwind CSS
- lucide-react (icons)

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
```

## Connecting your own backend

All data access goes through `src/services/api.js`. Nothing else in the app
touches mock data directly, so hooking up a real backend is a single-file
change:

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your API's
   root URL.
2. In `src/services/api.js`, each exported function already has a commented
   `fetch(...)` example above its mock implementation. Uncomment it, delete
   the mock body below, and make sure your endpoint returns the same shape
   (documented in `src/data/mockData.js`).
3. Once every function in `api.js` hits your backend, you can delete
   `src/data/mockData.js`.

### Expected endpoints (suggested)

| Function              | Method & path                                    |
| ---------------------- | ------------------------------------------------- |
| `getStations`          | `GET /stations`                                   |
| `getStationById`       | `GET /stations/:id`                               |
| `getAvailableSlots`    | `GET /stations/:id/ports/:portId/slots?date=`      |
| `createBooking`        | `POST /bookings`                                  |
| `getMyBookings`        | `GET /bookings/me`                                |
| `cancelBooking`        | `POST /bookings/:id/cancel`                       |
| `getProfile`           | `GET /profile`                                    |
| `updateProfile`        | `PUT /profile`                                    |

Station and port status should be one of `available`, `waiting`, or `full`
(see `STATUS` in `src/services/api.js`). For `waiting`, include a
`waitMins` estimate.

## Notes

- Bookings and profile are currently persisted to `localStorage` by the mock
  layer so data survives a refresh during development — remove that once a
  real backend is connected.
- Dark, "tech" visual theme with a signature charge-ring gauge showing free
  ports per station at a glance.
