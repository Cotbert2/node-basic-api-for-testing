// test/location.test.js
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Location from '../src/models/location.model.js';

const request = supertest(app);


beforeAll(async () => {
    const dbUri = process.env.MONGO_URI;
    try {
        await mongoose.connect(dbUri);
    } catch (err) {
        console.error('Error conectando a la BD de prueba:', err.message);
        process.exit(1);
    }
});

afterEach(async () => {
    try {
        await Location.deleteMany({});
    } catch (error) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});


// LAS PRUEBAS (CRUD PARA LOCATIONS)

describe('Pruebas para /api/locations', () => {


    const SimulationLocation = { 
        name: 'Bodega Principal',
        address: 'Calle 123', 
        city: 'Ciudad', 
        state: 'Estado', 
        zip_code: '12345' 
    };

    describe('POST /api/locations', () => {
        it('debería crear una nueva ubicación', async () => {
            const res = await request.post('/api/locations').send(SimulationLocation);

            expect(res.statusCode).toBe(201); 
            expect(res.body.name).toBe(SimulationLocation.name);

            const locationInDb = await Location.findById(res.body._id);
            expect(locationInDb).not.toBeNull();
            expect(locationInDb.city).toBe(SimulationLocation.city);
        });
    });

    describe('GET /api/locations', () => {
        it('debería devolver todas las ubicaciones', async () => {
            // Primero, creamos una ubicación para que no esté vacía
            await Location.create(SimulationLocation);

            const res = await request.get('/api/locations');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe(SimulationLocation.name);
        });
    });

    describe('GET /api/locations/:id', () => {
        it('debería devolver una ubicación específica por ID', async () => {
            const location = await Location.create(SimulationLocation);

            const res = await request.get(`/api/locations/${location._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe(location.name);
        });

    });

    describe('PUT /api/locations/:id', () => {
        it('debería actualizar una ubicación existente', async () => {
            const location = await Location.create(SimulationLocation);
            const updateData = { name: 'Bodega Secundaria', city: 'Otra Ciudad' };

            const res = await request
                .put(`/api/locations/${location._id}`)
                .send(updateData);


            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Bodega Secundaria');
            expect(res.body.city).toBe('Otra Ciudad');

            const locationInDb = await Location.findById(location._id);
            expect(locationInDb.name).toBe('Bodega Secundaria');
        });
    });

    describe('DELETE /api/locations/:id', () => {
        it('debería eliminar una ubicación de la BD', async () => {
            const location = await Location.create(SimulationLocation);

            const res = await request.delete(`/api/locations/${location._id}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Ubicación eliminada correctamente');

            const locationInDb = await Location.findById(location._id);
            expect(locationInDb).toBeNull();
        });
    });
});