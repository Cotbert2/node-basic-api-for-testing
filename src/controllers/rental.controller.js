import Rental from '../models/rental.model.js';

export const getRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('customer_id')
      .populate('car_id');
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('customer_id')
      .populate('car_id');
    if (!rental) return res.status(404).json({ message: 'Rent not found' });
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRental = async (req, res) => {
  try {
    const { car_id, rental_date, return_date } = req.body;
    
    // Check for date conflicts with existing rentals for the same car
    const conflictingRental = await Rental.findOne({
      car_id,
      $or: [
        // New rental starts during existing rental
        {
          rental_date: { $lte: new Date(rental_date) },
          return_date: { $gte: new Date(rental_date) }
        },
        // New rental ends during existing rental
        {
          rental_date: { $lte: new Date(return_date) },
          return_date: { $gte: new Date(return_date) }
        },
        // New rental encompasses existing rental
        {
          rental_date: { $gte: new Date(rental_date) },
          return_date: { $lte: new Date(return_date) }
        },
        // Existing rental without return_date (ongoing rental)
        {
          rental_date: { $lte: new Date(rental_date) },
          return_date: null
        }
      ]
    });

    if (conflictingRental) {
      return res.status(409).json({ 
        message: 'Car is not available for the selected dates. Date conflict with existing rental.' 
      });
    }

    const rental = new Rental(req.body);
    const saved = await rental.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateRental = async (req, res) => {
  try {
    const { car_id, rental_date, return_date } = req.body;
    const rentalId = req.params.id;
    
    // If car_id, rental_date, or return_date are being updated, check for conflicts
    if (car_id || rental_date || return_date) {
      const currentRental = await Rental.findById(rentalId);
      const checkCarId = car_id || currentRental.car_id;
      const checkRentalDate = rental_date || currentRental.rental_date;
      const checkReturnDate = return_date || currentRental.return_date;
      
      const conflictingRental = await Rental.findOne({
        _id: { $ne: rentalId }, // Exclude current rental from check
        car_id: checkCarId,
        $or: [
          // Updated rental starts during existing rental
          {
            rental_date: { $lte: new Date(checkRentalDate) },
            return_date: { $gte: new Date(checkRentalDate) }
          },
          // Updated rental ends during existing rental
          {
            rental_date: { $lte: new Date(checkReturnDate) },
            return_date: { $gte: new Date(checkReturnDate) }
          },
          // Updated rental encompasses existing rental
          {
            rental_date: { $gte: new Date(checkRentalDate) },
            return_date: { $lte: new Date(checkReturnDate) }
          },
          // Existing rental without return_date (ongoing rental)
          {
            rental_date: { $lte: new Date(checkRentalDate) },
            return_date: null
          }
        ]
      });

      if (conflictingRental) {
        return res.status(409).json({ 
          message: 'Car is not available for the updated dates. Date conflict with existing rental.' 
        });
      }
    }

    const updated = await Rental.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRental = async (req, res) => {
  try {
    await Rental.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rent deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
