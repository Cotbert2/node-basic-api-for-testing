import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true,
    min: [1886, 'Year must be at least 1886 (first car invented)'],
    max: [new Date().getFullYear() + 1, 'Year cannot be more than 1 year in the future']
  },
  license_plate: { type: String, required: true, unique: true },
  rental_location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }
});

export default mongoose.model('Car', carSchema);