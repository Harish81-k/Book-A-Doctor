import Review from '../models/Review.js';
import DoctorProfile from '../models/DoctorProfile.js';

export const createReview = async (req, res) => {
  try {
    const { doctor_id, appointment_id, rating, review } = req.body;

    const newReview = await Review.create({
      patient: req.user._id,
      doctor: doctor_id,
      appointment: appointment_id,
      rating,
      review
    });

    // Update doctor's average rating
    const reviews = await Review.find({ doctor: doctor_id });
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews;

    await DoctorProfile.findByIdAndUpdate(doctor_id, {
      rating: avgRating,
      total_reviews: totalReviews
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'first_name last_name avatar_url')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDoctorReviews = async (req, res) => {
  try {
    const docProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!docProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    const reviews = await Review.find({ doctor: docProfile._id })
      .populate('patient', 'first_name last_name avatar_url')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
