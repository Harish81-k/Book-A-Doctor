import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api.js'
import {
  Search, Star, MapPin, X, Filter,
  Stethoscope, Briefcase, DollarSign, CheckCircle,
  Building2, GraduationCap, Languages, Award
} from 'lucide-react'

export default function DoctorsPage() {
  const [searchParams] = useSearchParams()
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [specFilter, setSpecFilter] = useState(searchParams.get('specialization') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [minExp, setMinExp] = useState('')
  const [maxFee, setMaxFee] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: docs } = await api.get('/doctors');
        const specs = [...new Map(docs.map(item => [item.specialization?._id, item.specialization])).values()];
        setSpecializations(specs.filter(Boolean));
        await loadDoctors();
      } catch (error) {
        console.error('Error fetching specs:', error);
      }
    }
    fetchData()
  }, [])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/doctors', {
        params: {
          search: search || undefined,
          specialization: specFilter || undefined,
          minExperience: minExp || undefined,
          maxFee: maxFee || undefined,
          minRating: minRating || undefined,
          sort: sortBy || undefined
        }
      });
      setDoctors(data || [])
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [specFilter, minExp, maxFee, minRating, sortBy])

  const handleSearch = (e) => {
    e.preventDefault()
    loadDoctors()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <section className="relative bg-gradient-to-br from-teal-600 to-blue-700 py-16 px-4 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Find Your Specialist</h1>
            <p className="text-teal-50 text-lg">Browse our network of verified, world-class medical professionals across top hospitals and clinics.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by doctor name, specialty, hospital, or city..."
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-teal-500 focus:ring-0 outline-none text-slate-700 font-medium transition-colors"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button type="submit" className="bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50">
                  Search
                </button>
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all border-2 ${showFilters ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter className="w-5 h-5" /> Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Specialty</label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                    value={specFilter}
                    onChange={(e) => setSpecFilter(e.target.value)}
                  >
                    <option value="">All Specialties</option>
                    {specializations.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Experience</label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1">1+ years</option>
                    <option value="5">5+ years</option>
                    <option value="10">10+ years</option>
                    <option value="15">15+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Max Fee</label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="50">Under $50</option>
                    <option value="100">Under $100</option>
                    <option value="200">Under $200</option>
                    <option value="500">Under $500</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Rating</label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="3">3+ stars</option>
                    <option value="4">4+ stars</option>
                    <option value="4.5">4.5+ stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Sort</label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="rating">Top Rated</option>
                    <option value="fee">Lowest Fee</option>
                    <option value="experience">Most Experienced</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              {loading ? 'Searching...' : `${doctors.length} Specialist${doctors.length !== 1 ? 's' : ''} Available`}
            </h2>
            {(specFilter || minExp || maxFee || minRating) && (
              <button
                onClick={() => { setSpecFilter(''); setMinExp(''); setMaxFee(''); setMinRating(''); setSortBy('rating'); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" /> Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? [1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-slate-200 h-20 w-20"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            )) : doctors.map((doc) => (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                {/* Card Banner */}
                <div className="h-24 bg-gradient-to-r from-teal-50 to-blue-50 relative">
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/40 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{doc.rating || 'New'}</span>
                    <span className="text-xs text-slate-500">({doc.total_reviews || 0})</span>
                  </div>
                </div>
                
                <div className="px-6 relative flex-1 flex flex-col">
                  {/* Avatar */}
                  <div className="flex justify-between items-end -mt-12 mb-4">
                    <div className="relative">
                      {doc.user?.avatar_url ? (
                        <img src={doc.user.avatar_url} alt="" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white" />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-md">
                          <Stethoscope className="w-10 h-10 text-teal-600" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-emerald-100 text-emerald-600 p-1 rounded-full border-2 border-white" title="Verified Professional">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-teal-600">${doc.consultation_fee || 0}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Consultation</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      Dr. {doc.user?.first_name} {doc.user?.last_name}
                    </h3>
                    <p className="text-sm font-medium text-teal-600 flex items-center gap-1.5 mt-1">
                      <Award className="w-4 h-4" /> {doc.specialization?.name || 'General Practitioner'}
                    </p>
                  </div>

                  {/* Badges/Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {doc.qualification && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        <GraduationCap className="w-3.5 h-3.5" /> {doc.qualification}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                      <Briefcase className="w-3.5 h-3.5" /> {doc.experience_years} Years Exp
                    </span>
                    {doc.languages && doc.languages.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium" title={doc.languages.join(', ')}>
                        <Languages className="w-3.5 h-3.5" /> {doc.languages.length} Language{doc.languages.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Location/Hospital */}
                  <div className="space-y-2 mt-auto mb-6 pt-4 border-t border-slate-100">
                    <div className="flex items-start gap-2.5 text-sm">
                      <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-slate-800">{doc.hospital_name || 'Independent Practice'}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {[doc.address, doc.city || doc.user?.city, doc.state].filter(Boolean).join(', ') || 'Location pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-slate-50 mt-auto border-t border-slate-100">
                  <Link
                    to={`/doctors/${doc._id}`}
                    className="flex items-center justify-center w-full bg-white border border-teal-600 text-teal-700 py-2.5 rounded-xl font-semibold hover:bg-teal-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                  >
                    View Profile & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {!loading && doctors.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Specialists Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any doctors matching your exact criteria. Try broadening your search or clearing some filters.</p>
              <button
                onClick={() => { setSearch(''); setSpecFilter(''); setMinExp(''); setMaxFee(''); setMinRating(''); }}
                className="mt-6 text-teal-600 font-semibold hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
