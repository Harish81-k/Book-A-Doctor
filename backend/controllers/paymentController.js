import Payment from '../models/Payment.js';
import DoctorProfile from '../models/DoctorProfile.js';

export const createPayment = async (req, res) => {
  try {
    const { appointment_id, doctor_id, amount } = req.body;

    const payment = await Payment.create({
      patient: req.user._id,
      appointment: appointment_id,
      doctor: doctor_id,
      amount,
      status: 'pending'
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      const docProfile = await DoctorProfile.findOne({ user: req.user._id });
      if (!docProfile) return res.status(404).json({ message: 'Doctor profile not found' });
      query = { doctor: docProfile._id };
    } else {
      query = { patient: req.user._id };
    }
      
    const payments = await Payment.find(query)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'first_name last_name' }
      })
      .populate('patient', 'first_name last_name')
      .sort({ createdAt: -1 });
      
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (payment) {
      payment.status = status;
      await payment.save();
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
