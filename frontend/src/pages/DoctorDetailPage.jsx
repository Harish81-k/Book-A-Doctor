import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

import { toast } from 'react-hot-toast'
import {
  Star, MapPin, Calendar, DollarSign, Briefcase, GraduationCap,
  Stethoscope, ArrowLeft, MessageCircle, CheckCircle,
  Loader2, Send
} from 'lucide-react'

export default function DoctorDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [problem, setProblem] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [slots, setSlots] = useState([])

  useEffect(() => {
    if (!id) return
    const fetchDoctor = async () => {
      try {
        const docRes = await api.get(`/doctors/${id}`)
        setDoctor(docRes.data)
        
        const revsRes = await api.get(`/reviews/doctor/${id}`)
        setReviews(revsRes.data || [])
      } catch (err) {
        console.error('Failed to fetch doctor:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctor()
  }, [id])

  useEffect(() => {
    if (!selectedDate || !doctor) return
    const generateSlots = async () => {
      try {
        const slotsRes = await api.get(`/doctors/${doctor._id}/slots`)
        const ts = slotsRes.data.filter(s => s.slot_date === selectedDate)

        if (ts && ts.length > 0) {
          const times = []
          for (const slot of ts) {
            const start = slot.start_time
            const end = slot.end_time
            let current = new Date(`2000-01-01T${start}`)
            const endTime = new Date(`2000-01-01T${end}`)
            while (current < endTime) {
              times.push(current.toTimeString().slice(0, 5))
              current = new Date(current.getTime() + 30 * 60000)
            }
          }
          const bookedRes = await api.get(`/appointments/booked-slots/${doctor._id}/${selectedDate}`)
          const bookedTimes = bookedRes.data || []
          setSlots(times.filter(t => !bookedTimes.includes(t)))
        } else {
          setSlots([])
        }
      } catch (err) {
        console.error('Failed to generate slots:', err)
        setSlots([])
      }
    }
    generateSlots()
  }, [selectedDate, doctor])

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment')
      return
    }
    if (user?.role !== 'patient') {
      toast.error('Only patients can book appointments')
      return
    }
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }
    setBookingLoading(true)
    try {
      const res = await api.post('/appointments', {
        doctor_id: doctor._id,
        slot_date: selectedDate,
        slot_time: selectedTime,
        problem_description: problem,
      })
      
      const appt = res.data;
      
      // Payment requires an endpoint or handled internally.
      // Assuming a separate call or it's handled properly later.
      // Need a payment endpoint?
      // Wait, we need an endpoint to create a payment!
      await api.post('/payments', {
        appointment_id: appt._id,
        doctor_id: doctor._id,
        amount: doctor.consultation_fee || 0,
      })

      toast.success('Appointment booked! Please complete payment.')
      setBookingOpen(false)
    } catch (err) {
      toast.error(err.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Doctor not found</h2>
          <Link to="/doctors" className="text-teal-600 hover:underline">Back to doctors</Link>
        </div>
      </div>
    )
  }

  const profile = doctor.user

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/doctors" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-teal-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to doctors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <div className="flex items-start gap-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                    <Stethoscope className="w-9 h-9 text-teal-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">Dr. {profile?.first_name} {profile?.last_name}</h1>
                  <p className="text-teal-600 font-medium">{doctor.specialization?.name || 'General Practitioner'}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {doctor.rating || 0} ({doctor.total_reviews || 0} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <Briefcase className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-slate-900">{doctor.experience_years} yrs</div>
                  <div className="text-xs text-slate-500">Experience</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <DollarSign className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-slate-900">${doctor.consultation_fee || 0}</div>
                  <div className="text-xs text-slate-500">Per visit</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <GraduationCap className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-slate-900">{doctor.qualification || 'MBBS'}</div>
                  <div className="text-xs text-slate-500">Qualification</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <MapPin className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-slate-900">{doctor.hospital_name || 'N/A'}</div>
                  <div className="text-xs text-slate-500">Hospital</div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio || 'Experienced doctor committed to providing quality healthcare services.'}</p>
            </div>

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <span key={lang} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">{lang}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{rev.patient?.first_name} {rev.patient?.last_name}</span>
                      </div>
                      <p className="text-sm text-slate-600">{rev.review || 'No written review'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Book Appointment</h2>
              <div className="text-3xl font-bold text-teal-700 mb-1">${doctor.consultation_fee || 0}</div>
              <p className="text-sm text-slate-500 mb-6">per consultation</p>
              <button
                onClick={() => setBookingOpen(!bookingOpen)}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors mb-3"
              >
                {bookingOpen ? 'Close Booking' : 'Book Appointment'}
              </button>
              <button className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                <MessageCircle className="w-4 h-4" /> Chat with Doctor
              </button>

              {bookingOpen && (
                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                      />
                    </div>
                  </div>
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Time</label>
                      {slots.length === 0 ? (
                        <p className="text-sm text-slate-500 py-2">No slots available for this date</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                selectedTime === time
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Problem Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                      placeholder="Describe your symptoms or reason for visit..."
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={bookingLoading || !selectedDate || !selectedTime}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Confirm Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
