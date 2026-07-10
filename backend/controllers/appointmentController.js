import Appointment from '../models/Appointment.js';
import DoctorProfile from '../models/DoctorProfile.js';

export const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, slot_date, slot_time, problem_description, notes } = req.body;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor_id,
      slot_date,
      slot_time,
      problem_description,
      notes,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only doctor or admin can change status to approved/rejected/completed
    if (req.user.role !== 'doctor' && req.user.role !== 'admin' && req.body.status !== 'cancelled') {
       return res.status(401).json({ message: 'Not authorized to change status' });
    }

    appointment.status = req.body.status || appointment.status;
    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'first_name last_name avatar_url' },
          { path: 'specialization', select: 'name' }
        ]
      })
      .sort({ slot_date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate('patient', 'first_name last_name avatar_url')
      .sort({ slot_date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      slot_date: date,
      status: { $in: ['pending', 'approved'] }
    }).select('slot_time');

    const bookedTimes = bookedAppointments.map(app => app.slot_time);
    res.json(bookedTimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'first_name last_name avatar_url role')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'first_name last_name avatar_url role' }
      });

    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
