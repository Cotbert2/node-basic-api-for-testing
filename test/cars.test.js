import request from 'supertest';
import app from '../src/app.js';
import { storage } from '../src/storage/data.js';

// hook para limpiar el storage antes de cada prueba
beforeEach(() => {
    storage.cars = [];
    storage.locations = [];
});

describe('Car API', () => {

    // funcion helper para crear un location y devolver su id
    async function createLocation() {
        const newLocation = {
            name: 'Sangolqui rental cars',
            address: 'Front of espe in the main road',
            city: 'Sangolqui',
            state: 'Pichincha',
            zip_code: '170102'
        };

        const res = await request(app).post('/api/locations').send(newLocation);
        return res.body.id;
    }

    // test que espera una lista vacia
    test('GET /api/cars - should return empty list', async () => {
        const res = await request(app).get('/api/cars');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    // test para crear un nuevo carro
    test('POST /api/cars - create a car', async () => {
        const locationId = await createLocation();

        const newCar1 = {
            make: 'Toyota',
            model: 'Hylux',
            year: 2023,
            license_plate: 'ABC123',
            rental_location_id: locationId
        };
        
        const res1 = await request(app).post('/api/cars').send(newCar1);
        expect(res1.statusCode).toBe(201);
        expect(res1.body).toHaveProperty('id');
        expect(res1.body.make).toBe(newCar1.make);
        expect(res1.body.license_plate).toBe(newCar1.license_plate);
        expect(storage.cars.length).toBe(1);

        // crear un segundo carro
        const newCar2 = {
            make: 'Toyota',
            model: 'Hylux',
            year: 2023,
            license_plate: 'XYZ123',
            rental_location_id: locationId
        };

        const res2 = await request(app).post('/api/cars').send(newCar2);
        expect(res2.statusCode).toBe(201);
        expect(res2.body.license_plate).toBe('XYZ123');
        expect(storage.cars.length).toBe(2);
    });

    // test para listar todos los carros
    test('GET /api/cars - list all cars', async () => {
        const locationId = await createLocation();

        const newCar = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'TEST123',
            rental_location_id: locationId
        };
        await request(app).post('/api/cars').send(newCar);

        const res = await request(app).get('/api/cars');
        expect(res.statusCode).toBe(200);
        expect(res.body).not.toEqual([]);
        expect(res.body.length).toBe(1);
    });

    // test para obtener un carro por id
    test('GET /api/cars/:id - get car by ID', async () => {
        const locationId = await createLocation();

        const newCar = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'TEST123',
            rental_location_id: locationId
        };
        const createRes = await request(app).post('/api/cars').send(newCar);
        const idCar = createRes.body.id;

        const res = await request(app).get(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', idCar);
        expect(res.body.license_plate).toBe('TEST123');
    });

    // test para actualizar un carro por id
    test('PUT /api/cars/:id - update car by ID', async () => {
        const locationId = await createLocation();

        const newCar = {
            make: 'Toyota',
            model: 'Hylux',
            year: 2023,
            license_plate: 'ABC123',
            rental_location_id: locationId
        };
        const createRes = await request(app).post('/api/cars').send(newCar);
        const idCar = createRes.body.id;

        const updatedCar = {
            make: 'Toyota',
            model: 'Hylux Updated',
            year: 2024,
            license_plate: 'ABC123',
            rental_location_id: locationId
        };

        const res = await request(app).put(`/api/cars/${idCar}`).send(updatedCar);
        expect(res.statusCode).toBe(200);
        expect(res.body.model).toBe('Hylux Updated');
        expect(res.body.year).toBe(2024);
    });

    // test que espera fallar al obtener carro con id inexistente
    test('GET /api/cars/:id - should fail to get car with non-existent ID', async () => {
        const idCar = 'a1b2c3d4-e5f6-4789-a012-345678901234';
        const res = await request(app).get(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Car not found');
    });

    // test que espera fallar al obtener carro con id invalido
    test('GET /api/cars/:id - should fail to get car with invalid ID', async () => {
        const idCar = 'invalid-id-format';
        const res = await request(app).get(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid ID format. Must be a valid UUID');
    });

    // test que espera fallar al crear carro con license_plate duplicada
    test('POST /api/cars - should fail to create car with duplicate license_plate', async () => {
        const locationId = await createLocation();

        const car1 = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'DUP123',
            rental_location_id: locationId
        };
        await request(app).post('/api/cars').send(car1);

        // intentar crear otro con la misma placa
        const car2 = {
            make: 'Honda',
            model: 'Civic',
            year: 2022,
            license_plate: 'DUP123',
            rental_location_id: locationId
        };
        
        const res = await request(app).post('/api/cars').send(car2);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'License plate must be unique');
    });

    // test que espera fallar al crear carro sin campos requeridos
    test('POST /api/cars - should fail to create car without required fields', async () => {
        const invalidCar = {
            make: '',
            model: '',
            year: '',
            license_plate: ''
        };
        const res = await request(app).post('/api/cars').send(invalidCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('required');
    });

    // test que espera fallar al crear carro con year negativo
    test('POST /api/cars - should fail to create car with negative year', async () => {
        const locationId = await createLocation();

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

    // test que espera fallar al crear carro con year muy antiguo
    test('POST /api/cars - should fail to create car with year too old', async () => {
        const locationId = await createLocation();

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

    // test que espera fallar al crear carro con year futuro lejano
    test('POST /api/cars - should fail to create car with year too far in future', async () => {
        const locationId = await createLocation();

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

    // test que espera fallar al actualizar carro con license_plate duplicada
    test('PUT /api/cars/:id - should fail to update car with duplicate license_plate', async () => {
        const locationId = await createLocation();

        // crear primer carro
        const car1 = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'FIRST123',
            rental_location_id: locationId
        };
        await request(app).post('/api/cars').send(car1);

        // crear segundo carro
        const car2 = {
            make: 'Mazda',
            model: 'CX5',
            year: 2022,
            license_plate: 'SECOND123',
            rental_location_id: locationId
        };
        const res2 = await request(app).post('/api/cars').send(car2);
        const carId2 = res2.body.id;

        // intentar actualizar car2 con la placa de car1
        const updatedCar = {
            make: 'Mazda',
            model: 'CX5',
            year: 2022,
            license_plate: 'FIRST123',
            rental_location_id: locationId
        };

        const res = await request(app).put(`/api/cars/${carId2}`).send(updatedCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'License plate must be unique');
    });

    // test que espera fallar al eliminar carro con id inexistente
    test('DELETE /api/cars/:id - should fail to delete car with non-existent ID', async () => {
        const idCar = 'a1b2c3d4-e5f6-4789-a012-345678901234';
        const res = await request(app).delete(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Car not found');
    });

    // test que espera fallar al eliminar carro con id invalido
    test('DELETE /api/cars/:id - should fail to delete car with invalid ID', async () => {
        const idCar = 'not-a-uuid';
        const res = await request(app).delete(`/api/cars/${idCar}`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid ID format. Must be a valid UUID');
    });

    // test para crear carro sin rental_location_id (opcional)
    test('POST /api/cars - create car without rental_location_id', async () => {
        const newCar = {
            make: 'Tesla',
            model: 'Model 3',
            year: 2024,
            license_plate: 'TESLA123'
        };

        const res = await request(app).post('/api/cars').send(newCar);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.make).toBe('Tesla');
        expect(res.body).not.toHaveProperty('rental_location_id');
    });

    // test para listar carros con y sin location
    test('GET /api/cars - list cars with and without location', async () => {
        const locationId = await createLocation();

        // carro con location
        const car1 = {
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            license_plate: 'WITH-LOC',
            rental_location_id: locationId
        };

        // carro sin location
        const car2 = {
            make: 'Honda',
            model: 'Accord',
            year: 2023,
            license_plate: 'NO-LOC'
        };

        await request(app).post('/api/cars').send(car1);
        await request(app).post('/api/cars').send(car2);

        const res = await request(app).get('/api/cars');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('rental_location_id');
        expect(res.body[1]).not.toHaveProperty('rental_location_id');
    });

    // test para obtener carro con rental_location_id inexistente
    test('GET /api/cars/:id - get car with non-existent location', async () => {
        const fakeLocationId = 'a1b2c3d4-e5f6-4789-a012-345678901234';
        
        const newCar = {
            make: 'Ford',
            model: 'Focus',
            year: 2023,
            license_plate: 'ORPHAN',
            rental_location_id: fakeLocationId
        };

        const createRes = await request(app).post('/api/cars').send(newCar);
        const carId = createRes.body.id;

        const res = await request(app).get(`/api/cars/${carId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.rental_location_id).toBe(fakeLocationId);
    });

    // test que espera fallar al actualizar carro con id inexistente
    test('PUT /api/cars/:id - should fail to update car with non-existent ID', async () => {
        const idCar = 'a1b2c3d4-e5f6-4789-a012-345678901234';
        const updatedCar = {
            make: 'Toyota',
            model: 'Updated',
            year: 2024,
            license_plate: 'UPDATE'
        };

        const res = await request(app).put(`/api/cars/${idCar}`).send(updatedCar);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Car not found');
    });

    // test que espera fallar al actualizar carro con year invalido
    test('PUT /api/cars/:id - should fail to update car with invalid year', async () => {
        const locationId = await createLocation();

        const newCar = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'VALID',
            rental_location_id: locationId
        };

        const createRes = await request(app).post('/api/cars').send(newCar);
        const carId = createRes.body.id;

        const updatedCar = {
            year: 2200
        };

        const res = await request(app).put(`/api/cars/${carId}`).send(updatedCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Year cannot be more than 1 year in the future');
    });

    // test que espera fallar al actualizar carro con rental_location_id invalido
    test('PUT /api/cars/:id - should fail to update car with invalid rental_location_id', async () => {
        const locationId = await createLocation();

        const newCar = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'VALID2',
            rental_location_id: locationId
        };

        const createRes = await request(app).post('/api/cars').send(newCar);
        const carId = createRes.body.id;

        const updatedCar = {
            rental_location_id: 'invalid-uuid-format'
        };

        const res = await request(app).put(`/api/cars/${carId}`).send(updatedCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Rental location ID must be a valid UUID');
    });

    // test que espera fallar al actualizar carro con multiples errores de validacion
    test('PUT /api/cars/:id - should fail to update car with multiple validation errors', async () => {
        const locationId = await createLocation();

        const newCar = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'VALID3',
            rental_location_id: locationId
        };

        const createRes = await request(app).post('/api/cars').send(newCar);
        const carId = createRes.body.id;

        const updatedCar = {
            year: 1500,
            rental_location_id: 'not-a-uuid'
        };

        const res = await request(app).put(`/api/cars/${carId}`).send(updatedCar);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message.length).toBeGreaterThan(0);
    });

    // test para eliminar carros por id
    test('DELETE /api/cars/:id - delete cars by ID', async () => {
        const locationId = await createLocation();

        // crear dos carros
        const car1 = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            license_plate: 'DEL1',
            rental_location_id: locationId
        };
        const car2 = {
            make: 'Honda',
            model: 'Civic',
            year: 2022,
            license_plate: 'DEL2',
            rental_location_id: locationId
        };

        const res1 = await request(app).post('/api/cars').send(car1);
        const res2 = await request(app).post('/api/cars').send(car2);

        const idCar1 = res1.body.id;
        const idCar2 = res2.body.id;

        // eliminar ambos carros
        const deleteRes1 = await request(app).delete(`/api/cars/${idCar1}`);
        const deleteRes2 = await request(app).delete(`/api/cars/${idCar2}`);

        expect(deleteRes1.statusCode).toBe(200);
        expect(deleteRes1.body).toHaveProperty('message', 'Car deleted successfully');
        expect(deleteRes2.statusCode).toBe(200);
        expect(deleteRes2.body).toHaveProperty('message', 'Car deleted successfully');
        expect(storage.cars.length).toBe(0);
    });
});