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

describe('Customer API', () => {
    // test que espera una listar vacia
    test('GET /api/customers - should empty list', async () => {
        const res = await request(app).get('/api/customers');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    //test para crear un nuevo customer correctamente
    test('POST /api/customers - create new customer', async () => {
        // Datos del nuevo customer
        const newCustomer = {
            name: 'Moises',
            email: 'moises123@gmail.com',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };
        
        const costumer = await request(app).post('/api/customers').send(newCustomer);
        expect(costumer.statusCode).toBe(201);
        expect(costumer.body).toMatchObject(newCustomer);

    });

    // Test para listar todos los customers
    test('GET /api/customers - list all customers', async () => {
        const res = await request(app).get('/api/customers');
        expect(res.statusCode).toBe(200);
        expect(res.body).not.toEqual([]);
    });

    //test para obtener un customer por ID
    test('GET /api/customers/:id - get customer by ID', async () => {
        //obtener la lista de costumers
        const resCostumerList = await request(app).get(`/api/customers`);
        expect(resCostumerList.statusCode).toBe(200);
        const idCostumer = resCostumerList.body[0]._id;

        //buscar el id
        const res = await request(app).get(`/api/customers/${idCostumer}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', idCostumer);
    });

    // test para actualizar un customer por ID
    test('PUT /api/customers/:id - update customer by ID', async () => {
        //obtener la lista de costumers
        const resCostumerList = await request(app).get(`/api/customers`);
        expect(resCostumerList.statusCode).toBe(200);
        const idCostumer = resCostumerList.body[0]._id;
        const updatedData = {
            name: 'Moises Updated',
            email: 'moises123@gmail.com',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };

        const res = await request(app).put(`/api/customers/${idCostumer}`).send(updatedData);
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject(updatedData);
    });

    // test que espera fallar al obtener un customer con id inexistente
    test('GET /api/customers/:id - fail to get customer with non-existent ID', async () => {
        const idCostumer = '64b64c4f4f4f4f4f4f4f4f4f'; // id inexistente pero valido
        const res = await request(app).get(`/api/customers/${idCostumer}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Customer not found');
    });

    // test que espera fallar al crear un customer con email duplicado
    test('POST /api/customers - fail to create customer with duplicate email', async () => {
        // Crear un customer inicial
        const existingCustomer = {
            name: 'Moises',
            email: 'moises123@gmail.com',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };
        const res =await request(app).post('/api/customers').send(existingCustomer);
        
        expect(res.statusCode).toBe(400);
        console.log("Erro por email duplicado: " + res.body.error);        
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/duplicate.*email/i);       
    });

    // test que espera fallar al crear un customer sin nombre
    test('POST /api/customers - fail to create customer with empty name', async () => {
        // customer con nombre vacio
        const invalidCustomer = {
            name: '',
            email: 'moi@gmail.com',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };
        const res = await request(app).post('/api/customers').send(invalidCustomer);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('required');
    });

    // test que espera fallar al crear un customer con nombre que contiene numeros
    test('POST /api/customers - fail to create customer with name containing numbers', async () => {
        // customer con nombre que contiene numeros
        const invalidCustomer = {
            name: 'Moises123',
            email: 'moises123@gmail.com',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };
        const res = await request(app).post('/api/customers').send(invalidCustomer);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'The name cannot contain numbers');
    });

    // test que espera fallar al crear un customer con numero de celular que contiene letras
    test('POST /api/customers - fail to create customer with phone number containing letters', async () => {
        // customer con numero de celular que contiene letras
        const invalidCustomer = {
            name: 'Moises',
            email: 'moises123@gmail.com',
            phone_number: '+59387abc3210',
            driver_license_number: 'D1234567'
        };
        const res = await request(app).post('/api/customers').send(invalidCustomer);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'The phone number cannot contain letters');
    });

    // test que espera fallar al actualizar un customer con nombre que contiene numeros
    test('PUT /api/customers/:id - fail to update customer with name containing numbers', async () => {
        //obtener la lista de costumers
        const resCostumerList = await request(app).get(`/api/customers`);
        expect(resCostumerList.statusCode).toBe(200);
        const idCostumer = resCostumerList.body[0]._id;
        const updatedData = {
            name: 'Moises123',
            email: 'moises123@gmail.com',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };
        const res = await request(app).put(`/api/customers/${idCostumer}`).send(updatedData);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'The name cannot contain numbers');
    });

    // test que espera fallar al actualizar un customer con id invalido
    test('PUT /api/customers/:id - fail to update customer with invalid ID', async () => {
        const idCostumer = 'abc44'; // id invalido

        const updatedData = {
             name: 'Moises Updated',
            email: 'moises123@gmail.com',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };

        const res = await request(app).put(`/api/customers/${idCostumer}`).send(updatedData);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/Cast to ObjectId failed|Invalid ID/i);
    });

    // test que espera fallar al actualizar un customer con numero de celular que contiene letras
    test('PUT /api/customers/:id - fail to update, phone number containing letters', async () => {
        //obtener la lista de costumers
        const resCostumerList = await request(app).get(`/api/customers`);
        expect(resCostumerList.statusCode).toBe(200);
        const idCostumer = resCostumerList.body[0]._id;
        const updatedData = {
            name: 'Moises',
            email: 'moises123@gmail.com',
            phone_number: '+59387abc3210',
            driver_license_number: 'D1234567'
        };
        const res = await request(app).put(`/api/customers/${idCostumer}`).send(updatedData);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'The phone number cannot contain letters');
    });    

    // test que espera fallar al crear un customer con email invalido
    test('POST /api/customers - fail to create customer with invalid email format', async () => {
        const invalidCustomerEmail = {
            name: 'Pedro',
            email: 'notanemail',
            phone_number: '+593876543210',
            driver_license_number: 'D1234567'
        };
        const res = await request(app).post('/api/customers').send(invalidCustomerEmail);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid email format or empty email');
    });

    // test que espera fallar al eliminar un customer con ID inexistente
    test('DELETE /api/customers/:id - fail to delete customer with non-existent ID', async () => {
        const idCostumer = '64b64c4f4f4f4f4f4f4f4f4f'; // ID valido pero inexistente
        const res = await request(app).delete(`/api/customers/${idCostumer}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Customer not found');
    });

    // test que espera fallar al actualizar un customer con email duplicado
    test('PUT /api/customers/:id - fail to update customer with duplicate email', async () => {
        // nuevo customer 
        const customer2 = {
            name: 'Maria',
            email: 'maria@gmail.com',
            phone_number: '+593876543211',
            driver_license_number: 'D2222222'
        };
        
        const res2 = await request(app).post('/api/customers').send(customer2);
        const idCustomer2 = res2.body._id;

        // intentar actualizar customer2 con el email de customer1
        const updatedData = {
            name: 'Maria',
            email: 'moises123@gmail.com', // email duplicado del primer customer
            phone_number: '+593876543211',
            driver_license_number: 'D2222222'
        };
        
        const res = await request(app).put(`/api/customers/${idCustomer2}`).send(updatedData);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('duplicate');
    });

        // test para eliminar un customer por ID
    test('DELETE /api/customers/:id - delete customer by ID', async () => {
        //obtener la lista de costumers
        const resCostumerList = await request(app).get(`/api/customers`);
        expect(resCostumerList.statusCode).toBe(200);
        const idCostumer1 = resCostumerList.body[0]._id;
        const idCostumer2 = resCostumerList.body[1]._id;

        const res = await request(app).delete(`/api/customers/${idCostumer1}`);
        const res2 = await request(app).delete(`/api/customers/${idCostumer2}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Customer deleted successfully');
    });
});