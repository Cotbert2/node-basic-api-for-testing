# API Testing Commands

This document contains curl commands to test all API endpoints in the correct order. Run these commands in sequence to properly test the rental car API.

## Prerequisites
Make sure the server is running on http://localhost:3000

## 1. Location Endpoints

### Create a Location
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Office",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001"
  }'
```

### Get All Locations
```bash
curl -X GET http://localhost:3000/api/locations
```

### Get Location by ID (replace {locationId} with actual ID)
```bash
curl -X GET http://localhost:3000/api/locations/{locationId}
```

### Update Location (replace {locationId} with actual ID)
```bash
curl -X PUT http://localhost:3000/api/locations/{locationId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Office Updated",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001"
  }'
```

## 2. Customer Endpoints

### Create a Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone_number": "+593978902112",
    "driver_license_number": "D12345678"
  }'
```

### Get All Customers
```bash
curl -X GET http://localhost:3000/api/customers
```

### Get Customer by ID (replace {customerId} with actual ID)
```bash
curl -X GET http://localhost:3000/api/customers/{customerId}
```

### Update Customer (replace {customerId} with actual ID)
```bash
curl -X PUT http://localhost:3000/api/customers/{customerId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "email": "john.doe.updated@email.com",
    "phone_number": "+593",
    "driver_license_number": "D12345678"
  }'
```

## 3. Employee Endpoints

### Create an Employee (replace {locationId} with actual location ID)
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "phone_number": "+1-555-0456",
    "location_id": "{locationId}"
  }'
```

### Get All Employees
```bash
curl -X GET http://localhost:3000/api/employees
```

### Get Employee by ID (replace {employeeId} with actual ID)
```bash
curl -X GET http://localhost:3000/api/employees/{employeeId}
```

### Update Employee (replace {employeeId} and {locationId} with actual IDs)
```bash
curl -X PUT http://localhost:3000/api/employees/{employeeId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith Updated",
    "email": "jane.smith.updated@company.com",
    "phone_number": "+593978902113",
    "location_id": "69136ce00e5459913162efeb"
  }'
```

## 4. Car Endpoints

### Create a Car (replace {locationId} with actual location ID)
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "license_plate": "ABC123",
    "rental_location_id": "{locationId}"
  }'
```

### Create Another Car for Testing
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Honda",
    "model": "Civic",
    "year": 2022,
    "license_plate": "XYZ789",
    "rental_location_id": "{locationId}"
  }'
```

### Get All Cars
```bash
curl -X GET http://localhost:3000/api/cars
```

### Get Car by ID (replace {carId} with actual ID)
```bash
curl -X GET http://localhost:3000/api/cars/{carId}
```

### Update Car (replace {carId} and {locationId} with actual IDs)
```bash
curl -X PUT http://localhost:3000/api/cars/{carId} \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry Updated",
    "year": 2023,
    "license_plate": "ABC123",
    "rental_location_id": "{locationId}"
  }'
```

## 5. Rental Endpoints

### Create a Rental (replace {customerId} and {carId} with actual IDs)
```bash
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-15T10:00:00.000Z",
    "return_date": "2025-11-20T10:00:00.000Z",
    "total_cost": 250.00
  }'
```

### Test Date Conflict - Try to Create Overlapping Rental (should fail)
```bash
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-17T10:00:00.000Z",
    "return_date": "2025-11-22T10:00:00.000Z",
    "total_cost": 300.00
  }'
```

### Create Valid Non-Overlapping Rental
```bash
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-25T10:00:00.000Z",
    "return_date": "2025-11-30T10:00:00.000Z",
    "total_cost": 300.00
  }'
```

### Get All Rentals
```bash
curl -X GET http://localhost:3000/api/rentals
```

### Get Rental by ID (replace {rentalId} with actual ID)
```bash
curl -X GET http://localhost:3000/api/rentals/{rentalId}
```

### Update Rental (replace {rentalId}, {customerId}, and {carId} with actual IDs)
```bash
curl -X PUT http://localhost:3000/api/rentals/{rentalId} \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-15T10:00:00.000Z",
    "return_date": "2025-11-19T10:00:00.000Z",
    "total_cost": 225.00
  }'
```

### Test Update Date Conflict - Try to Update with Overlapping Dates (should fail)
```bash
curl -X PUT http://localhost:3000/api/rentals/{rentalId} \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-26T10:00:00.000Z",
    "return_date": "2025-11-29T10:00:00.000Z",
    "total_cost": 200.00
  }'
```

## 6. Delete Operations (Test in reverse order)

### Delete Rental (replace {rentalId} with actual ID)
```bash
curl -X DELETE http://localhost:3000/api/rentals/{rentalId}
```

### Delete Car (replace {carId} with actual ID)
```bash
curl -X DELETE http://localhost:3000/api/cars/{carId}
```

### Delete Employee (replace {employeeId} with actual ID)
```bash
curl -X DELETE http://localhost:3000/api/employees/{employeeId}
```

### Delete Customer (replace {customerId} with actual ID)
```bash
curl -X DELETE http://localhost:3000/api/customers/{customerId}
```

### Delete Location (replace {locationId} with actual ID)
```bash
curl -X DELETE http://localhost:3000/api/locations/{locationId}
```

## Testing Order
1. First create locations (needed for cars and employees)
2. Create customers (independent)
3. Create employees (needs location)
4. Create cars (needs location)
5. Create rentals (needs customer and car)
6. Test date conflict validation
7. Test updates
8. Test deletions in reverse order

## Notes
- Replace all placeholder IDs (`{locationId}`, `{customerId}`, etc.) with actual IDs returned from the API
- The rental date validation prevents overlapping rentals for the same car
- All timestamps are in ISO 8601 format
- Error responses will include appropriate HTTP status codes and error messages