import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
  },
  slot_date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  start_time: {
    type: String, // HH:MM format
    required: true,
  },
  end_time: {
    type: String, // HH:MM format
    required: true,
  },
  is_available: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
export default TimeSlot;
