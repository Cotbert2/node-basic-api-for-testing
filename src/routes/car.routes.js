import { Router } from 'express';
import { getCars, getCarById, createCar, updateCar, deleteCar } from '../controllers/car.controller.js';

const router = Router();

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/', createCar);
router.put('/:id', updateCar);
router.delete('/:id', deleteCar);

export default router;