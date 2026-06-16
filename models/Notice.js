import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String, 
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Notice', schema);
