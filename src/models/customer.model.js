import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String },
  driver_license_number: { type: String }
});

export default mongoose.model('Customer', customerSchema);
