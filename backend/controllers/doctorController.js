import DoctorProfile from '../models/DoctorProfile.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';
import Specialization from '../models/Specialization.js';

export const getDoctors = async (req, res) => {
  try {
    const { search, specialization, minExperience, maxFee, minRating, sort } = req.query;
    
    let query = { is_verified: true };
    
    if (specialization) {
      query.specialization = specialization;
    }
    if (minExperience) {
      query.experience_years = { $gte: parseInt(minExperience) };
    }
    if (maxFee) {
      query.consultation_fee = { $lte: parseInt(maxFee) };
    }
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      const matchingUsers = await User.find({
        role: 'doctor',
        $or: [
          { first_name: searchRegex },
          { last_name: searchRegex },
          { city: searchRegex }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      
      const matchingSpecs = await Specialization.find({ name: searchRegex }).select('_id');
      const specIds = matchingSpecs.map(s => s._id);

      query.$or = [
        { user: { $in: userIds } },
        { hospital_name: searchRegex },
        { city: searchRegex },
        { specialization: { $in: specIds } }
      ];
    }
    
    let sortOptions = {};
    if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'fee') sortOptions.consultation_fee = 1;
    else if (sort === 'experience') sortOptions.experience_years = -1;
    else sortOptions.createdAt = -1;

    const doctors = await DoctorProfile.find(query)
      .populate('user', 'first_name last_name avatar_url city')
      .populate('specialization')
      .sort(sortOptions);
      
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.user._id })
      .populate('user', 'first_name last_name avatar_url city')
      .populate('specialization');

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate('user', 'first_name last_name avatar_url city')
      .populate('specialization');

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });

    if (doctorProfile) {
      doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
      doctorProfile.qualification = req.body.qualification || doctorProfile.qualification;
      doctorProfile.experience_years = req.body.experience_years || doctorProfile.experience_years;
      doctorProfile.consultation_fee = req.body.consultation_fee || doctorProfile.consultation_fee;
      doctorProfile.languages = req.body.languages || doctorProfile.languages;
      doctorProfile.hospital_name = req.body.hospital_name || doctorProfile.hospital_name;
      doctorProfile.bio = req.body.bio || doctorProfile.bio;
      doctorProfile.is_available = req.body.is_available !== undefined ? req.body.is_available : doctorProfile.is_available;
      doctorProfile.registration_number = req.body.registration_number || doctorProfile.registration_number;

      // Location fields
      if (req.body.address !== undefined) doctorProfile.address = req.body.address;
      if (req.body.city !== undefined) doctorProfile.city = req.body.city;
      if (req.body.state !== undefined) doctorProfile.state = req.body.state;
      if (req.body.country !== undefined) doctorProfile.country = req.body.country;
      if (req.body.zip_code !== undefined) doctorProfile.zip_code = req.body.zip_code;
      if (req.body.latitude !== undefined) doctorProfile.latitude = req.body.latitude;
      if (req.body.longitude !== undefined) doctorProfile.longitude = req.body.longitude;

      const updatedProfile = await doctorProfile.save();

      // Update User if avatar_url is provided
      if (req.body.avatar_url !== undefined) {
        await User.findByIdAndUpdate(req.user._id, { avatar_url: req.body.avatar_url });
      }

      res.json(updatedProfile);
    } else {
      res.status(404).json({ message: 'Doctor profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTimeSlot = async (req, res) => {
  try {
    const { slot_date, start_time, end_time } = req.body;
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });

    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const slot = await TimeSlot.create({
      doctor: doctorProfile._id,
      slot_date,
      start_time,
      end_time,
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorTimeSlots = async (req, res) => {
  try {
    const slots = await TimeSlot.find({ doctor: req.params.id, is_available: true });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTimeSlot = async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const slot = await TimeSlot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    if (slot.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this time slot' });
    }

    await slot.deleteOne();
    res.json({ message: 'Time slot removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
