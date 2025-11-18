import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import app from '../src/app.js'; 
import { storage } from '../src/storage/data.js'; 


beforeEach(() => {
    storage.locations = [];
});

describe('Location API - /api/locations', () => {

    // --- Pruebas para POST /api/locations (createLocation) ---
    describe('POST /api/locations', () => {

        it('debería crear una nueva ubicación exitosamente (201)', async () => {
            const newLocation = {
                name: 'Sede Principal',
                address: '123 Calle Falsa',
                city: 'Springfield'
            };

            const res = await request(app)
                .post('/api/locations')
                .send(newLocation);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe(newLocation.name);
            expect(storage.locations.length).toBe(1);
            expect(storage.locations[0].city).toBe('Springfield');
        });

        it('debería fallar si faltan campos requeridos (400)', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({ address: 'Sin nombre' });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Name is required');
        });

        it('debería fallar si un campo tiene un tipo incorrecto (400)', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({ name: 'Sede Rota', city: 12345 }); 
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('City must be a string');
        });

        it('debería fallar si el nombre (name) ya existe (400)', async () => {
            storage.locations.push({
                id: uuidv4(),
                name: 'Sede Principal'
            });

            const res = await request(app)
                .post('/api/locations')
                .send({ name: 'Sede Principal' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Location name must be unique');
        });
    });

    // --- Pruebas para GET /api/locations (getLocations) ---
    describe('GET /api/locations', () => {

        it('debería retornar un arreglo vacío si no hay ubicaciones (200)', async () => {
            const res = await request(app).get('/api/locations');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('debería retornar todas las ubicaciones (200)', async () => {
            storage.locations.push({ id: uuidv4(), name: 'Sede A' });
            storage.locations.push({ id: uuidv4(), name: 'Sede B' });

            const res = await request(app).get('/api/locations');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[1].name).toBe('Sede B');
        });
    });

    // --- Pruebas para GET /api/locations/:id (getLocationById) ---
    describe('GET /api/locations/:id', () => {

        it('debería retornar una ubicación específica por ID (200)', async () => {
            const location = { id: uuidv4(), name: 'Sede Específica' };
            storage.locations.push(location);

            const res = await request(app).get(`/api/locations/${location.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(location);
        });

        it('debería retornar 404 si la ubicación no se encuentra (404)', async () => {
            const randomId = uuidv4();
            const res = await request(app).get(`/api/locations/${randomId}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Location not found');
        });

        it('debería retornar 400 si el ID tiene un formato inválido (400)', async () => {
            const res = await request(app).get('/api/locations/id-invalido-123');
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
        });
    });

    // --- Pruebas para PUT /api/locations/:id (updateLocation) ---
    describe('PUT /api/locations/:id', () => {

        it('debería actualizar una ubicación exitosamente (200)', async () => {
            const location = { id: uuidv4(), name: 'Nombre Viejo', city: 'Ciudad Vieja' };
            storage.locations.push(location);

            const updates = { name: 'Nombre Nuevo', city: 'Ciudad Nueva' };

            const res = await request(app)
                .put(`/api/locations/${location.id}`)
                .send(updates);

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Nombre Nuevo');
            expect(res.body.city).toBe('Ciudad Nueva');
            expect(storage.locations[0].name).toBe('Nombre Nuevo');
        });

        it('debería retornar 400 si el ID tiene un formato inválido (400)', async () => {
            const res = await request(app)
                .put('/api/locations/bad-uuid')
                .send({ name: 'Update Fail' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
        });

        it('debería retornar 400 por validación fallida en actualización (400)', async () => {
            const location = { id: uuidv4(), name: 'Sede C' };
            storage.locations.push(location);

            const res = await request(app)
                .put(`/api/locations/${location.id}`)
                .send({ address: 12345 }); 

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Address must be a string');
        });

        it('debería retornar 404 si la ubicación a actualizar no se encuentra (404)', async () => {
            const randomId = uuidv4();
            const res = await request(app)
                .put(`/api/locations/${randomId}`)
                .send({ name: 'No Existe' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Location not found');
        });

        it('debería fallar al actualizar a un nombre que ya existe (400)', async () => {
            const loc1 = { id: uuidv4(), name: 'Sede A' };
            const loc2 = { id: uuidv4(), name: 'Sede B' };
            storage.locations.push(loc1, loc2);

            const res = await request(app)
                .put(`/api/locations/${loc2.id}`)
                .send({ name: 'Sede A' }); 

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Location name must be unique');
        });

        it('debería permitir actualizar una ubicación sin cambiar su nombre (200)', async () => {
            const loc1 = { id: uuidv4(), name: 'Sede A', address: 'Calle 1' };
            storage.locations.push(loc1);

            const res = await request(app)
                .put(`/api/locations/${loc1.id}`)
                .send({ name: 'Sede A', address: 'Calle Nueva 456' });

            
            expect(res.statusCode).toBe(200);
            expect(res.body.address).toBe('Calle Nueva 456');
        });
        it('debería actualizar solo la dirección sin tocar el nombre (200)', async () => {
            const location = {
                id: uuidv4(),
                name: 'Nombre Original',
                address: 'Dirección Original'
            };
            storage.locations.push(location);

            
            const updates = { address: 'Dirección Nueva 123' };

            const res = await request(app)
                .put(`/api/locations/${location.id}`)
                .send(updates);

            expect(res.statusCode).toBe(200);

            expect(res.body.address).toBe('Dirección Nueva 123');

            expect(res.body.name).toBe('Nombre Original');
            expect(storage.locations[0].name).toBe('Nombre Original');
        });
    });

    // --- Pruebas para DELETE /api/locations/:id (deleteLocation) ---
    describe('DELETE /api/locations/:id', () => {

        it('debería eliminar una ubicación exitosamente (200)', async () => {
            const location = { id: uuidv4(), name: 'Sede a Borrar' };
            storage.locations.push(location);

            expect(storage.locations.length).toBe(1);

            const res = await request(app).delete(`/api/locations/${location.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Location deleted successfully');
            expect(storage.locations.length).toBe(0);
        });

        it('debería retornar 404 si la ubicación a eliminar no se encuentra (404)', async () => {
            const randomId = uuidv4();
            const res = await request(app).delete(`/api/locations/${randomId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Location not found');
        });

        it('debería retornar 400 si el ID tiene un formato inválido (400)', async () => {
            const res = await request(app).delete('/api/locations/123');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
        });
    });
});