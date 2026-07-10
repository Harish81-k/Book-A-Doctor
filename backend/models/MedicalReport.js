import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
  },
  title: {
    type: String,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  file_type: {
    type: String,
    enum: ['pdf', 'jpg', 'png', 'jpeg'],
  },
}, { timestamps: true });

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;
