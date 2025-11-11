import { Router } from 'express';
import { getRentals, getRentalById, createRental, updateRental, deleteRental } from '../controllers/rental.controller.js';

const router = Router();

router.get('/', getRentals);
router.get('/:id', getRentalById);
router.post('/', createRental);
router.put('/:id', updateRental);
router.delete('/:id', deleteRental);

export default router;