import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
    // Conectar a MongoDB real
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Tests conectados a MongoDB');
});

afterAll(async () => {
    // Solo desconectar, NO borrar la base de datos
    await mongoose.disconnect();
    console.log('Tests finalizados - Datos guardados en MongoDB');
});

describe('Car API', () => {

    // test que espera una lista vacia
    test('GET /api/cars - should return empty list', async () => {
        const res = await request(app).get('/api/cars');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    // funcion para devolver un id de location, necesaria para los carros
    async function createIdLocation() {
        const newLocation = {
            name: 'Sanqolqui rental cars',
            address: 'Front of espe in the main road',
            city: 'Sanqolqui',
            state: 'Pichincha',
            zip_code: '170102'
        };

        const existLocation = await request(app).get('/api/locations');
        if (existLocation.body.length === 0) {
            const res = await request(app).post('/api/locations').send(newLocation);
            console.log('Location creada para tests de cars');
            return res.body._id;
            
        } else {
            console.log('Location existente usada para tests de cars');
            return existLocation.body[0]._id;
        }
    }


    // test para crear un nuevo carro
    test('POST /api/cars - create a car', async () => {
        // extraemos una location creada
        const locationId = await createIdLocation();

        // creamos un nuevo carro
        const newCar1 = {
            make: 'Toyota',
            model: 'Hylux',
            year: 2023,
            license_plate: 'ABC123',
            rental_location_id: locationId
        };
        
        // cargamos el primer carro
        const res1 = await request(app).post('/api/cars').send(newCar1);
        expect(res1.statusCode).toBe(201);
        expect(res1.body).toMatchObject(newCar1);

        // creamos un segundo carro
        const newCar2 = {
            make: 'Toyota',
            model: 'Hylux',
            year: 2023,
            license_plate: 'XYZ123',
            rental_location_id: locationId
        };

        // cargamos el segundo carro
        const createSecondCar = await request(app).post('/api/cars').send(newCar2);
        expect(createSecondCar.statusCode).toBe(201);
        expect(createSecondCar.body).toMatchObject(newCar2);
    });


    // test para listar todos los carros
    test('GET /api/cars - list all cars', async () => {
        const res = await request(app).get('/api/cars');
        expect(res.statusCode).toBe(200);
        expect(res.body).not.toEqual([]);
    });

    // test para obtener un carro por ID
    test('GET /api/cars/:id - get car by ID', async () => {
        const resCarList = await request(app).get('/api/cars');
        expect(resCarList.statusCode).toBe(200);
        const idCar = resCarList.body[0]._id;

        const res = await request(app).get(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', idCar);
    });

    // test para actualizar un carro por ID
    test('PUT /api/cars/:id - update car by ID', async () => {
        const resCarList = await request(app).get('/api/cars');
        const idCar = resCarList.body[0]._id;
        const locationId = resCarList.body[0].rental_location_id._id;

        const updatedCar = {
            make: 'Toyota',
            model: 'Hylux Updated',
            year: 2024,
            license_plate: 'ABC123',
            rental_location_id: locationId
        };

        const res = await request(app).put(`/api/cars/${idCar}`).send(updatedCar);
        expect(res.statusCode).toBe(200);
        expect(res.body.make).toBe('Toyota');
        expect(res.body.model).toBe('Hylux Updated');
        expect(res.body.year).toBe(2024);
    });

    // test que espera fallar al obtener un carro con ID inexistente
    test('GET /api/cars/:id - fail to get car with non-existent ID', async () => {
        const idCar = '64b64c4f4f4f4f4f4f4f4f4f';
        const res = await request(app).get(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Car not found');
    });

    // test que espera fallar al crear un carro con license_plate duplicada
    test('POST /api/cars - fail to create car with duplicate license_plate', async () => {
        const locationId = await createIdLocation();

        // obtenemos el primer carro creado para usar su placa
        const resCars = await request(app).get('/api/cars');
        const plateFirstCar = resCars.body[0].license_plate;

        const duplicateCar = {
            make: 'Honda',
            model: 'Civic',
            year: 2022,
            license_plate: plateFirstCar, // misma placa del primer carro de la lista
            rental_location_id: locationId
        };
        
        const res = await request(app).post('/api/cars').send(duplicateCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/duplicate.*license_plate/i);        
    });

    // test que espera fallar al crear un carro sin campos requeridos
    test('POST /api/cars - fail to create car without required fields', async () => {
        const invalidCar = {
            make: '',
            model: '',
            year: '',
            license_plate: ''
        };
        const res = await request(app).post('/api/cars').send(invalidCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/Car validation failed.*required/i);
    });

    // test que espera fallar al crear un carro con year negativo
    test('POST /api/cars - fail to create car with negative year', async () => {
        // extraemos una location creada
        const locationId = await createIdLocation();

        const invalidCar = {
            make: 'Toyota',
            model: 'Corolla',
            year: -2020,
            license_plate: 'NEG123',
            rental_location_id: locationId
        };
        const res = await request(app).post('/api/cars').send(invalidCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Year must be at least 1886');
    });

    // test que espera fallar al crear un carro con year muy antiguo
    test('POST /api/cars - fail to create car with year too old', async () => {
        // extraemos una location creada
        const locationId = await createIdLocation();

        const invalidCar = {
            make: 'Ford',
            model: 'Model T',
            year: 1800,
            license_plate: 'OLD123',
            rental_location_id: locationId
        };
        const res = await request(app).post('/api/cars').send(invalidCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Year must be at least 1886');
    });

    // test que espera fallar al crear un carro con year futuro lejano
    test('POST /api/cars - fail to create car with year too far in future', async () => {
        // extraemos una location creada
        const locationId = await createIdLocation();

        const invalidCar = {
            make: 'Tesla',
            model: 'Future',
            year: 2100,
            license_plate: 'FUT123',
            rental_location_id: locationId
        };
        const res = await request(app).post('/api/cars').send(invalidCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Year cannot be more than 1 year in the future');
    });

    //funcion para crear el segundo carro
    async function createSecondCar(locationId) {
        const newCar = {
            make: 'Mazda',
            model: 'CX5',
            year: 2022,
            license_plate: 'PBQ445512',
            rental_location_id: locationId
        };
        const res = await request(app).post('/api/cars').send(newCar);
        return res;
    }

    // test que espera fallar al actualizar un carro con license_plate duplicada
    test('PUT /api/cars/:id - fail to update car with duplicate license_plate', async () => {
        // extraemos una location creada
        const locationId = await createIdLocation();

        // listar carros para obtener la placa 
        const resCars = await request(app).get('/api/cars');

        //obtenemos la placa del primer carro creado
        const existingCar = resCars.body[0];
        const plateFirstCar = existingCar.license_plate;

        // actualizar el nuevo carro con la placa del carro existente
        const updatedCar = {
            make: 'Mazda',
            model: 'CX5',
            year: 2022,
            license_plate: plateFirstCar, // placa del primer carro creado
            rental_location_id: locationId
        };

        // obtener el ID del segundo carro creado
        const carId2 = resCars.body[1]._id;

        const res = await request(app).put(`/api/cars/${carId2}`).send(updatedCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/duplicate.*license_plate/i);            
    });

    // test que espera fallar al eliminar un carro con ID inexistente
    test('DELETE /api/cars/:id - fail to delete car with non-existent ID', async () => {
        const idCar = '64b64c4f4f4f4f4f4f4f4f4f';
        const res = await request(app).delete(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Car not found');
    });

    //funcion para eliminar la location creada
    async function deleteLocation(locationId) {
        const res = await request(app).delete(`/api/locations/${locationId}`);
        return res;
    }

    // test para eliminar carros por ID
    test('DELETE /api/cars/:id - delete cars by ID', async () => {
        const resCarList = await request(app).get('/api/cars');
        expect(resCarList.statusCode).toBe(200);
        
        // eliminar todos los carros que existan
        for (let i = 0; i < resCarList.body.length; i++) {
            const idCar = resCarList.body[i]._id;
            const res = await request(app).delete(`/api/cars/${idCar}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Car deleted successfully');
        }

        // extraemos una location creada
        const locationId = await createIdLocation();
        const resDeleteLocation = await request(app).delete(`/api/locations/${locationId}`);
        expect(resDeleteLocation.body).toHaveProperty('message','Ubicación eliminada correctamente');
    });
    
});