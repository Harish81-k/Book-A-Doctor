import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

import { toast } from 'react-hot-toast'
import {
  Calendar, Users, DollarSign, Star, Clock, Settings, CheckCircle,
  FileCheck, MessageSquare, Activity, Loader2, Camera,
  Briefcase, TrendingUp, Trash2, MapPin, X, Globe, Languages, Video
} from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '../../lib/utils'



export default function DoctorDashboard() {
  const { user, uploadAvatar, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [reviews, setReviews] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [docProfile, setDocProfile] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [slotForm, setSlotForm] = useState({
    slot_date: new Date().toISOString().split('T')[0], start_time: '09:00', end_time: '17:00'
  })
  const [profileForm, setProfileForm] = useState({
    bio: '', qualification: '', experience_years: '', consultation_fee: '',
    hospital_name: '', registration_number: '',
    address: '', city: '', state: '', country: '', zip_code: '',
    latitude: null, longitude: null, avatar_url: ''
  })
  const [languages, setLanguages] = useState([])
  const [langInput, setLangInput] = useState('')
  const [specializations, setSpecializations] = useState([])
  const [selectedSpec, setSelectedSpec] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [apptsRes, revsRes, paysRes, docRes, specsRes] = await Promise.all([
        api.get('/appointments/doctor'),
        api.get('/reviews/doctor/me'),
        api.get('/payments/me'),
        api.get('/doctors/me'),
        api.get('/specializations'),
      ])
      
      setAppointments(apptsRes.data || [])
      setReviews(revsRes.data || [])
      setPayments(paysRes.data || [])
      setDocProfile(docRes.data)
      setSpecializations(specsRes.data || [])
      
      if (docRes.data) {
        setProfileForm({
          bio: docRes.data.bio || '', qualification: docRes.data.qualification || '',
          experience_years: String(docRes.data.experience_years || ''),
          consultation_fee: String(docRes.data.consultation_fee || ''),
          hospital_name: docRes.data.hospital_name || '',
          registration_number: docRes.data.registration_number || '',
          address: docRes.data.address || '',
          city: docRes.data.city || '',
          state: docRes.data.state || '',
          country: docRes.data.country || '',
          zip_code: docRes.data.zip_code || '',
          latitude: docRes.data.latitude || null,
          longitude: docRes.data.longitude || null,
          avatar_url: user?.avatar_url || ''
        })
        setLanguages(docRes.data.languages || [])
        setSelectedSpec(docRes.data.specialization?._id || '')
        
        try {
          const slotsRes = await api.get(`/doctors/${docRes.data._id}/slots`)
          setTimeSlots(slotsRes.data || [])
        } catch(err) {
          console.error("Failed to fetch slots", err)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status })
      toast.success(`Appointment ${status}`)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update to ${status}`)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      await api.put('/doctors/profile', {
        ...profileForm,
        experience_years: parseInt(profileForm.experience_years) || 0,
        consultation_fee: parseInt(profileForm.consultation_fee) || 0,
        specialization: selectedSpec || undefined,
        languages,
      })
      await refreshUser()
      toast.success('Profile updated')
      loadData()
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

  const handleAddSlot = async () => {
    try {
      await api.post('/doctors/slots', slotForm)
      toast.success('Time slot added')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add time slot')
    }
  }

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return
    try {
      await api.delete(`/doctors/slots/${id}`)
      toast.success('Time slot deleted')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete time slot')
    }
  }

  const handleAutoDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await response.json()
          const addr = data.address || {}
          setProfileForm(prev => ({
            ...prev,
            address: [addr.road, addr.house_number].filter(Boolean).join(' ') || prev.address,
            city: addr.city || addr.town || addr.village || addr.county || prev.city,
            state: addr.state || prev.state,
            country: addr.country || prev.country,
            zip_code: addr.postcode || prev.zip_code,
            latitude,
            longitude,
          }))
          toast.success('Location detected successfully!')
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
          setProfileForm(prev => ({ ...prev, latitude, longitude }))
          toast.error('Could not resolve address. Coordinates saved.')
        } finally {
          setGeoLoading(false)
        }
      },
      (error) => {
        setGeoLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow location access.')
        } else {
          toast.error('Could not detect location. Please try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleAddLanguage = (e) => {
    if (e.key === 'Enter' && langInput.trim()) {
      e.preventDefault()
      const lang = langInput.trim()
      if (!languages.includes(lang)) {
        setLanguages([...languages, lang])
      }
      setLangInput('')
    }
  }

  const handleRemoveLanguage = (lang) => {
    setLanguages(languages.filter(l => l !== lang))
  }

  const tabs = [
    { id: 'appointments' , label: 'Appointments', icon: Calendar },
    { id: 'patients' , label: 'Patients', icon: Users },
    { id: 'slots' , label: 'Time Slots', icon: Clock },
    { id: 'reviews' , label: 'Reviews', icon: Star },
    { id: 'earnings' , label: 'Earnings', icon: DollarSign },
    { id: 'profile' , label: 'Profile', icon: Settings },
  ]

  const pending = appointments.filter(a => a.status === 'pending')
  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.slot_date && a.slot_date.split('T')[0] === today)
  const totalEarnings = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const uniquePatients = new Set(appointments.map(a => a.patient_id)).size

  const patientList = appointments.reduce((acc, appt) => {
    if (!acc.find(p => p.patient?._id === appt.patient?._id)) {
      acc.push({
        patient_id: appt.patient?._id,
        patient: appt.patient,
        count: appointments.filter(a => a.patient?._id === appt.patient?._id).length,
      })
    }
    return acc
  }, [])

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
                  <Briefcase className="w-8 h-8 text-teal-600" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dr. {user?.first_name} {user?.last_name}</h1>
                <p className="text-sm text-slate-500">{docProfile?.specialization?.name || 'Doctor'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    docProfile?.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <CheckCircle className="w-3 h-3" /> {docProfile?.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-teal-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-teal-700">{todayAppts.length}</div>
                <div className="text-xs text-slate-600">Today</div>
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-blue-700">{pending.length}</div>
                <div className="text-xs text-slate-600">Pending</div>
              </div>
              <div className="bg-emerald-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-emerald-700">{formatCurrency(totalEarnings / 100)}</div>
                <div className="text-xs text-slate-600">Earnings</div>
              </div>
              <div className="bg-amber-50 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-amber-700">{uniquePatients}</div>
                <div className="text-xs text-slate-600">Patients</div>
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
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" /> Today's Appointments
                      </h2>
                      {todayAppts.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">No appointments today.</p>
                      ) : (
                        <div className="space-y-3">
                          {todayAppts.map((appt) => (
                            <div key={appt._id} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                  <Activity className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm text-slate-900">{appt.patient?.first_name} {appt.patient?.last_name}</p>
                                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                                      appt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                      appt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                      appt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {appt.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">{formatTime(appt.slot_time)} | {appt.problem_description?.slice(0, 40) || 'No description'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {appt.status === 'approved' && (
                                  <>
                                    <button
                                      onClick={() => navigate(`/chat/${appt._id}`)}
                                      className="text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                                    >
                                      <MessageSquare className="w-4 h-4" /> Message
                                    </button>
                                    <button
                                      onClick={() => navigate(`/chat/${appt._id}`)}
                                      className="text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                                    >
                                      <Video className="w-4 h-4" /> Join Call
                                    </button>
                                  </>
                                )}
                                {appt.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, 'approved')}
                                    className="text-sm text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    Approve
                                  </button>
                                )}
                                {appt.status !== 'completed' && appt.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, 'completed')}
                                    className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    Complete
                                  </button>
                                )}
                                {appt.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, 'rejected')}
                                    className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" /> All Appointments
                      </h2>
                      {appointments.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">No appointments yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {appointments.map((appt) => (
                            <div key={appt._id} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Activity className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-slate-900">{appt.patient?.first_name} {appt.patient?.last_name}</p>
                                  <p className="text-xs text-slate-500">{formatDate(appt.slot_date)} at {formatTime(appt.slot_time)}</p>
                                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${
                                    appt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    appt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    appt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {appt.status}
                                  </span>
                                </div>
                              </div>
                              {appt.status === 'approved' && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => navigate(`/chat/${appt._id}`)} className="text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" /> Message
                                  </button>
                                </div>
                              )}
                              {appt.status === 'pending' && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleUpdateStatus(appt._id, 'approved')} className="text-sm text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg">Approve</button>
                                  <button onClick={() => handleUpdateStatus(appt._id, 'rejected')} className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg">Reject</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Patients */}
                {activeTab === 'patients' && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-600" /> My Patients
                    </h2>
                    {patientList.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4">No patients yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {patientList.map((p) => (
                          <div key={p.patient_id} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-slate-900">{p.patient?.first_name} {p.patient?.last_name}</p>
                                <p className="text-xs text-slate-500">{p.count} appointment(s)</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {appointments.filter(a => a.patient?._id === p.patient_id && (a.status === 'approved' || a.status === 'completed')).length > 0 && (
                                <button 
                                  onClick={() => {
                                    const appt = appointments.find(a => a.patient?._id === p.patient_id && (a.status === 'approved' || a.status === 'completed'));
                                    if(appt) navigate(`/chat/${appt._id}`);
                                  }}
                                  className="text-sm text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" /> Chat
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews */}
                {activeTab === 'reviews' && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-teal-600" /> Patient Reviews
                    </h2>
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
                              <span className="text-xs text-slate-400">{formatDate(rev.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-600">{rev.review || 'No written review'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Earnings */}
                {activeTab === 'earnings' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-600" /> Earnings Overview
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-teal-50 rounded-xl p-5 text-center">
                          <TrendingUp className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-teal-700">{formatCurrency(totalEarnings / 100)}</div>
                          <div className="text-xs text-slate-600">Total Earnings</div>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-5 text-center">
                          <FileCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-700">{payments.filter(p => p.status === 'completed').length}</div>
                          <div className="text-xs text-slate-600">Completed Payments</div>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-5 text-center">
                          <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-amber-700">{payments.filter(p => p.status === 'pending').length}</div>
                          <div className="text-xs text-slate-600">Pending Payments</div>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment History</h3>
                      {payments.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">No payments yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {payments.map((p) => (
                            <div key={p._id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === 'completed' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                  <DollarSign className={`w-4 h-4 ${p.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-slate-900">{formatCurrency(p.amount / 100)}</p>
                                  <p className="text-xs text-slate-500">{formatDate(p.created_at)}</p>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {p.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Time Slots */}
                {activeTab === 'slots' && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-600" /> Manage Time Slots
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                          value={slotForm.slot_date}
                          onChange={(e) => setSlotForm({ ...slotForm, slot_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                          value={slotForm.start_time}
                          onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">End Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                          value={slotForm.end_time}
                          onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAddSlot}
                          className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                        >
                          Add Slot
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Your Current Slots</h3>
                    {timeSlots.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4">No time slots added yet. Add some slots above.</p>
                    ) : (
                      <div className="space-y-2">
                        {Array.from(new Set(timeSlots.map(s => s.slot_date))).sort().map((dateStr) => {
                          const daySlots = timeSlots.filter(s => s.slot_date === dateStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
                          if (daySlots.length === 0) return null;
                          return (
                            <div key={dateStr} className="mb-4">
                              <h4 className="text-sm font-medium text-slate-800 mb-2">{formatDate(dateStr)}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {daySlots.map(slot => (
                                  <div key={slot._id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                      <Clock className="w-4 h-4 text-slate-400" />
                                      {slot.start_time} - {slot.end_time}
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteSlot(slot._id)}
                                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile Image Upload */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative group">
                        {profileForm.avatar_url ? (
                          <img src={profileForm.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                        ) : (
                          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm">
                            <Briefcase className="w-10 h-10 text-teal-600" />
                          </div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera className="w-6 h-6" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Profile Picture</h3>
                        <p className="text-sm text-slate-500 mb-3">Upload a professional image of yourself. Recommended size: 400x400px.</p>
                        <label className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition-colors">
                          Choose Image
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-teal-600" /> Professional Info
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                          <select
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                            value={selectedSpec}
                            onChange={(e) => setSelectedSpec(e.target.value)}
                          >
                            <option value="">Select Specialization</option>
                            {specializations.map((s) => (
                              <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Qualification</label>
                          <input
                            placeholder="e.g. MBBS, MD, MS"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.qualification}
                            onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
                          <input
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.experience_years}
                            onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (₹)</label>
                          <input
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.consultation_fee}
                            onChange={(e) => setProfileForm({ ...profileForm, consultation_fee: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Hospital / Clinic</label>
                          <input
                            placeholder="Hospital or clinic name"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.hospital_name}
                            onChange={(e) => setProfileForm({ ...profileForm, hospital_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                          <input
                            placeholder="Medical council registration"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.registration_number}
                            onChange={(e) => setProfileForm({ ...profileForm, registration_number: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                          <textarea
                            rows={3}
                            placeholder="Tell patients about yourself, your approach, and experience..."
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-teal-600" /> Location
                        </h2>
                        <button
                          onClick={handleAutoDetectLocation}
                          disabled={geoLoading}
                          className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors disabled:opacity-50 border border-teal-200"
                        >
                          {geoLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                          {geoLoading ? 'Detecting...' : '📍 Auto-detect Location'}
                        </button>
                      </div>
                      {profileForm.latitude && profileForm.longitude && (
                        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          Coordinates: {profileForm.latitude.toFixed(4)}, {profileForm.longitude.toFixed(4)}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                          <input
                            placeholder="Street address"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                          <input
                            placeholder="City"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                          <input
                            placeholder="State / Province"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.state}
                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                          <input
                            placeholder="Country"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">ZIP / Pin Code</label>
                          <input
                            placeholder="Postal code"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.zip_code}
                            onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Languages className="w-5 h-5 text-teal-600" /> Languages Spoken
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {languages.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-sm font-medium border border-teal-200"
                          >
                            {lang}
                            <button
                              onClick={() => handleRemoveLanguage(lang)}
                              className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                        {languages.length === 0 && (
                          <span className="text-sm text-slate-400">No languages added yet</span>
                        )}
                      </div>
                      <input
                        placeholder="Type a language and press Enter (e.g. English, Hindi, Telugu)"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        value={langInput}
                        onChange={(e) => setLangInput(e.target.value)}
                        onKeyDown={handleAddLanguage}
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleUpdateProfile}
                      className="w-full sm:w-auto bg-teal-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30"
                    >
                      💾 Save Profile
                    </button>
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
