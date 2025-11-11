import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone_number: { type: String },
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }
});

export default mongoose.model('Employee', employeeSchema);