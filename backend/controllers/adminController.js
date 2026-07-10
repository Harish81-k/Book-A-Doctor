import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      total_patients: totalPatients,
      total_doctors: totalDoctors,
      total_appointments: totalAppointments,
      total_revenue: totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find({})
      .populate('user')
      .populate('specialization')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patient', 'first_name last_name email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'first_name last_name' }
      })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('patient', 'first_name last_name avatar_url')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'first_name last_name' }
      })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDoctor = async (req, res) => {
  try {
    const { is_verified } = req.body;
    const doctor = await DoctorProfile.findById(req.params.id);
    
    if (doctor) {
      doctor.is_verified = is_verified;
      await doctor.save();
      
      // Notify the doctor
      await Notification.create({
        user: doctor.user,
        title: 'Profile Verification',
        message: `Your profile has been ${is_verified ? 'verified' : 'unverified'} by an admin.`,
        type: 'system'
      });
      
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserActive = async (req, res) => {
  try {
    const { is_active } = req.body;
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.is_active = is_active;
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Also delete doctor profile if exists
      if (user.role === 'doctor') {
        await DoctorProfile.deleteOne({ user: user._id });
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id);
    if (doctor) {
      // We don't delete the user, just the profile. Wait, usually a doctor IS a user.
      // But based on the schema, deleting doctor profile is enough. 
      // User can remain as a normal user, or we change role to patient?
      // Let's just delete the profile as the dashboard did.
      await doctor.deleteOne();
      res.json({ message: 'Doctor profile removed' });
    } else {
      res.status(404).json({ message: 'Doctor profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
