import { storage, generateUUID, isValidUUID, findById, findIndexById } from '../storage/data.js';
import { validateRental } from '../utils/validation.js';

export const getRentals = async (req, res) => {
  // Populate customer and car data for each rental
  const rentalsWithData = storage.rentals.map(rental => {
    const customer = findById('customers', rental.customer_id);
    const car = findById('cars', rental.car_id);
    
    return {
      ...rental,
      customer_id: customer || rental.customer_id,
      car_id: car || rental.car_id
    };
  });
  
  res.json(rentalsWithData);
};

export const getRentalById = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const rental = findById('rentals', req.params.id);
  if (!rental) return res.status(404).json({ message: 'Rental not found' });
  
  // Populate customer and car data
  const customer = findById('customers', rental.customer_id);
  const car = findById('cars', rental.car_id);
  
  const populatedRental = {
    ...rental,
    customer_id: customer || rental.customer_id,
    car_id: car || rental.car_id
  };
  
  res.json(populatedRental);
};

export const createRental = async (req, res) => {
  const validationErrors = validateRental(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: validationErrors.join(', ') });
  }
  
  const { car_id, rental_date, return_date } = req.body;
  
  // Check for date conflicts with existing rentals for the same car
  const conflictingRental = storage.rentals.find(rental => {
    if (rental.car_id !== car_id) return false;
    
    const rentalStart = new Date(rental_date);
    const rentalEnd = return_date ? new Date(return_date) : null;
    const existingStart = new Date(rental.rental_date);
    const existingEnd = rental.return_date ? new Date(rental.return_date) : null;
    
    // Check for overlaps
    if (!existingEnd) {
      // Existing rental is ongoing (no return date)
      return existingStart <= rentalStart;
    }
    
    if (!rentalEnd) {
      // New rental is ongoing
      return rentalStart <= existingEnd;
    }
    
    // Both rentals have end dates - check for any overlap
    return (rentalStart <= existingEnd && rentalEnd >= existingStart);
  });

  if (conflictingRental) {
    return res.status(409).json({ 
      message: 'Car is not available for the selected dates. Date conflict with existing rental.' 
    });
  }

  const rental = {
    id: generateUUID(),
    ...req.body,
    rental_date: new Date(req.body.rental_date),
    return_date: req.body.return_date ? new Date(req.body.return_date) : null
  };
  
  storage.rentals.push(rental);
  res.status(201).json(rental);
};

export const updateRental = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const validationErrors = validateRental(req.body, true);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: validationErrors.join(', ') });
  }
  
  const index = findIndexById('rentals', req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Rental not found' });
  }
  
  const { car_id, rental_date, return_date } = req.body;
  const rentalId = req.params.id;
  
  // If car_id, rental_date, or return_date are being updated, check for conflicts
  if (car_id || rental_date || return_date) {
    const currentRental = storage.rentals[index];
    const checkCarId = car_id || currentRental.car_id;
    const checkRentalDate = rental_date || currentRental.rental_date;
    const checkReturnDate = return_date !== undefined ? return_date : currentRental.return_date;
    
    const conflictingRental = storage.rentals.find(rental => {
      if (rental.id === rentalId || rental.car_id !== checkCarId) return false;
      
      const rentalStart = new Date(checkRentalDate);
      const rentalEnd = checkReturnDate ? new Date(checkReturnDate) : null;
      const existingStart = new Date(rental.rental_date);
      const existingEnd = rental.return_date ? new Date(rental.return_date) : null;
      
      // Check for overlaps
      if (!existingEnd) {
        // Existing rental is ongoing (no return date)
        return existingStart <= rentalStart;
      }
      
      if (!rentalEnd) {
        // Updated rental is ongoing
        return rentalStart <= existingEnd;
      }
      
      // Both rentals have end dates - check for any overlap
      return (rentalStart <= existingEnd && rentalEnd >= existingStart);
    });

    if (conflictingRental) {
      return res.status(409).json({ 
        message: 'Car is not available for the updated dates. Date conflict with existing rental.' 
      });
    }
  }

  // Update the rental with proper date conversion
  const updatedData = { ...req.body };
  if (updatedData.rental_date) {
    updatedData.rental_date = new Date(updatedData.rental_date);
  }
  if (updatedData.return_date !== undefined) {
    updatedData.return_date = updatedData.return_date ? new Date(updatedData.return_date) : null;
  }
  
  storage.rentals[index] = { ...storage.rentals[index], ...updatedData };
  res.json(storage.rentals[index]);
};

export const deleteRental = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const index = findIndexById('rentals', req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Rental not found' });
  }
  
  storage.rentals.splice(index, 1);
  res.json({ message: 'Rental deleted successfully' });
};
