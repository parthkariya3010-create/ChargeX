import { NavLink } from 'react-router-dom'
import { Zap, MapPin, CalendarClock, UserCircle2, LogOut, Sun, Moon, Monitor } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/', label: 'Stations', icon: MapPin, end: true },
  { to: '/bookings', label: 'My Bookings', icon: CalendarClock },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent shadow-glow">
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-text-primary">
            Charge<span className="text-accent">Grid</span>
          </span>
        </div>

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

          <div className="mx-1 h-6 w-px bg-border" />

          <div className="flex items-center gap-0.5 rounded-full bg-elevated px-1 py-0.5">
            <button
              onClick={() => setTheme('light')}
              title="Light theme"
              className={`rounded-full p-1.5 transition-colors ${
                theme === 'light' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark theme"
              className={`rounded-full p-1.5 transition-colors ${
                theme === 'dark' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System theme"
              className={`rounded-full p-1.5 transition-colors ${
                theme === 'system' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Monitor size={14} />
            </button>
          </div>

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
