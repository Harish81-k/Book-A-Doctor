import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api.js'
import {
  Search, Calendar, Stethoscope, Heart, Shield, Clock, Star, ChevronRight,
  ArrowRight, Users, Activity, Brain, Bone, Baby, Eye, Ear, HeartPulse
} from 'lucide-react'

const iconMap = {
  Cardiology: HeartPulse,
  Neurology: Brain,
  Orthopedics: Bone,
  Pediatrics: Baby,
  Ophthalmology: Eye,
  ENT: Ear,
  Dermatology: Heart,
  General: Stethoscope,
  Psychiatry: Brain,
  Gynecology: Heart,
  default: Activity,
}

const faqs = [
  { q: 'How do I book an appointment?', a: 'Simply search for a doctor, select your preferred time slot, and confirm your booking. You will receive a confirmation notification.' },
  { q: 'Can I cancel or reschedule?', a: 'Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time from your dashboard.' },
  { q: 'Are doctors verified?', a: 'All doctors on MediBook undergo a thorough verification process including credentials, license, and experience checks.' },
  { q: 'How do I get my prescription?', a: 'After your consultation, the doctor can upload your prescription to the app, which you can download anytime.' },
  { q: 'Is my medical data secure?', a: 'Yes, we use industry-standard encryption and comply with healthcare data protection regulations.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: docs } = await api.get('/doctors');
        setDoctors(docs || []);
        
        const { data: specs } = await api.get('/specializations');
        setSpecializations(specs || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" /> Trusted by 50,000+ patients
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Find the Best Doctors & Book Appointments
            </h1>
            <p className="text-lg text-slate-600 max-w-lg">
              Connect with top-rated doctors, book appointments instantly, and manage your health records — all in one place.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery) navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`); else navigate('/doctors'); }} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctors, specialties, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-transparent focus:border-teal-500 focus:ring-0 outline-none text-slate-700 font-medium shadow-lg"
                />
              </div>
              <button type="submit" className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 whitespace-nowrap">
                Search
              </button>
            </form>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-teal-200 border-2 border-white flex items-center justify-center text-xs font-medium text-teal-800">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-slate-600">2,000+ doctors</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                <span className="text-sm text-slate-600 ml-1">4.9 rating</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/images/hero-doctor.png"
                alt="Professional doctor ready to help"
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl object-cover"
                style={{ aspectRatio: '3/4' }}
              />
              {/* Floating Stats Cards */}
              <div className="absolute -left-6 top-12 bg-white rounded-xl shadow-lg p-4 border border-slate-100 animate-float hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">2,000+</div>
                    <div className="text-xs text-slate-500">Expert Doctors</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 top-1/3 bg-white rounded-xl shadow-lg p-4 border border-slate-100 animate-float-delayed hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">100%</div>
                    <div className="text-xs text-slate-500">Verified</div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 bottom-16 bg-white rounded-xl shadow-lg p-4 border border-slate-100 animate-float hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">4.9★</div>
                    <div className="text-xs text-slate-500">Patient Rating</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl -z-0" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl -z-0" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Choose MediBook</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We make healthcare simple, transparent, and accessible for everyone.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Find Doctors', desc: 'Search by specialty, location, and availability.', color: 'bg-teal-50 text-teal-600' },
              { icon: Calendar, title: 'Easy Booking', desc: 'Book appointments in under 2 minutes.', color: 'bg-blue-50 text-blue-600' },
              { icon: Shield, title: 'Verified', desc: 'All doctors are thoroughly verified.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Heart, title: 'Health Records', desc: 'Manage and share your reports securely.', color: 'bg-rose-50 text-rose-600' },
            ].map(f => (
              <div key={f.title} className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Banner */}
      <section className="relative overflow-hidden">
        <div className="relative h-72 md:h-96">
          <img
            src="/images/hospital-interior.png"
            alt="Modern hospital facilities"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-lg">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  World-Class Medical Facilities
                </h2>
                <p className="text-slate-200 text-lg mb-6">
                  State-of-the-art hospitals and clinics equipped with the latest technology for your care.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-xs text-slate-300">Hospitals</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-2xl font-bold text-white">50k+</div>
                    <div className="text-xs text-slate-300">Patients Served</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-xs text-slate-300">Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Popular Departments</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Browse doctors by medical specialty</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {specializations.map((spec) => {
              const IconComp = iconMap[spec.name] || iconMap.default
              return (
                <Link key={spec._id} to={`/doctors?specialization=${spec._id}`} className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-all text-center group">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-100 transition-colors">
                    <IconComp className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">{spec.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{spec.description?.slice(0, 40) || 'Specialized care'}</p>
                </Link>
              )
            })}
            {!specializations.length && [1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto mb-3 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Doctors</h2>
              <p className="text-slate-600">Highly rated doctors available for booking</p>
            </div>
            <Link to="/doctors" className="hidden sm:flex items-center gap-1 text-teal-600 font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? [1,2,3].map(i => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 p-6">
                <div className="h-32 bg-slate-200 rounded-xl animate-pulse mb-4" />
                <div className="h-5 bg-slate-200 rounded w-2/3 animate-pulse mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
              </div>
            )) : doctors.slice(0, 3).map((doc) => (
              <div key={doc._id} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
                <div className="h-32 bg-gradient-to-r from-teal-50 to-blue-50 flex items-center justify-center">
                  {doc.user?.avatar_url ? (
                    <img src={doc.user.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                      <Users className="w-8 h-8 text-teal-600" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Dr. {doc.user?.first_name} {doc.user?.last_name}</h3>
                  <p className="text-sm text-teal-600 mb-1">{doc.specialization?.name || 'General Practitioner'}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {doc.rating || 0}
                    </span>
                    <span>|</span>
                    <span>{doc.experience_years} yrs exp</span>
                    <span>|</span>
                    <span>${doc.consultation_fee || 0}</span>
                  </div>
                  <Link
                    to={`/doctors/${doc._id}`}
                    className="block text-center bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/doctors" className="inline-flex items-center gap-1 text-teal-600 font-medium hover:underline">
              View All Doctors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-600">Everything you need to know about MediBook</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900">{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-10 md:p-16 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
              <p className="text-teal-100 text-lg mb-8">
                Join thousands of patients who trust MediBook for their healthcare needs. Our expert medical team is here for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 px-8 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-colors">
                  Get Started Free
                </Link>
                <Link to="/doctors" className="inline-flex items-center justify-center gap-2 bg-teal-700 text-white border border-teal-500 px-8 py-3 rounded-xl font-semibold hover:bg-teal-800 transition-colors">
                  Browse Doctors
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/images/doctor-team.png"
                alt="Our expert medical team"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
