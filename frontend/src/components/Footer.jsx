import { Link } from 'react-router-dom'
import { Stethoscope, Mail, Phone, MapPin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MediBook</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted healthcare partner. Book appointments with top doctors, manage your health records, and get the care you deserve.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-teal-400 transition-colors">Home</Link></li>
              <li><Link to="/doctors" className="text-sm hover:text-teal-400 transition-colors">Find Doctors</Link></li>
              <li><Link to="/about" className="text-sm hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-teal-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For Doctors</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-sm hover:text-teal-400 transition-colors">Join as Doctor</Link></li>
              <li><Link to="/doctor-dashboard" className="text-sm hover:text-teal-400 transition-colors">Doctor Dashboard</Link></li>
              <li><span className="text-sm hover:text-teal-400 transition-colors cursor-pointer">Help Center</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-teal-400" /> support@medibook.com
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-teal-400" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-teal-400" /> 123 Health St, Medical City
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 MediBook. All rights reserved.</p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  )
}
