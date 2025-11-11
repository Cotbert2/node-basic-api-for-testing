import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zip_code: { type: String }
});

export default mongoose.model('Location', locationSchema);