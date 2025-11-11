import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  rental_date: { type: Date, required: true },
  return_date: { type: Date },
  total_cost: { type: Number }
});

export default mongoose.model('Rental', rentalSchema);