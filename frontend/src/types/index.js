export interface Profile {
  id: string;
  role: 'patient' | 'doctor' | 'admin';
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email?: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  gender: string | null;
  date_of_birth: string | null;
  is_active: boolean;
  created_at: string;
  full_name?: string;
}

export interface DoctorProfile {
  id: string;
  specialization_id: string | null;
  specialization_name?: string;
  qualification: string | null;
  experience_years: number | null;
  consultation_fee: number | null;
  languages: string[] | null;
  hospital_name: string | null;
  bio: string | null;
  rating: number | null;
  total_reviews: number | null;
  is_verified: boolean;
  is_available: boolean;
  documents_url: string | null;
  registration_number: string | null;
  created_at: string;
  profile?: Profile;
  profiles?: Profile;
  specializations?: { name: string };
}

export interface Specialization {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_date: string;
  slot_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  problem_description: string | null;
  prescription_url: string | null;
  notes: string | null;
  created_at: string;
  doctor?: DoctorProfile;
  patient?: Profile;
  payments?: Payment[];
}

export interface Review {
  id: string;
  appointment_id: string | null;
  patient_id: string;
  doctor_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  patient?: Profile;
  doctor?: DoctorProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'doctor_approved' | 'payment' | 'review' | 'system' | 'message';
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  appointment_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Payment {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  doctor?: DoctorProfile;
}

export interface MedicalReport {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  title: string;
  file_url: string;
  file_type: 'pdf' | 'jpg' | 'png' | 'jpeg' | null;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}
