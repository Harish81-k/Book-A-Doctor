import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Message sent! We will get back to you soon.')
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <section className="relative bg-gradient-to-br from-teal-600 to-blue-700 py-16 px-4 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-xl border border-white/20">
            <MessageSquare className="w-8 h-8 text-teal-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-md">Get in Touch</h1>
          <p className="text-lg text-teal-50 max-w-2xl mx-auto leading-relaxed">
            Whether you have a medical inquiry, need assistance with your booking, or want to partner with us, our dedicated support team is here for you.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex items-start gap-5">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-600 transition-colors">
                <Mail className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Email Us</h3>
                <a href="mailto:support@medibook.com" className="block text-slate-600 hover:text-teal-600 transition-colors">support@medibook.com</a>
                <a href="mailto:doctors@medibook.com" className="block text-slate-600 hover:text-teal-600 transition-colors">doctors@medibook.com</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex items-start gap-5">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-600 transition-colors">
                <Phone className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Call Us</h3>
                <a href="tel:+15551234567" className="block text-slate-600 hover:text-teal-600 transition-colors">+1 (555) 123-4567</a>
                <a href="tel:+15559876543" className="block text-slate-600 hover:text-teal-600 transition-colors">+1 (555) 987-6543</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex items-start gap-5">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-600 transition-colors">
                <MapPin className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Headquarters</h3>
                <p className="text-slate-600 leading-relaxed">123 Health Street<br />Medical City, MC 12345</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex items-start gap-5">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-600 transition-colors">
                <Clock className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Support Hours</h3>
                <p className="text-slate-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                <p className="text-slate-600">Sat - Sun: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Send a Message</h2>
                <p className="text-slate-500">Fill out the form below and we will get back to you as soon as possible.</p>
              </div>

              {sent ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-teal-50/50 rounded-2xl border border-teal-100 h-[400px]">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 max-w-sm">Thank you for reaching out. One of our support representatives will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-transparent outline-none transition-all"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-transparent outline-none transition-all"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-transparent outline-none transition-all"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your message here..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-transparent outline-none resize-none transition-all"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50"
                  >
                    <Send className="w-5 h-5" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
