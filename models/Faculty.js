import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: String, qualification: String, experience: String,
  photo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Faculty', schema);
