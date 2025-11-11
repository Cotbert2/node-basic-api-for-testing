import Car from '../models/car.model.js';

export const getCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('rental_location_id');
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('rental_location_id');
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    const saved = await car.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCar = async (req, res) => {
  try {
    const updated = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
