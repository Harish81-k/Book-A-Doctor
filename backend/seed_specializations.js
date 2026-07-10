import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const specializations = [
  { name: 'Cardiology', description: 'Heart and cardiovascular system', icon: '❤️' },
  { name: 'Dermatology', description: 'Skin, hair, and nails', icon: '🧴' },
  { name: 'Neurology', description: 'Brain and nervous system', icon: '🧠' },
  { name: 'Orthopedics', description: 'Bones, joints, and muscles', icon: '🦴' },
  { name: 'Pediatrics', description: 'Children and adolescents', icon: '👶' },
  { name: 'Gynecology', description: 'Female reproductive system', icon: '🩺' },
  { name: 'Ophthalmology', description: 'Eyes and vision', icon: '👁️' },
  { name: 'ENT (Otolaryngology)', description: 'Ear, nose, and throat', icon: '👂' },
  { name: 'Psychiatry', description: 'Mental health and behavioral disorders', icon: '🧘' },
  { name: 'General Medicine', description: 'Primary care and internal medicine', icon: '💊' },
  { name: 'Dentistry', description: 'Teeth and oral health', icon: '🦷' },
  { name: 'Pulmonology', description: 'Lungs and respiratory system', icon: '🫁' },
  { name: 'Gastroenterology', description: 'Digestive system', icon: '🫃' },
  { name: 'Urology', description: 'Urinary tract and male reproductive system', icon: '🏥' },
  { name: 'Endocrinology', description: 'Hormones and glands', icon: '⚗️' },
  { name: 'Oncology', description: 'Cancer treatment', icon: '🎗️' },
  { name: 'Nephrology', description: 'Kidneys', icon: '🫘' },
  { name: 'Rheumatology', description: 'Autoimmune and joint diseases', icon: '🦵' },
  { name: 'Radiology', description: 'Medical imaging and diagnostics', icon: '📡' },
  { name: 'Anesthesiology', description: 'Pain management and anesthesia', icon: '💉' },
];

async function seedSpecializations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-a-doctor');
    const db = mongoose.connection;
    const collection = db.collection('specializations');

    let added = 0;
    let skipped = 0;

    for (const spec of specializations) {
      const exists = await collection.findOne({ name: spec.name });
      if (!exists) {
        await collection.insertOne({
          ...spec,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        added++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ Specializations seeded: ${added} added, ${skipped} already existed.`);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    process.exit(0);
  }
}

seedSpecializations();
