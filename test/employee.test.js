// test/employee.test.js
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Employee from '../src/models/employee.model.js';
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
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});


// LAS PRUEBAS (CRUD PARA EMPLOYEES)
describe('Pruebas para /api/employees', () => {

    let testLocation;
    let SimulationLocation = { 
        name: 'Bodega Principal',
        address: 'Calle test', 
        city: 'Ciudad', 
        state: 'Estado', 
        zip_code: '12345' 
    };

    beforeEach(async () => {
        testLocation = await Location.create(SimulationLocation);
    });

    describe('POST /api/employees', () => {
        it('debería crear un nuevo empleado', async () => {
            const newEmployeeData = {
                name: 'Juan Granda',
                email: 'juan@test.com',
                phone_number: '555-1234',
                location_id: testLocation._id 
            };

            const res = await request.post('/api/employees').send(newEmployeeData);

            expect(res.statusCode).toBe(201);
            const employeeInDb = await Employee.findById(res.body._id);
            expect(employeeInDb).not.toBeNull();
        });
    });

    describe('GET /api/employees', () => {
        it('debería devolver todos los empleados', async () => {
            await Employee.create({
                name: 'Ana Gomez',
                email: 'ana@test.com',
                phone_number: '555-5678',
                location_id: testLocation._id
            });
            const res = await request.get('/api/employees');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].location_id.name).toBe('Bodega Principal');
        });
    });

    describe('GET /api/employees/:id', () => {
        it('debería devolver un empleado específico', async () => {
            const employee = await Employee.create({
                name: 'Luis',
                email: 'luis@test.com',
                phone_number: '555-0000',
                location_id: testLocation._id
            });
            const res = await request.get(`/api/employees/${employee._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.location_id._id).toBe(testLocation._id.toString());
        });

    });

    describe('DELETE /api/employees/:id', () => {
        it('debería eliminar un empleado en la DB', async () => {
            const employee = await Employee.create({
                name: 'Para Borrar',
                email: 'delete@test.com',
                phone_number: '555-9999',
                location_id: testLocation._id
            });
            const res = await request.delete(`/api/employees/${employee._id}`);
            expect(res.statusCode).toBe(200);
            const employeeInDb = await Employee.findById(employee._id);
            expect(employeeInDb).toBeNull();
        });
    });

    describe('PUT /api/employees/:id', () => {
        it('debería actualizar un empleado en la DB', async () => {
            const employee = await Employee.create({
                name: 'Carlos Isaac',
                email: 'carlos@test.com',
                phone_number: '555-0000',
                location_id: testLocation._id
            });
            const updateData = { name: 'Martin Caiza' };
            const res = await request
                .put(`/api/employees/${employee._id}`)
                .send(updateData);
            expect(res.statusCode).toBe(200);
            const employeeInDb = await Employee.findById(employee._id);
            expect(employeeInDb.name).toBe('Martin Caiza');
        });
    });
});