import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  studentName: { type: String, required: true },
  class: String, stream: String,
  year: String, percentage: Number, rank: String,
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Result', schema);
