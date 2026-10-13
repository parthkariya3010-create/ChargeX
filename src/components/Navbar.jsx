import { NavLink } from 'react-router-dom'
import { Zap, MapPin, CalendarClock, UserCircle2, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Stations', icon: MapPin, end: true },
  { to: '/bookings', label: 'My Bookings', icon: CalendarClock },
]

export default function Navbar() {
  const { isAuthenticated, user, isStaff, role, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent shadow-glow">
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-text-primary">
            CHARGE<span className="text-accent">X</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}

          {isStaff && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent2/20 text-accent2' : 'text-accent2/80 hover:text-accent2'
                }`
              }
            >
              <Shield size={15} />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          )}

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                <UserCircle2 size={15} />
                <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
                {role !== 'DRIVER' && (
                  <span className="ml-0.5 rounded bg-accent2/20 px-1.5 py-0.2 text-[10px] font-mono text-accent2">
                    {role}
                  </span>
                )}
              </NavLink>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-danger"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <UserCircle2 size={15} />
              <span className="hidden sm:inline">Sign in</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
