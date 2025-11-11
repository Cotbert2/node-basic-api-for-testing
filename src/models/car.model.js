import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  license_plate: { type: String, required: true, unique: true },
  rental_location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }
});

export default mongoose.model('Car', carSchema);