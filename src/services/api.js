const rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
const BASE_URL = rawBase.replace(/\/api\/?$/, '')

function getToken() {
  try {
    return localStorage.getItem('cg_token')
  } catch {
    return null
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      let errorMsg = `HTTP ${res.status}`
      try {
        const err = JSON.parse(text)
        errorMsg = err.error || errorMsg
      } catch {
        if (text) errorMsg = text
      }
      throw new Error(errorMsg)
    }

    return res.json()
  } catch (e) {
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
      throw new Error(`Cannot reach server. Make sure the backend is running on port 8081.`)
    }
    throw e
  }
}

// ---- Stations ---------------------------------------------------------

export async function getStations(lat, lng) {
  let path = '/api/stations'
  if (lat !== undefined && lng !== undefined) {
    path += `?lat=${lat}&lng=${lng}`
  }
  return request('GET', path)
}

export async function getStationById(stationId, lat, lng) {
  let path = `/api/stations/${stationId}`
  if (lat !== undefined && lng !== undefined) {
    path += `?lat=${lat}&lng=${lng}`
  }
  return request('GET', path)
}

// ---- Slots --------------------------------------------------------------

export async function getAvailableSlots(stationId, portId, dateISO) {
  return request('GET', `/api/stations/${stationId}/ports/${portId}/slots?date=${dateISO}`)
}

// ---- Bookings -------------------------------------------------------------

export async function createBooking({ stationId, portId, date, startTime, vehicleRegNumber }) {
  return request('POST', '/api/bookings', { stationId, portId, date, startTime, vehicleRegNumber })
}

export async function getMyBookings() {
  return request('GET', '/api/bookings/me')
}

export async function cancelBooking(bookingId) {
  return request('POST', `/api/bookings/${bookingId}/cancel`)
}

// ---- Profile ----------------------------------------------------------

export async function getProfile() {
  return request('GET', '/api/profile')
}

export async function updateProfile(profile) {
  return request('PUT', '/api/profile', profile)
}

// ---- Admin & Station Management ---------------------------------------

export async function getAdminStats() {
  return request('GET', '/api/admin/stats')
}

export async function getAdminBookings(status) {
  const query = status ? `?status=${status}` : ''
  return request('GET', `/api/admin/bookings${query}`)
}

export async function updateBookingStatus(id, status) {
  return request('PATCH', `/api/admin/bookings/${id}/status`, { status })
}

export async function getAdminUsers() {
  return request('GET', '/api/admin/users')
}

export async function createStation(station) {
  return request('POST', '/api/stations', station)
}

export async function updateStation(stationId, station) {
  return request('PUT', `/api/stations/${stationId}`, station)
}

export async function deleteStation(stationId) {
  return request('DELETE', `/api/stations/${stationId}`)
}

export async function createPort(stationId, port) {
  return request('POST', `/api/stations/${stationId}/ports`, port)
}

export async function updatePort(stationId, portId, port) {
  return request('PUT', `/api/stations/${stationId}/ports/${portId}`, port)
}

export async function deletePort(stationId, portId) {
  return request('DELETE', `/api/stations/${stationId}/ports/${portId}`)
}

// ---- Status helper (used by frontend components) -----------------------

export const STATUS = {
  AVAILABLE: 'available',
  WAITING: 'waiting',
  FULL: 'full',
}
