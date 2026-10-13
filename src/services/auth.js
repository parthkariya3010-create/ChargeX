const rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
const BASE_URL = rawBase.replace(/\/api\/?$/, '')

async function fetchJson(url, options) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      let errorMsg = `Request failed (${res.status})`
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
      throw new Error(`Cannot reach server at ${url}. Make sure the backend is running on port 8081.`)
    }
    throw e
  }
}

export async function loginRequest(email, password) {
  return fetchJson(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function signupRequest(name, email, password, phone, role = 'DRIVER') {
  return fetchJson(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, role }),
  })
}
