import dotenv from 'dotenv';
import { connectDB } from './db/db.js';
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

// Solo conectar a la BD si NO estamos en entorno de test
if (process.env.NODE_ENV !== 'test') {
    connectDB();
    
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}

module.exports = app;



