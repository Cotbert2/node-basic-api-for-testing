// test/rental.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Rental from '../src/models/rental.model.js';
import Car from '../src/models/car.model.js';
import Customer from '../src/models/customer.model.js';
import Location from '../src/models/location.model.js';

describe('Pruebas para Rentals API', () => {
    let testLocation;
    let testCar;
    let testCustomer;

    beforeAll(async () => {
        // Conectar a MongoDB de prueba
        await mongoose.connect('mongodb://localhost:27017/test_rentals', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    beforeEach(async () => {
        // Crear datos de prueba
        testLocation = await Location.create({
            name: 'Sucursal Central',
            address: 'Av Principal 123',
            city: 'Ciudad',
            state: 'Estado',
            zip_code: '12345'
        });

        testCar = await Car.create({
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'ABC123',
            rental_location_id: testLocation._id
        });

        testCustomer = await Customer.create({
            name: 'Juan Perez',
            email: 'juan@test.com',
            phone_number: '1234567890',
            driver_license_number: 'DL123456'
        });
    });

    afterEach(async () => {
        // Limpiar la base de datos después de cada test
        await Rental.deleteMany({});
        await Car.deleteMany({});
        await Customer.deleteMany({});
        await Location.deleteMany({});
    });

    afterAll(async () => {
        // Cerrar conexión
        await mongoose.connection.close();
    });

    describe('POST /api/rentals', () => {
        it('debería crear un nuevo rental', async () => {
            const rentalData = {
                customer_id: testCustomer._id,
                car_id: testCar._id,
                rental_date: new Date('2024-01-15'),
                return_date: new Date('2024-01-20'),
                total_cost: 250.50
            };

            const response = await request(app)
                .post('/api/rentals')
                .send(rentalData);

            expect(response.status).toBe(201);
            expect(response.body.customer_id).toBe(testCustomer._id.toString());
            expect(response.body.car_id).toBe(testCar._id.toString());
        });
    });

    describe('GET /api/rentals', () => {
        it('debería obtener todos los rentals', async () => {
            // Primero crear un rental
            await Rental.create({
                customer_id: testCustomer._id,
                car_id: testCar._id,
                rental_date: new Date('2024-01-15'),
                return_date: new Date('2024-01-20'),
                total_cost: 250.50
            });

            const response = await request(app).get('/api/rentals');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
        });
    });

    describe('GET /api/rentals/:id', () => {
        it('debería obtener un rental por ID', async () => {
            const rental = await Rental.create({
                customer_id: testCustomer._id,
                car_id: testCar._id,
                rental_date: new Date('2024-01-15'),
                return_date: new Date('2024-01-20'),
                total_cost: 250.50
            });

            const response = await request(app)
                .get(`/api/rentals/${rental._id}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(rental._id.toString());
        });

        it('debería devolver 404 para rental no encontrado', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/rentals/${nonExistentId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/rentals/:id', () => {
        it('debería eliminar un rental', async () => {
            const rental = await Rental.create({
                customer_id: testCustomer._id,
                car_id: testCar._id,
                rental_date: new Date('2024-01-15'),
                return_date: new Date('2024-01-20'),
                total_cost: 250.50
            });

            const response = await request(app)
                .delete(`/api/rentals/${rental._id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Rent deleted successfully');
        });
    });
});