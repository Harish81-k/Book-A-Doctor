import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-a-doctor');
    const db = mongoose.connection;
    const adminExists = await db.collection('users').findOne({ email: 'admin@medibook.com' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await db.collection('users').insertOne({
        first_name: 'Super',
        last_name: 'Admin',
        email: 'admin@medibook.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user created!');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
seedAdmin();
