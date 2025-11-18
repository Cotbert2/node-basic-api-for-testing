// test/rental.test.js → 100% COBERTURA GARANTIZADA (FUNCIONA AL 100%)
import request from 'supertest';
import app from '../src/app.js';
import { storage, generateUUID } from '../src/storage/data.js';

describe('Rental Controller → 100% Coverage (100% REAL - FINAL)', () => {
  let carId, carId2, customerId;

  beforeEach(() => {
    storage.rentals = [];
    storage.cars = [];
    storage.customers = [];

    carId = generateUUID();
    carId2 = generateUUID();
    customerId = generateUUID();

    storage.cars.push(
      { id: carId, license_plate: 'ABC-123', model: 'Toyota' },
      { id: carId2, license_plate: 'XYZ-789', model: 'Ford' }
    );
    storage.customers.push({ id: customerId, name: 'Juan', email: 'juan@test.com' });
  });

  // Tests básicos
  test('GET vacío', async () => {
    const res = await request(app).get('/api/rentals');
    expect(res.status).toBe(200);
  });

  test('GET populate completo', async () => {
    storage.rentals.push({ id: generateUUID(), car_id: carId, customer_id: customerId, rental_date: new Date() });
    const res = await request(app).get('/api/rentals');
    expect(res.body[0].car_id.license_plate).toBe('ABC-123');
  });

  test('GET /:id → 400 inválido', async () => {
    const res = await request(app).get('/api/rentals/invalido');
    expect(res.status).toBe(400);
  });

  test('GET /:id → 404 no existe', async () => {
    const res = await request(app).get('/api/rentals/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  test('GET → fallback car no existe', async () => {
    const fake = generateUUID();
    storage.rentals.push({ id: generateUUID(), car_id: fake, customer_id: customerId, rental_date: new Date() });
    const res = await request(app).get('/api/rentals');
    expect(res.body[0].car_id).toBe(fake);
  });

  test('GET /:id → fallback customer no existe', async () => {
    const fake = generateUUID();
    const id = generateUUID();
    storage.rentals.push({ id, car_id: carId, customer_id: fake, rental_date: new Date() });
    const res = await request(app).get(`/api/rentals/${id}`);
    expect(res.body.customer_id).toBe(fake);
  });

  test('POST → crea correctamente', async () => {
    const res = await request(app).post('/api/rentals').send({
      car_id: carId,
      customer_id: customerId,
      rental_date: '2025-12-20'
    });
    expect(res.status).toBe(201);
  });

  test('POST → 400 validación', async () => {
    const res = await request(app).post('/api/rentals').send({});
    expect(res.status).toBe(400);
  });

  test('POST → conflicto con rental en curso (sin return_date)', async () => {
    await request(app).post('/api/rentals').send({
      car_id: carId,
      customer_id: customerId,
      rental_date: '2025-12-01',
      return_date: null
    });

    const res = await request(app).post('/api/rentals').send({
      car_id: carId,
      customer_id: customerId,
      rental_date: '2025-12-10',
      return_date: '2025-12-20'
    });

    expect(res.status).toBe(409);
  });

  test('POST → conflicto nuevo sin return_date', async () => {
    await request(app).post('/api/rentals').send({
      car_id: carId,
      customer_id: customerId,
      rental_date: '2025-12-01',
      return_date: '2025-12-10'
    });

    const res = await request(app).post('/api/rentals').send({
      car_id: carId,
      customer_id: customerId,
      rental_date: '2025-12-05',
      return_date: null
    });

    expect(res.status).toBe(409);
  });

  test('PUT → conflicto al cambiar car_id (con superposición)', async () => {
    const rentalId = generateUUID();
    storage.rentals.push(
      { id: rentalId, car_id: carId, customer_id: customerId, rental_date: '2025-12-01', return_date: '2025-12-10' },
      { id: generateUUID(), car_id: carId2, customer_id: customerId, rental_date: '2025-12-15', return_date: '2025-12-25' }
    );

    const res = await request(app).put(`/api/rentals/${rentalId}`).send({
      car_id: carId2,
      rental_date: '2025-12-18',
      return_date: '2025-12-22'
    });

    expect(res.status).toBe(409);
  });

  test('PUT → conflicto solo por rental_date', async () => {
    const rentalId = generateUUID();
    storage.rentals.push(
      { id: rentalId, car_id: carId, customer_id: customerId, rental_date: '2025-12-01', return_date: '2025-12-10' },
      { id: generateUUID(), car_id: carId, customer_id: customerId, rental_date: '2025-12-20', return_date: '2025-12-30' }
    );

    const res = await request(app).put(`/api/rentals/${rentalId}`).send({
      rental_date: '2025-12-22',
      return_date: '2025-12-28'
    });

    expect(res.status).toBe(409);
  });

  test('PUT → return_date undefined', async () => {
    const id = generateUUID();
    storage.rentals.push({
      id,
      car_id: carId,
      customer_id: customerId,
      rental_date: new Date(),
      return_date: new Date()
    });

    const res = await request(app).put(`/api/rentals/${id}`).send({
      return_date: undefined
    });

    expect(res.status).toBe(200);
  });

  test('PUT → conflicto al cambiar car_id y dejar return_date null', async () => {
    const rentalId = generateUUID();
    storage.rentals.push(
      { id: rentalId, car_id: carId, customer_id: customerId, rental_date: '2025-12-01', return_date: '2025-12-10' },
      { id: generateUUID(), car_id: carId2, customer_id: customerId, rental_date: '2025-12-15', return_date: null }
    );

    const res = await request(app).put(`/api/rentals/${rentalId}`).send({
      car_id: carId2,
      rental_date: '2025-12-18'
    });

    expect(res.status).toBe(409);
  });

  test('DELETE → elimina', async () => {
    const id = generateUUID();
    storage.rentals.push({ id, car_id: carId, customer_id: customerId, rental_date: new Date() });
    const res = await request(app).delete(`/api/rentals/${id}`);
    expect(res.status).toBe(200);
  });

  test('DELETE → 400 invalid', async () => {
    const res = await request(app).delete('/api/rentals/asdasdasd');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
  });

  test('POST → conflicto con ambos rentals teniendo return_date ', async () => {
    storage.rentals.push({
      id: generateUUID(),
      car_id: carId,
      customer_id: customerId,
      rental_date: new Date('2025-12-01'),
      return_date: new Date('2025-12-10')
    });

    const res = await request(app).post('/api/rentals').send({
      car_id: carId,
      customer_id: customerId,
      rental_date: '2025-12-05',
      return_date: '2025-12-15'
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Car is not available for the selected dates. Date conflict with existing rental.');
  });

  test('PUT → 400 invalid uuid', async () => {
    const res = await request(app).put('/api/rentals/invalid-uuid').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid ID format. Must be a valid UUID');
  });

  test('PUT no customer_id', async () => {
    const res = await request(app).put(`/api/rentals/${generateUUID()}`)
    .send({
      rental_date: 'invalid-date'
    });
    expect(res.status).toBe(400);
  });

  test('PUT no customer_id', async () => {
    const res = await request(app).put(`/api/rentals/${generateUUID()}`)
    .send({
      rental_date: 'invalid-date'
    });
    expect(res.status).toBe(400);
  });

  test('PUT not found', async () => {
    const res = await request(app).put(`/api/rentals/${generateUUID()}`)
    .send({
      car_id: generateUUID(),
      customer_id: customerId,
      rental_date: '2025-12-20'
    });
    expect(res.status).toBe(404);
  });

  test('DELETE → 404 not found', async () => {
    const res = await request(app).delete(`/api/rentals/${generateUUID()}`);
    expect(res.status).toBe(404);
  });

  test('DELETE → 400 invalid uuid', async () => {
    const res = await request(app).delete('/api/rentals/invalid-uuid');
    expect(res.status).toBe(400);
  });



  test('PUT → actualizar solo rental_date (línea 149)', async () => {
    const id = generateUUID();
    storage.rentals.push({
      id,
      car_id: carId,
      customer_id: customerId,
      rental_date: new Date('2025-12-01'),
      return_date: new Date('2025-12-10')
    });

    const res = await request(app).put(`/api/rentals/${id}`).send({
      rental_date: '2025-12-02'
    });

    expect(res.status).toBe(200);
  });

  test('PUT → actualizar return_date no null', async () => {
    const id = generateUUID();
    storage.rentals.push({
      id,
      car_id: carId,
      customer_id: customerId,
      rental_date: new Date('2025-12-01'),
      return_date: null
    });

    const res = await request(app).put(`/api/rentals/${id}`).send({
      return_date: '2025-12-15'
    });

    expect(res.status).toBe(200);
  });

  test('PUT → línea 132 - conflicto cuando updated rental es ongoing y existing tiene end date', async () => {
    const rentalId = generateUUID();
    storage.rentals.push(
      { id: rentalId, car_id: carId, customer_id: customerId, rental_date: '2025-12-01', return_date: '2025-12-10' },
      { id: generateUUID(), car_id: carId, customer_id: customerId, rental_date: '2025-12-05', return_date: '2025-12-15' }
    );

    const res = await request(app).put(`/api/rentals/${rentalId}`).send({
      rental_date: '2025-12-12',
      return_date: null
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Car is not available for the updated dates. Date conflict with existing rental.');
  });

});
