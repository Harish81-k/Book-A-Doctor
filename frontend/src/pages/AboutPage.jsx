import { Heart, Shield, Clock, Users, Award, Globe, Stethoscope, CheckCircle } from 'lucide-react'

const stats = [
  { icon: Users, label: 'Happy Patients', value: '50,000+' },
  { icon: Stethoscope, label: 'Expert Doctors', value: '2,000+' },
  { icon: Clock, label: 'Appointments', value: '100,000+' },
  { icon: Globe, label: 'Cities Covered', value: '150+' },
]

const values = [
  { icon: Heart, title: 'Patient First', desc: 'Every decision is made with the patient\'s best interest at heart. Your health is our priority.' },
  { icon: Shield, title: 'Trust & Safety', desc: 'Verified doctors, secure data handling, and strict clinical protocols for your peace of mind.' },
  { icon: Clock, title: '24/7 Available', desc: 'Round-the-clock access to healthcare professionals, emergency support, and seamless booking.' },
  { icon: Award, title: 'Medical Excellence', desc: 'Committed to delivering the highest quality healthcare services through world-class specialists.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-8 md:p-16 lg:pr-8 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
              <Award className="w-4 h-4" /> Premier Healthcare Network
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Redefining Modern Healthcare
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              MediBook is a state-of-the-art healthcare platform designed to connect patients with top-tier medical specialists. We bring world-class hospital care directly to your fingertips.
            </p>
            <ul className="space-y-3 pt-4">
              {['Access to top 1% medical specialists', 'Seamless online booking experience', 'Secure digital health records'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-96 lg:h-[600px] w-full">
            <img 
              src="/images/hospital-interior.png" 
              alt="Modern hospital facility" 
              className="absolute inset-0 w-full h-full object-cover object-left rounded-bl-[100px] shadow-2xl"
            />
            {/* Overlay gradient for smooth blending on desktop */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent hidden lg:block" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-teal-700 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 shadow-lg text-white">
              <stat.icon className="w-10 h-10 text-teal-200 mx-auto mb-4" />
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-teal-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-teal-100/50 rounded-[3rem] rotate-3 transform -z-10" />
            <img 
              src="/images/hospital-exterior.png" 
              alt="MediBook Partner Hospital Exterior" 
              className="w-full h-[500px] object-cover rounded-3xl shadow-xl"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">15+</div>
                  <div className="text-sm text-slate-500 font-medium">Years of Trust</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-teal-600 font-semibold uppercase tracking-wider text-sm">Our Legacy</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              A commitment to excellence in healthcare delivery.
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              Founded by a consortium of leading medical professionals, MediBook started with a simple yet ambitious mission: to democratize access to premium healthcare.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We recognized the friction patients faced when trying to consult specialists. By building a unified digital infrastructure, we have bridged the gap between world-class hospitals, elite doctors, and patients seeking the best care.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Today, our network spans across hundreds of cities, encompassing state-of-the-art facilities and a rigorous verification process that ensures you are always in safe hands.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-teal-600 font-semibold uppercase tracking-wider text-sm mb-2">Our Pillars</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core Clinical Values</h3>
            <p className="text-slate-600 text-lg">The principles that guide our medical network and ensure you receive the highest standard of care.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-teal-200 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
                  <value.icon className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
