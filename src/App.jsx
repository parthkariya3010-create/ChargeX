import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Stations from './pages/Stations'
import StationDetail from './pages/StationDetail'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageStations from './pages/admin/ManageStations'
import ManageBookings from './pages/admin/ManageBookings'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { isAuthenticated, isStaff } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isStaff) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-base bg-dot-grid">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Stations />} />
          <Route path="/stations/:stationId" element={<StationDetail />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin / Host Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/stations"
            element={
              <AdminRoute>
                <ManageStations />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <ManageBookings />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
