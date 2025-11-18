import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import app from '../src/app.js'; 
import { storage } from '../src/storage/data.js'; 

// Hook para limpiar el storage antes de cada prueba
beforeEach(() => {
    storage.employees = [];
    storage.locations = [];
});

describe('Employee API - /api/employees', () => {

    // --- Pruebas para POST /api/employees (createEmployee) ---
    describe('POST /api/employees', () => {

        it('debería crear un nuevo empleado exitosamente (201)', async () => {
            const newEmployee = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone_number: '1234567890'
            };

            const res = await request(app)
                .post('/api/employees')
                .send(newEmployee);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe(newEmployee.name);
            expect(storage.employees.length).toBe(1);
            expect(storage.employees[0].email).toBe(newEmployee.email);
        });


        it('Employee Errors', async () => {
            const newEmployee = {
                name: 'John Doe',
                email: 'john.doeexample.com',
                phone_number: 1234567890
            };

            const res = await request(app)
                .post('/api/employees')
                .send(newEmployee);

            expect(res.statusCode).toBe(400);

        });

        it('Employee Errors', async () => {
            const newEmployee = {
                name: 'John Doe',
                email: 12,
                phone_number: 1234567890
            };

            const res = await request(app)
                .post('/api/employees')
                .send(newEmployee);

            expect(res.statusCode).toBe(400);

        });

        it('debería fallar si faltan campos requeridos (400)', async () => {
            const res = await request(app)
                .post('/api/employees')
                .send({}); 

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Name is required');
        });

        it('debería fallar con un formato de email inválido (400)', async () => {
            const res = await request(app)
                .post('/api/employees')
                .send({ name: 'Jane Doe', email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Invalid email format');
        });

        it('debería fallar si el location_id no es un UUID válido (400)', async () => {
            const res = await request(app)
                .post('/api/employees')
                .send({ name: 'Jim Doe', location_id: '12345' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Location ID must be a valid UUID');
        });

        it('debería fallar si el email ya existe (400)', async () => {
            const existingEmail = 'test-duplicado@example.com';
            storage.employees.push({
                id: uuidv4(),
                name: 'First User',
                email: existingEmail
            });

            const res = await request(app)
                .post('/api/employees')
                .send({
                    name: 'Second User',
                    email: existingEmail 
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email must be unique');
        });
        it('debería crear un empleado sin email exitosamente (201)', async () => {
            const newEmployee = {
                name: 'No Email User',
                phone_number: '987654321'
            }; 

            const res = await request(app)
                .post('/api/employees')
                .send(newEmployee);

            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe('No Email User');
            
            expect(res.body.email).toBeUndefined();
            expect(storage.employees[0].email).toBeUndefined();
        });
    });

    // --- Pruebas para GET /api/employees (getEmployees) ---
    describe('GET /api/employees', () => {

        it('debería retornar un arreglo vacío si no hay empleados (200)', async () => {
            const res = await request(app).get('/api/employees');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('debería retornar todos los empleados (200)', async () => {
            storage.employees.push({ id: uuidv4(), name: 'Employee 1' });
            storage.employees.push({ id: uuidv4(), name: 'Employee 2' });

            const res = await request(app).get('/api/employees');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].name).toBe('Employee 1');
        });

        it('debería "popular" el location_id si existe (200)', async () => {
            const location = { id: uuidv4(), name: 'Main Office' };
            storage.locations.push(location);

            const employee = { id: uuidv4(), name: 'Manager', location_id: location.id };
            storage.employees.push(employee);

            const res = await request(app).get('/api/employees');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].location_id).toEqual(location); 
        });

        it('debería retornar el location_id como string si no se encuentra la ubicación (200)', async () => {
            const staleLocationId = uuidv4();
            const employee = { id: uuidv4(), name: 'Worker', location_id: staleLocationId };
            storage.employees.push(employee);

            const res = await request(app).get('/api/employees');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].location_id).toBe(staleLocationId); 
        });

        it('debería manejar empleados sin location_id (200)', async () => {
            const employee = { id: uuidv4(), name: 'Freelancer' }; 
            storage.employees.push(employee);

            const res = await request(app).get('/api/employees');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe('Freelancer');
            expect(res.body[0].location_id).toBeUndefined();
        });
    });

    // --- Pruebas para GET /api/employees/:id (getEmployeeById) ---
    describe('GET /api/employees/:id', () => {

        it('debería retornar un empleado específico por ID (200)', async () => {
            const employee = { id: uuidv4(), name: 'Specific Employee' };
            storage.employees.push(employee);

            const res = await request(app).get(`/api/employees/${employee.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(employee);
        });

        it('debería "popular" el location_id para un empleado específico (200)', async () => {
            const location = { id: uuidv4(), name: 'Branch Office' };
            storage.locations.push(location);

            const employee = { id: uuidv4(), name: 'Branch Manager', location_id: location.id };
            storage.employees.push(employee);

            const res = await request(app).get(`/api/employees/${employee.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.location_id).toEqual(location);
        });

        it('debería retornar el location_id como string si no se encuentra (getById)', async () => {
            const staleLocationId = uuidv4();
            const employee = { id: uuidv4(), name: 'Old Worker', location_id: staleLocationId };
            storage.employees.push(employee);

            const res = await request(app).get(`/api/employees/${employee.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.location_id).toBe(staleLocationId);
        });

        it('debería retornar 404 si el empleado no se encuentra (404)', async () => {
            const randomId = uuidv4();
            const res = await request(app).get(`/api/employees/${randomId}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Employee not found');
        });

        it('debería retornar 400 si el ID tiene un formato inválido (400)', async () => {
            const res = await request(app).get('/api/employees/invalid-uuid-format');
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
        });
    });

    // --- Pruebas para PUT /api/employees/:id (updateEmployee) ---
    describe('PUT /api/employees/:id', () => {

        it('debería actualizar un empleado exitosamente (200)', async () => {
            const employee = { id: uuidv4(), name: 'Old Name', email: 'old@example.com' };
            storage.employees.push(employee);

            const updates = { name: 'New Name', email: 'new@example.com' };

            const res = await request(app)
                .put(`/api/employees/${employee.id}`)
                .send(updates);

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('New Name');
            expect(res.body.email).toBe('new@example.com');
            expect(storage.employees[0].name).toBe('New Name');
        });

        it('debería retornar 400 si el ID tiene un formato inválido (400)', async () => {
            const res = await request(app)
                .put('/api/employees/invalid-uuid')
                .send({ name: 'Update Fail' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
        });

        it('debería retornar 400 por validación fallida en actualización (400)', async () => {
            const employee = { id: uuidv4(), name: 'Test' };
            storage.employees.push(employee);

            const res = await request(app)
                .put(`/api/employees/${employee.id}`)
                .send({ email: 'bad-email-format' }); 
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Invalid email format');
        });

        it('debería retornar 404 si el empleado a actualizar no se encuentra (404)', async () => {
            const randomId = uuidv4();
            const res = await request(app)
                .put(`/api/employees/${randomId}`)
                .send({ name: 'No One' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Employee not found');
        });

        it('debería fallar al actualizar a un email que ya existe (400)', async () => {
            const employee1 = { id: uuidv4(), name: 'User One', email: 'one@example.com' };
            const employee2 = { id: uuidv4(), name: 'User Two', email: 'two@example.com' };
            storage.employees.push(employee1, employee2);

            const res = await request(app)
                .put(`/api/employees/${employee2.id}`)
                .send({ email: 'one@example.com' }); 

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email must be unique');
        });

        it('debería permitir actualizar un empleado sin cambiar su email (200)', async () => {
            const employee1 = { id: uuidv4(), name: 'User One', email: 'one@example.com' };
            storage.employees.push(employee1);

            const res = await request(app)
                .put(`/api/employees/${employee1.id}`)
                .send({ name: 'User One Updated', email: 'one@example.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('User One Updated');
        });
        it('debería actualizar solo el nombre sin tocar el email (200)', async () => {
            const employee = {
                id: uuidv4(),
                name: 'Original Name',
                email: 'original@example.com'
            };
            storage.employees.push(employee);

            const updates = { name: 'New Name Only' }; 

            const res = await request(app)
                .put(`/api/employees/${employee.id}`)
                .send(updates);

            expect(res.statusCode).toBe(200);

            expect(res.body.name).toBe('New Name Only');

            expect(res.body.email).toBe('original@example.com');
            expect(storage.employees[0].email).toBe('original@example.com');
        });
    });

    // --- Pruebas para DELETE /api/employees/:id (deleteEmployee) ---
    describe('DELETE /api/employees/:id', () => {

        it('debería eliminar un empleado exitosamente (200)', async () => {
            const employee = { id: uuidv4(), name: 'To Be Deleted' };
            storage.employees.push(employee);

            expect(storage.employees.length).toBe(1);

            const res = await request(app).delete(`/api/employees/${employee.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Employee deleted successfully');
            expect(storage.employees.length).toBe(0);
        });

        it('debería retornar 404 si el empleado a eliminar no se encuentra (404)', async () => {
            const randomId = uuidv4();
            const res = await request(app).delete(`/api/employees/${randomId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Employee not found');
        });

        it('debería retornar 400 si el ID tiene un formato inválido (400)', async () => {
            const res = await request(app).delete('/api/employees/invalid-uuid');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
        });
    });
});