import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
  },
  qualification: String,
  experience_years: { type: Number, default: 0 },
  consultation_fee: { type: Number, default: 0 },
  languages: [String],
  hospital_name: String,
  bio: String,
  rating: { type: Number, default: 0.0 },
  total_reviews: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  is_available: { type: Boolean, default: true },
  documents_url: String,
  registration_number: String,
  address: String,
  city: String,
  state: String,
  country: String,
  zip_code: String,
  latitude: Number,
  longitude: Number,
}, { timestamps: true });

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
export default DoctorProfile;
