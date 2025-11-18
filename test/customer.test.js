import request from 'supertest';
import app from '../src/app.js';
import { storage } from '../src/storage/data.js';

// hook para limpiar el storage antes de cada prueba
beforeEach(() => {
    storage.customers = [];
});

describe('Customer API', () => {

    // funcion helper para crear un customer y devolver el objeto completo
    async function createCustomer(email = 'juanito333@gmail.com', options = {}) {
        const customerData = {
            name: options.name || 'Andres Torres',
            email: email,
            phone_number: options.phone_number || '+593987654321',
            driver_license_number: options.driver_license_number || 'DL123456'
        };

        const res = await request(app).post('/api/customers').send(customerData);
        return res.body;
    }

    // test que espera retornar una lista vacia
    test('GET /api/customers - should return empty list', async () => {
        const res = await request(app).get('/api/customers');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    // test para crear y listar customers
    test('POST and GET /api/customers - create and list customers', async () => {
        // crear primer customer
        const customer1 = await createCustomer('andres@gmail.com', { name: 'Andres Torres' });
        expect(customer1).toHaveProperty('id');
        expect(customer1.name).toBe('Andres Torres');
        expect(customer1.email).toBe('andres@gmail.com');
        expect(storage.customers.length).toBe(1);

        // crear segundo customer
        const customer2 = await createCustomer('ana123@gmail.com', { name: 'Ana Perez' });
        expect(customer2.email).toBe('ana123@gmail.com');
        expect(storage.customers.length).toBe(2);

        // listar todos los customers
        const listRes = await request(app).get('/api/customers');
        expect(listRes.statusCode).toBe(200);
        expect(listRes.body.length).toBe(2);
    });

    // test para obtener, actualizar y eliminar customer por id
    test('GET /api/customers/:id - get, update and delete customer by ID', async () => {
        // crear customer
        const customer = await createCustomer('juanito333@gmail.com');
        const customerId = customer.id;

        // obtener por id
        const getRes = await request(app).get(`/api/customers/${customerId}`);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body).toHaveProperty('id', customerId);
        expect(getRes.body.email).toBe('juanito333@gmail.com');

        // actualizar
        const updateData = {
            name: 'Juanito Updated',
            email: 'juanito333@gmail.com',
            phone_number: '+593987654321',
            driver_license_number: 'DL123456'
        };
        const updateRes = await request(app).put(`/api/customers/${customerId}`).send(updateData);
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.name).toBe('Juanito Updated');

        // eliminar
        const deleteRes = await request(app).delete(`/api/customers/${customerId}`);
        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body).toHaveProperty('message', 'Customer deleted successfully');
        expect(storage.customers.length).toBe(0);
    });

    // test para obtener customer con id inexistente
    test('GET /api/customers/:id - fail with non-existent ID', async () => {
        const nonExistentId = 'a1b2c3d4-e5f6-4789-a012-345678901234';
        
        const res = await request(app).get(`/api/customers/${nonExistentId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Customer not found');
    });

    // test para obtener customer con id invalido
    test('GET /api/customers/:id - fail with invalid ID format', async () => {
        const invalidId = 'invalid-id-format';
        
        const res = await request(app).get(`/api/customers/${invalidId}`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid ID format. Must be a valid UUID');
    });

    // test para eliminar customer con id inexistente
    test('DELETE /api/customers/:id - fail with non-existent ID', async () => {
        const nonExistentId = 'a1b2c3d4-e5f6-4789-a012-345678901234';
        
        const res = await request(app).delete(`/api/customers/${nonExistentId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Customer not found');
    });

    // test para eliminar customer con id invalido
    test('DELETE /api/customers/:id - fail with invalid ID format', async () => {
        const invalidId = 'invalid-id-format';
        
        const res = await request(app).delete(`/api/customers/${invalidId}`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid ID format. Must be a valid UUID');
    });

    // test para crear customer con email duplicado
    test('POST /api/customers - fail with duplicate email', async () => {
        await createCustomer('maria@gmail.com');
        
        const res = await request(app).post('/api/customers').send({
            name: 'Maria Lopez',
            email: 'maria@gmail.com',
            phone_number: '+593987654321',
            driver_license_number: 'DL999999'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email must be unique');
    });

    // test para crear customer con campos requeridos vacios
    test('POST /api/customers - fail with empty required fields', async () => {
        const res = await request(app).post('/api/customers').send({
            name: '',
            email: '',
            phone_number: '',
            driver_license_number: ''
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('required');
    });

    // test para crear customer con nombre que contiene numeros
    test('POST /api/customers - fail with name containing numbers', async () => {
        const res = await request(app).post('/api/customers').send({
            name: 'Ismael123',
            email: 'Ismael123@gmail.com',
            phone_number: '+593987654321',
            driver_license_number: 'DL123456'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('The name cannot contain numbers');
    });

    // test para crear customer con telefono que contiene letras
    test('POST /api/customers - fail with phone number containing letters', async () => {
        const res = await request(app).post('/api/customers').send({
            name: 'Andres Torres',
            email: 'andres@gmail.com',
            phone_number: '+59398abc4321',
            driver_license_number: 'DL123456'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('The phone number cannot contain letters');
    });

    // test para crear customer con email invalido
    test('POST /api/customers - fail with invalid email format', async () => {
        const res = await request(app).post('/api/customers').send({
            name: 'Andres Torres',
            email: 'email',
            phone_number: '+593987654321',
            driver_license_number: 'DL123456'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid email format');
    });

    // test para actualizar customer con email duplicado
    test('PUT /api/customers/:id - fail with duplicate email', async () => {
        const customer1 = await createCustomer('Juanito@gmail.com', { name: 'Juanito Campues' });
        const customer2 = await createCustomer('Esteban@gmail.com', { name: 'Esteban Farinango' });

        const res = await request(app).put(`/api/customers/${customer2.id}`).send({
            name: 'Esteban Farinango',
            email: 'Juanito@gmail.com',
            phone_number: '+593987654321',
            driver_license_number: 'DL123456'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email must be unique');
    });

    // test para actualizar customer con id inexistente
    test('PUT /api/customers/:id - fail with non-existent ID', async () => {
        const nonExistentId = 'a1b2c3d4-e5f6-4789-a012-345678901234';
        
        const res = await request(app).put(`/api/customers/${nonExistentId}`).send({
            name: 'Updated Andres',
            email: 'andres@gmail.com'
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Customer not found');
    });

    // test para actualizar customer con id invalido
    test('PUT /api/customers/:id - fail with invalid ID format', async () => {
        const res = await request(app).put(`/api/customers/invalid-id`).send({
            name: 'Updated Andres'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('Invalid ID');
    });

    // test para actualizar customer con nombre que contiene numeros
    test('PUT /api/customers/:id - fail with name containing numbers', async () => {
        const customer = await createCustomer('test@gmail.com', { name: 'Test User' });
        
        const res = await request(app).put(`/api/customers/${customer.id}`).send({
            name: 'Ismael123'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('The name cannot contain numbers');
    });

    // test para actualizar customer con telefono que contiene letras
    test('PUT /api/customers/:id - fail with phone number containing letters', async () => {
        const customer = await createCustomer('test@gmail.com', { name: 'Test User' });
        
        const res = await request(app).put(`/api/customers/${customer.id}`).send({
            phone_number: '+59398abc4321'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('The phone number cannot contain letters');
    });
});