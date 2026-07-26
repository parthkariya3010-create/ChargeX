// Mock data — swap the service layer in src/services/api.js to hit your real
// backend later. Shapes here are the contract your backend should return.

export const STATUS = {
  AVAILABLE: 'available',
  WAITING: 'waiting',
  FULL: 'full',
}

let stations = [
  {
    id: 'stn_001',
    name: 'Bandra Kurla Power Hub',
    address: 'BKC Connector Road, Bandra East',
    city: 'Mumbai',
    distanceKm: 1.2,
    rating: 4.6,
    amenities: ['Cafe', 'Restroom', 'WiFi'],
    ports: [
      { id: 'p1', type: 'DC Fast', powerKw: 60, pricePerKwh: 18, status: STATUS.AVAILABLE, waitMins: 0 },
      { id: 'p2', type: 'DC Fast', powerKw: 60, pricePerKwh: 18, status: STATUS.AVAILABLE, waitMins: 0 },
      { id: 'p3', type: 'AC Type 2', powerKw: 22, pricePerKwh: 12, status: STATUS.WAITING, waitMins: 15 },
      { id: 'p4', type: 'AC Type 2', powerKw: 22, pricePerKwh: 12, status: STATUS.FULL, waitMins: 0 },
    ],
  },
  {
    id: 'stn_002',
    name: 'Lower Parel Charge Point',
    address: 'Senapati Bapat Marg, Lower Parel',
    city: 'Mumbai',
    distanceKm: 3.8,
    rating: 4.3,
    amenities: ['Restroom', 'Parking'],
    ports: [
      { id: 'p1', type: 'DC Fast', powerKw: 50, pricePerKwh: 19, status: STATUS.WAITING, waitMins: 25 },
      { id: 'p2', type: 'DC Fast', powerKw: 50, pricePerKwh: 19, status: STATUS.FULL, waitMins: 0 },
      { id: 'p3', type: 'AC Type 2', powerKw: 22, pricePerKwh: 11, status: STATUS.FULL, waitMins: 0 },
    ],
  },
  {
    id: 'stn_003',
    name: 'Powai Lakeside Station',
    address: 'Hiranandani Gardens, Powai',
    city: 'Mumbai',
    distanceKm: 6.4,
    rating: 4.8,
    amenities: ['Cafe', 'WiFi', 'Lounge'],
    ports: [
      { id: 'p1', type: 'DC Fast', powerKw: 90, pricePerKwh: 20, status: STATUS.AVAILABLE, waitMins: 0 },
      { id: 'p2', type: 'AC Type 2', powerKw: 22, pricePerKwh: 12, status: STATUS.AVAILABLE, waitMins: 0 },
      { id: 'p3', type: 'AC Type 2', powerKw: 22, pricePerKwh: 12, status: STATUS.AVAILABLE, waitMins: 0 },
    ],
  },
  {
    id: 'stn_004',
    name: 'Andheri Highway Fast Charge',
    address: 'Western Express Highway, Andheri East',
    city: 'Mumbai',
    distanceKm: 5.1,
    rating: 4.1,
    amenities: ['Restroom', 'Convenience Store'],
    ports: [
      { id: 'p1', type: 'DC Fast', powerKw: 120, pricePerKwh: 21, status: STATUS.FULL, waitMins: 0 },
      { id: 'p2', type: 'DC Fast', powerKw: 120, pricePerKwh: 21, status: STATUS.WAITING, waitMins: 10 },
    ],
  },
  {
    id: 'stn_005',
    name: 'Worli Sea Face Chargers',
    address: 'Dr Annie Besant Road, Worli',
    city: 'Mumbai',
    distanceKm: 2.9,
    rating: 4.5,
    amenities: ['Cafe', 'Restroom'],
    ports: [
      { id: 'p1', type: 'AC Type 2', powerKw: 22, pricePerKwh: 12, status: STATUS.AVAILABLE, waitMins: 0 },
      { id: 'p2', type: 'AC Type 2', powerKw: 22, pricePerKwh: 12, status: STATUS.WAITING, waitMins: 8 },
      { id: 'p3', type: 'DC Fast', powerKw: 60, pricePerKwh: 18, status: STATUS.AVAILABLE, waitMins: 0 },
    ],
  },
]

// bookings persisted in localStorage so refreshes don't lose data
const BOOKINGS_KEY = 'cg_bookings'
const PROFILE_KEY = 'cg_profile'

function readBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || []
  } catch {
    return []
  }
}
function writeBookings(list) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list))
}

export const defaultProfile = {
  name: 'Aditya Rao',
  email: 'aditya.rao@example.com',
  phone: '+91 98765 43210',
  vehicle: {
    make: 'Tata',
    model: 'Nexon EV',
    regNumber: 'MH 02 AB 1234',
    connectorType: 'AC Type 2',
  },
}

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || defaultProfile
  } catch {
    return defaultProfile
  }
}
function writeProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export const _store = {
  getStations: () => stations,
  getStation: (id) => stations.find((s) => s.id === id),
  updatePortStatus: (stationId, portId, status, waitMins = 0) => {
    stations = stations.map((s) =>
      s.id !== stationId
        ? s
        : {
            ...s,
            ports: s.ports.map((p) => (p.id === portId ? { ...p, status, waitMins } : p)),
          }
    )
  },
  readBookings,
  writeBookings,
  readProfile,
  writeProfile,
}
