import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

import { toast } from 'react-hot-toast'
import {
  Users, Stethoscope, Calendar, DollarSign, Shield,
  Search, Loader2, Activity,
  Star, Ban, Trash2, BarChart3,
  CheckCircle2
} from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '../../lib/utils'



export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [specializations, setSpecializations] = useState([])
  const [newSpec, setNewSpec] = useState('')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [statsRes, usersRes, docsRes, apptsRes, revsRes, specsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/doctors'),
        api.get('/admin/appointments'),
        api.get('/admin/reviews'),
        api.get('/specializations'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data || [])
      setDoctors(docsRes.data || [])
      setAppointments(apptsRes.data || [])
      setReviews(revsRes.data || [])
      setSpecializations(specsRes.data || [])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDoctor = async (id, verified) => {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { is_verified: verified })
      toast.success(verified ? 'Doctor verified' : 'Verification revoked')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification update failed')
    }
  }

  const handleBlockUser = async (id, active) => {
    try {
      await api.put(`/admin/users/${id}/active`, { is_active: active })
      toast.success(active ? 'User unblocked' : 'User blocked')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  const handleDeleteDoctor = async (id) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return
    try {
      await api.delete(`/admin/doctors/${id}`)
      toast.success('Doctor deleted')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  const handleAddSpec = async () => {
    if (!newSpec.trim()) return
    try {
      await api.post('/specializations', { name: newSpec.trim() })
      toast.success('Specialization added')
      setNewSpec('')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add specialization')
    }
  }

  const handleDeleteSpec = async (id) => {
    if (!confirm('Delete this specialization?')) return
    try {
      await api.delete(`/specializations/${id}`)
      toast.success('Specialization deleted')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete specialization')
    }
  }

  const tabs = [
    { id: 'overview' , label: 'Overview', icon: BarChart3 },
    { id: 'users' , label: 'Users', icon: Users },
    { id: 'doctors' , label: 'Doctors', icon: Stethoscope },
    { id: 'appointments' , label: 'Appointments', icon: Calendar },
    { id: 'reviews' , label: 'Reviews', icon: Star },
  ]

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase()
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase()
    return name.includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q)
  })

  const filteredDoctors = doctors.filter(d => {
    const q = searchQuery.toLowerCase()
    const name = `${(d ).user?.first_name || ''} ${(d ).user?.last_name || ''}`.toLowerCase()
    return name.includes(q) || (d.specialization?.name || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">Manage users, doctors, appointments, and platform settings</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-teal-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-teal-700">{stats?.total_users || users.length}</div>
                <div className="text-xs text-slate-600">Users</div>
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-blue-700">{stats?.total_doctors || doctors.length}</div>
                <div className="text-xs text-slate-600">Doctors</div>
              </div>
              <div className="bg-emerald-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-emerald-700">{stats?.total_appointments || appointments.length}</div>
                <div className="text-xs text-slate-600">Appointments</div>
              </div>
              <div className="bg-amber-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-amber-700">{formatCurrency((stats?.total_revenue || 0) / 100)}</div>
                <div className="text-xs text-slate-600">Revenue</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                    activeTab === tab.id ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 mt-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Specializations</h3>
              <div className="space-y-2 mb-3">
                {specializations.map((s) => (
                  <div key={s._id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{s.name}</span>
                    <button onClick={() => handleDeleteSpec(s._id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Add new..."
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                />
                <button onClick={handleAddSpec} className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-teal-700">+</button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Search bar for tables */}
            {activeTab !== 'overview' && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : (
              <>
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Overview</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5">
                          <Users className="w-8 h-8 text-teal-600 mb-3" />
                          <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                          <div className="text-sm text-slate-600">Total Users</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                          <Stethoscope className="w-8 h-8 text-blue-600 mb-3" />
                          <div className="text-2xl font-bold text-slate-900">{doctors.length}</div>
                          <div className="text-sm text-slate-600">Total Doctors</div>
                          <div className="text-xs text-amber-600 mt-1">{doctors.filter(d => !d.is_verified).length} pending</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5">
                          <Calendar className="w-8 h-8 text-emerald-600 mb-3" />
                          <div className="text-2xl font-bold text-slate-900">{appointments.length}</div>
                          <div className="text-sm text-slate-600">Total Appointments</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5">
                          <DollarSign className="w-8 h-8 text-amber-600 mb-3" />
                          <div className="text-2xl font-bold text-slate-900">{formatCurrency((stats?.total_revenue || 0) / 100)}</div>
                          <div className="text-sm text-slate-600">Total Revenue</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
                      <div className="space-y-3">
                        {appointments.slice(0, 5).map((appt) => (
                          <div key={appt._id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">Appointment with Dr. {(appt.doctor )?.user?.first_name} {(appt.doctor )?.user?.last_name}</p>
                                <p className="text-xs text-slate-500">{formatDate(appt.createdAt)} | {appt.patient?.first_name} {appt.patient?.last_name}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              appt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              appt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>{appt.status}</span>
                          </div>
                        ))}
                        {appointments.length === 0 && <p className="text-sm text-slate-500 py-4">No recent activity.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Users */}
                {activeTab === 'users' && (
                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Name</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Role</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Joined</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u) => (
                            <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">{u.first_name} {u.last_name}</div>
                                <div className="text-xs text-slate-500">{u.city || 'No city'}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                  u.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                                  'bg-teal-100 text-teal-700'
                                }`}>{u.role}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>{u.is_active ? 'Active' : 'Blocked'}</span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleBlockUser(u._id, !u.is_active)}
                                    className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    title={u.is_active ? 'Block' : 'Unblock'}
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12 text-slate-500">No users found</div>
                    )}
                  </div>
                )}

                {/* Doctors */}
                {activeTab === 'doctors' && (
                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Doctor</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Specialty</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Fee</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDoctors.map((d) => (
                            <tr key={d._id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">Dr. {(d ).user?.first_name} {(d ).user?.last_name}</div>
                                <div className="text-xs text-slate-500">{d.qualification || 'MBBS'} | {d.experience_years} yrs</div>
                              </td>
                              <td className="px-4 py-3">{d.specialization?.name || 'N/A'}</td>
                              <td className="px-4 py-3">${d.consultation_fee || 0}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  d.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>{d.is_verified ? 'Verified' : 'Pending'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleVerifyDoctor(d._id, !d.is_verified)}
                                    className={`p-1.5 rounded-lg transition-colors ${d.is_verified ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    title={d.is_verified ? 'Revoke' : 'Verify'}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBlockUser(d.user?._id, !(d ).user?.is_active)}
                                    className={`p-1.5 rounded-lg transition-colors ${(d ).user?.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    title={(d ).user?.is_active ? 'Block' : 'Unblock'}
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDoctor(d._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredDoctors.length === 0 && (
                      <div className="text-center py-12 text-slate-500">No doctors found</div>
                    )}
                  </div>
                )}

                {/* Appointments */}
                {activeTab === 'appointments' && (
                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Patient</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Doctor</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Date</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((a) => (
                            <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="px-4 py-3">{a.patient?.first_name} {a.patient?.last_name}</td>
                              <td className="px-4 py-3">Dr. {(a.doctor )?.user?.first_name} {(a.doctor )?.user?.last_name}</td>
                              <td className="px-4 py-3">{formatDate(a.slot_date)} at {formatTime(a.slot_time)}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                  a.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  a.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>{a.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {appointments.length === 0 && (
                      <div className="text-center py-12 text-slate-500">No appointments</div>
                    )}
                  </div>
                )}

                {/* Reviews */}
                {activeTab === 'reviews' && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">All Reviews</h2>
                    {reviews.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4">No reviews yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((rev) => (
                          <div key={rev._id} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map(i => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-slate-900">{rev.patient?.first_name} {rev.patient?.last_name}</span>
                              <span className="text-xs text-slate-400">to Dr. {(rev.doctor )?.user?.first_name} {(rev.doctor )?.user?.last_name}</span>
                            </div>
                            <p className="text-sm text-slate-600">{rev.review || 'No written review'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
