import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Stethoscope, Bell, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isDoctor, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const dashboardLink = isAdmin ? '/admin' : isDoctor ? '/doctor-dashboard' : '/dashboard'

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">MediBook</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Home</Link>
            <Link to="/doctors" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Doctors</Link>
            <Link to="/about" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to={dashboardLink} className="text-slate-600 hover:text-teal-600 transition-colors">
                  <Bell className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
                  >
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-teal-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700">{user?.full_name || 'User'}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1">
                      <Link to={dashboardLink} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <Link to="/" className="block text-slate-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/doctors" className="block text-slate-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Doctors</Link>
          <Link to="/about" className="block text-slate-600 font-medium py-2" onClick={() => setMobileOpen(false)}>About</Link>
          <Link to="/contact" className="block text-slate-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Contact</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink} className="block text-slate-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block text-red-600 font-medium py-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-slate-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="block text-teal-600 font-medium py-2" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
