import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import carRoutes from './routes/car.routes.js';
import customerRoutes from './routes/customer.routes.js';
import employeeRoutes from './routes/emplotee.routes.js';
import locationRoutes from './routes/location.routes.js';
import rentalRoutes from './routes/rental.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('combined'));
app.use(express.json());

app.use('/api/cars', carRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/rentals', rentalRoutes);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} with simulated storage`);
    });
}

export default app;