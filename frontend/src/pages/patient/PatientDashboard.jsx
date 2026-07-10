import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

import { toast } from 'react-hot-toast'
import {
  Calendar, Clock, FileText, CreditCard, Bell,
  User, Star, Download, CheckCircle, XCircle,
  Loader2, Upload, MessageSquare, Activity, X,
  Camera, CheckCheck, Trash2, Video, HeartPulse, File
} from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '../../lib/utils'



export default function PatientDashboard() {
  const { user, signOut, uploadAvatar, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [notifications, setNotifications] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', phone: '', city: '', gender: '', address: '', date_of_birth: '', avatar_url: ''
  })
  const [uploading, setUploading] = useState(false)
  const [reviewModal, setReviewModal] = useState({ open: false, appointmentId: '', doctorId: '' })
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfileForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      city: user.city || '',
      gender: user.gender || '',
      address: user.address || '',
      date_of_birth: (user.date_of_birth && !isNaN(new Date(user.date_of_birth).getTime())) ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
      avatar_url: user.avatar_url || ''
    })
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [apptsRes, reportsRes, notifsRes, paymentsRes] = await Promise.allSettled([
        api.get('/appointments/patient'),
        api.get('/medical-reports'),
        api.get('/notifications'),
        api.get('/payments/me'),
      ])
      
      if (apptsRes.status === 'fulfilled') {
        setAppointments(apptsRes.value.data || [])
      }

      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.data || [])
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data || [])
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      const payload = { ...profileForm }
      if (!payload.date_of_birth) delete payload.date_of_birth;

      await api.put('/patients/profile', payload)
      await refreshUser()
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const url = await uploadAvatar(file);
      setProfileForm(prev => ({ ...prev, avatar_url: url }));
      toast.success('Image uploaded! Click Save Profile to apply.');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  }

  const handleUploadReport = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('report', file)
      const uploadRes = await api.post('/upload/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const fileExt = file.name.split('.').pop()
      await api.post('/medical-reports', {
        title: file.name,
        file_url: uploadRes.data.url,
        file_type: fileExt,
      })
      toast.success('Report uploaded')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelAppointment = async (id) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: 'cancelled' })
      toast.success('Appointment cancelled')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed')
    }
  }

  const handlePay = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}/status`, { status: 'completed' })
      toast.success('Payment completed successfully!')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed')
    }
  }

  const handleSubmitReview = async () => {
    if (!user || !reviewModal.appointmentId) return
    setReviewSubmitting(true)
    try {
      await api.post('/reviews', {
        appointment_id: reviewModal.appointmentId,
        doctor_id: reviewModal.doctorId,
        rating: reviewForm.rating,
        review: reviewForm.review,
      })
      toast.success('Review submitted!')
      setReviewModal({ open: false, appointmentId: '', doctorId: '' })
      setReviewForm({ rating: 5, review: '' })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review failed')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      loadData()
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/medical-reports/${id}`)
      toast.success('Report deleted')
      loadData()
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }

  const handleDownloadReceipt = (paymentId) => {
    toast.success('Downloading receipt...')
  }

  const tabs = [
    { id: 'appointments' , label: 'Appointments', icon: Calendar },
    { id: 'reports' , label: 'Reports', icon: FileText },
    { id: 'notifications' , label: 'Notifications', icon: Bell },
    { id: 'payments' , label: 'Payments', icon: CreditCard },
    { id: 'profile' , label: 'Profile', icon: User },
  ]

  const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status))
  const past = appointments.filter(a => ['completed', 'rejected', 'cancelled'].includes(a.status))
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">Welcome, {user?.first_name || 'Patient'}!</h1>
                <p className="text-sm text-slate-500">Manage your appointments, health records, and more</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-teal-700">{upcoming.length}</div>
                <div className="text-xs text-slate-600">Upcoming</div>
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-blue-700">{past.length}</div>
                <div className="text-xs text-slate-600">Past</div>
              </div>
              <div className="bg-amber-50 rounded-lg px-4 py-2 text-center relative">
                <div className="text-lg font-bold text-amber-700">{unreadCount}</div>
                <div className="text-xs text-slate-600">Unread</div>
                {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
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
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : (
              <>
                {/* Appointments */}
                {activeTab === 'appointments' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                      <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" /> Upcoming Appointments
                      </h2>
                      {upcoming.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">No upcoming appointments.</p>
                          <button onClick={() => navigate('/doctors')} className="mt-4 text-teal-600 font-medium hover:text-teal-700">Book an Appointment</button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {upcoming.map((appt) => (
                            <div key={appt._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:border-teal-100 hover:shadow-md transition-all gap-4">
                              <div className="flex items-center gap-4">
                                <img 
                                  src={appt.doctor?.user?.avatar_url || 'https://via.placeholder.com/150'} 
                                  alt="Doctor" 
                                  className="w-14 h-14 rounded-full object-cover border-2 border-teal-50"
                                />
                                <div>
                                  <p className="font-bold text-slate-900 text-lg">Dr. {appt.doctor?.user?.first_name} {appt.doctor?.user?.last_name}</p>
                                  <p className="text-sm text-teal-600 font-medium">{appt.doctor?.specializations?.name}</p>
                                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> {formatDate(appt.slot_date)} at {formatTime(appt.slot_time)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${
                                  appt.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {appt.status === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                  {appt.status.toUpperCase()}
                                </span>
                                {appt.status === 'approved' && (
                                  <>
                                    <button
                                      onClick={() => navigate(`/chat/${appt._id}`)}
                                      className="text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                                    >
                                      <MessageSquare className="w-4 h-4" /> Message
                                    </button>
                                    <button
                                      onClick={() => navigate(`/chat/${appt._id}`)}
                                      className="text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                                    >
                                      <Video className="w-4 h-4" /> Join Call
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleCancelAppointment(appt._id)}
                                  className="text-sm text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-2 rounded-lg transition-colors font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" /> Past Appointments
                      </h2>
                      {past.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">No past appointments.</p>
                      ) : (
                        <div className="space-y-3">
                          {past.map((appt) => (
                            <div key={appt._id} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-100">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Activity className="w-6 h-6 text-slate-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">Dr. {appt.doctor?.user?.first_name} {appt.doctor?.user?.last_name}</p>
                                  <p className="text-sm text-slate-500">{formatDate(appt.slot_date)} at {formatTime(appt.slot_time)}</p>
                                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${
                                    appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {appt.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {appt.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/chat/${appt._id}`)}
                                  className="text-sm text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" /> Chat
                                </button>
                                {appt.status === 'completed' && (
                                  <button
                                    onClick={() => setReviewModal({ open: true, appointmentId: appt._id, doctorId: appt.doctor._id })}
                                    className="text-sm text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <Star className="w-3 h-3" /> Review
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reports */}
                {activeTab === 'reports' && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" /> Medical Reports
                      </h2>
                      <label className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors cursor-pointer shadow-sm">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload New Report'}
                        <input type="file" className="hidden" onChange={handleUploadReport} accept=".pdf,.png,.jpg,.jpeg" />
                      </label>
                    </div>
                    {reports.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No medical reports uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reports.map((rep) => (
                          <div key={rep._id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-teal-200 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                                <File className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-900 truncate max-w-[150px]" title={rep.title}>{rep.title}</p>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(rep.createdAt)}</p>
                                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {rep.file_type?.toUpperCase() || 'PDF'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <a href={rep.file_url} target="_blank" rel="noreferrer" className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Download">
                                <Download className="w-5 h-5" />
                              </a>
                              <button onClick={() => handleDeleteReport(rep._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-teal-600" /> Notifications
                      </h2>
                      {notifications.length > 0 && (
                        <button onClick={markAllRead} className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg">
                          <CheckCheck className="w-4 h-4" /> Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No new notifications.</p>
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 pb-4">
                        {notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markRead(n._id)}
                            className={`relative pl-6 cursor-pointer group`}
                          >
                            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${n.is_read ? 'bg-slate-300' : 'bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]'}`} />
                            <div className={`p-4 rounded-xl border transition-all ${
                              n.is_read ? 'bg-white border-slate-100 group-hover:border-slate-200' : 'bg-teal-50/50 border-teal-100 group-hover:bg-teal-50'
                            }`}>
                              <p className={`font-semibold text-sm ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                              <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatDate(n.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Payments */}
                {activeTab === 'payments' && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-teal-600" /> Payment History
                    </h2>
                    {payments.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No payment history.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((p) => (
                          <div key={p._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-teal-200 transition-colors gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${
                                p.status === 'completed' ? 'bg-emerald-50 border-emerald-50 text-emerald-600' : 'bg-amber-50 border-amber-50 text-amber-600'
                              }`}>
                                <CreditCard className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-lg">Consultation: Dr. {p.doctor?.user?.first_name} {p.doctor?.user?.last_name}</p>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                  <Clock className="w-4 h-4" /> {formatDate(p.created_at)}
                                  <span className="text-slate-300">|</span>
                                  <span className="font-semibold text-slate-700">Inv #{p._id.slice(-6).toUpperCase()}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 sm:justify-end">
                              <div className="text-right">
                                <p className="font-bold text-2xl text-slate-900">{formatCurrency(p.amount / 100)}</p>
                                <span className={`inline-flex items-center justify-center w-full px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider mt-1 ${
                                  p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                              <div className="flex flex-col gap-2">
                                {p.status === 'pending' ? (
                                  <button
                                    onClick={() => handlePay(p._id)}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
                                  >
                                    Pay Now
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDownloadReceipt(p._id)}
                                    className="text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                  >
                                    <Download className="w-4 h-4" /> Receipt
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                      <div className="relative group">
                        {profileForm.avatar_url ? (
                          <img src={profileForm.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                        ) : (
                          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm">
                            <User className="w-10 h-10 text-teal-600" />
                          </div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera className="w-6 h-6" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Profile Picture</h3>
                        <p className="text-sm text-slate-500 mb-3">Upload a clear photo of yourself. Recommended size: 400x400px.</p>
                        <label className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
                          Choose Image
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                      <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-600" /> Personal Information
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name</label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            value={profileForm.first_name}
                            onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            value={profileForm.last_name}
                            onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                          <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            value={profileForm.date_of_birth}
                            onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                          <select
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            value={profileForm.gender}
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address</label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          onClick={handleUpdateProfile}
                          className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={signOut}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Leave a Review</h3>
              <button onClick={() => setReviewModal({ open: false, appointmentId: '', doctorId: '' })} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="transition-colors"
                  >
                    <Star className={`w-7 h-7 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Review</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                placeholder="Share your experience..."
                value={reviewForm.review}
                onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setReviewModal({ open: false, appointmentId: '', doctorId: '' })}
                className="text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
