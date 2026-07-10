const mongoose = require('mongoose');

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/book-a-doctor');
    const db = mongoose.connection;
    await db.collection('doctorprofiles').updateOne({}, { $set: { is_verified: true, consultation_fee: 100, experience_years: 5 } });
    const doctor = await db.collection('doctorprofiles').findOne({});
    if (doctor) {
      await db.collection('timeslots').insertMany([
        { doctor: doctor._id, day_of_week: new Date().getDay(), start_time: '10:00', end_time: '11:00', is_available: true, createdAt: new Date(), updatedAt: new Date() },
        { doctor: doctor._id, day_of_week: new Date().getDay(), start_time: '11:00', end_time: '12:00', is_available: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
      console.log('Doctor updated and slots created');
    } else {
      console.log('No doctor found');
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
seed();
