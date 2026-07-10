import User from '../models/User.js';

export const updatePatientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.first_name = req.body.first_name || user.first_name;
      user.last_name = req.body.last_name || user.last_name;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.city = req.body.city || user.city;
      user.gender = req.body.gender || user.gender;
      user.date_of_birth = req.body.date_of_birth || user.date_of_birth;

      if (req.body.avatar_url !== undefined) {
        user.avatar_url = req.body.avatar_url;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
