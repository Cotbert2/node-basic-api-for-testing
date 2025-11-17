import { storage, generateUUID, isValidUUID, findById, findIndexById } from '../storage/data.js';
import { validateCar } from '../utils/validation.js';

export const getCars = async (req, res) => {
  try {
    // Populate rental_location data for each car
    const carsWithLocation = storage.cars.map(car => {
      if (car.rental_location_id) {
        const location = findById('locations', car.rental_location_id);
        return { ...car, rental_location_id: location || car.rental_location_id };
      }
      return car;
    });
    res.json(carsWithLocation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCarById = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
    }
    
    const car = findById('cars', req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    // Populate rental_location data if exists
    if (car.rental_location_id) {
      const location = findById('locations', car.rental_location_id);
      car.rental_location_id = location || car.rental_location_id;
    }
    
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCar = async (req, res) => {
  try {
    const validationErrors = validateCar(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    
    // Check unique license_plate
    const existingCar = storage.cars.find(car => car.license_plate === req.body.license_plate);
    if (existingCar) {
      return res.status(400).json({ message: 'License plate must be unique' });
    }
    
    const car = {
      id: generateUUID(),
      ...req.body
    };
    
    storage.cars.push(car);
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCar = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
    }
    
    const validationErrors = validateCar(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    
    const index = findIndexById('cars', req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check unique license_plate if being updated
    if (req.body.license_plate) {
      const existingCar = storage.cars.find(car => car.license_plate === req.body.license_plate && car.id !== req.params.id);
      if (existingCar) {
        return res.status(400).json({ message: 'License plate must be unique' });
      }
    }
    
    storage.cars[index] = { ...storage.cars[index], ...req.body };
    res.json(storage.cars[index]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
    }
    
    const index = findIndexById('cars', req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    storage.cars.splice(index, 1);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
