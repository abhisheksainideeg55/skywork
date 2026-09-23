import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://astroabhishek931_db_user:dSQNaD9XMfFXtSvC@blinkitcluster.pr3k48c.mongodb.net/skywork?retryWrites=true&w=majority';

async function removeRahul() {
  await mongoose.connect(uri);
  const Attendance = mongoose.model('Attendance', new mongoose.Schema({}, { strict: false }));
  const res = await Attendance.deleteMany({
    $or: [
      { employeeName: { $regex: /rahul/i } },
      { name: { $regex: /rahul/i } },
    ],
  });
  console.log(`Deleted ${res.deletedCount} attendance record(s) for Rahul Sharma from database.`);
  await mongoose.disconnect();
  process.exit(0);
}

removeRahul().catch(console.error);
