// config/database.js
import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--------MongoDB connected-----------');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
