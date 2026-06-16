import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: String, category: String,
  image: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});
export default mongoose.model('Gallery', schema);
