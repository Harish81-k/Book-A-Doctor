import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updateAvatars = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const result = await User.updateMany(
      { role: 'doctor' },
      { $set: { avatar_url: '/images/hero-doctor.png' } }
    );
    console.log(`Updated ${result.modifiedCount} doctor avatars.`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

updateAvatars();
