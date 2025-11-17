# API Testing Commands with UUID Storage

This document contains curl commands to test all API endpoints with the new UUID-based simulated storage system. Run these commands in sequence to properly test the rental car API.

## Prerequisites
- Make sure the server is running on http://localhost:3000
- All IDs are now UUIDs instead of MongoDB ObjectIds
- Foreign keys only validate UUID format, not existence in other tables

## Testing Strategy
1. Create independent entities first (Location, Customer)
2. Create dependent entities (Employee, Car - need Location UUIDs)
3. Create Rentals (need Customer and Car UUIDs)
4. Test validations and error cases
5. Test updates and deletions

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

### Create Additional Locations for Testing
```bash
# Second location
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Airport Branch",
    "address": "Airport Terminal 1",
    "city": "New York",
    "state": "NY",
    "zip_code": "10002"
  }'

# Third location
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mall Location",
    "address": "456 Shopping Center",
    "city": "Brooklyn",
    "state": "NY",
    "zip_code": "11201"
  }'
```

### Get All Locations
```bash
curl -X GET http://localhost:3000/api/locations
```

### Get Location by ID
```bash
# Replace {locationId} with actual UUID from previous response
curl -X GET http://localhost:3000/api/locations/{locationId}
```

### Update Location
```bash
# Replace {locationId} with actual UUID
curl -X PUT http://localhost:3000/api/locations/{locationId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Office Updated",
    "address": "123 Main Street Suite 200",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001"
  }'
```

### Test Location Validation Errors
```bash
# Test missing required field
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "address": "No name provided"
  }'

# Test duplicate name
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Office",
    "address": "Different address"
  }'

# Test invalid UUID in GET
curl -X GET http://localhost:3000/api/locations/invalid-uuid
```

## 2. Customer Endpoints

### Create Customers
```bash
# First customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone_number": "5551234567",
    "driver_license_number": "D12345678"
  }'

# Second customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@email.com",
    "phone_number": "5559876543",
    "driver_license_number": "D87654321"
  }'

# Third customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson",
    "email": "bob.johnson@email.com",
    "phone_number": "5555555555",
    "driver_license_number": "D55555555"
  }'
```

### Get All Customers
```bash
curl -X GET http://localhost:3000/api/customers
```

### Get Customer by ID
```bash
# Replace {customerId} with actual UUID
curl -X GET http://localhost:3000/api/customers/{customerId}
```

### Update Customer
```bash
# Replace {customerId} with actual UUID
curl -X PUT http://localhost:3000/api/customers/{customerId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "email": "john.doe.updated@email.com",
    "phone_number": "5551234567",
    "driver_license_number": "D12345678"
  }'
```

### Test Customer Validation Errors
```bash
# Test name with numbers
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John123",
    "email": "test@email.com"
  }'

# Test phone with letters
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "test2@email.com",
    "phone_number": "555abc123"
  }'

# Test invalid email
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email"
  }'

# Test duplicate email
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Different Name",
    "email": "john.doe@email.com"
  }'
```

## 3. Employee Endpoints

### Create Employees
```bash
# Replace {locationId} with actual location UUID
# First employee
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Manager",
    "email": "alice.manager@company.com",
    "phone_number": "5551111111",
    "location_id": "{locationId}"
  }'

# Second employee (different location)
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Supervisor",
    "email": "bob.supervisor@company.com", 
    "phone_number": "5552222222",
    "location_id": "{differentLocationId}"
  }'

# Employee without location
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carol Remote",
    "email": "carol.remote@company.com",
    "phone_number": "5553333333"
  }'
```

### Get All Employees (with populated location data)
```bash
curl -X GET http://localhost:3000/api/employees
```

### Get Employee by ID
```bash
# Replace {employeeId} with actual UUID
curl -X GET http://localhost:3000/api/employees/{employeeId}
```

### Update Employee
```bash
# Replace {employeeId} and {locationId} with actual UUIDs
curl -X PUT http://localhost:3000/api/employees/{employeeId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Manager Updated",
    "email": "alice.updated@company.com",
    "phone_number": "5551111111",
    "location_id": "{locationId}"
  }'
```

### Test Employee Validation Errors
```bash
# Test invalid UUID for location_id
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Employee",
    "email": "test@company.com",
    "location_id": "invalid-uuid"
  }'

# Test duplicate email
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Different Name",
    "email": "alice.manager@company.com"
  }'

# Test non-existent but valid UUID (should pass validation)
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Employee",
    "email": "test2@company.com",
    "location_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## 4. Car Endpoints

### Create Cars
```bash
# Replace {locationId} with actual location UUID
# First car
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "license_plate": "ABC123",
    "rental_location_id": "{locationId}"
  }'

# Second car
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Honda",
    "model": "Civic",
    "year": 2022,
    "license_plate": "XYZ789",
    "rental_location_id": "{locationId}"
  }'

# Third car (different location)
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Ford",
    "model": "Focus",
    "year": 2024,
    "license_plate": "DEF456",
    "rental_location_id": "{differentLocationId}"
  }'

# Car without location
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Nissan",
    "model": "Sentra",
    "year": 2023,
    "license_plate": "GHI789"
  }'
```

### Get All Cars (with populated location data)
```bash
curl -X GET http://localhost:3000/api/cars
```

### Get Car by ID
```bash
# Replace {carId} with actual UUID
curl -X GET http://localhost:3000/api/cars/{carId}
```

### Update Car
```bash
# Replace {carId} and {locationId} with actual UUIDs
curl -X PUT http://localhost:3000/api/cars/{carId} \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry Hybrid",
    "year": 2023,
    "license_plate": "ABC123",
    "rental_location_id": "{locationId}"
  }'
```

### Test Car Validation Errors
```bash
# Test invalid year (too old)
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Ford",
    "model": "Model T",
    "year": 1800,
    "license_plate": "OLD123"
  }'

# Test invalid year (too future)
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Tesla",
    "model": "Future",
    "year": 2030,
    "license_plate": "FUT123"
  }'

# Test duplicate license plate
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Different Make",
    "model": "Different Model",
    "year": 2023,
    "license_plate": "ABC123"
  }'

# Test invalid UUID for rental_location_id
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "license_plate": "INVALID123",
    "rental_location_id": "invalid-uuid"
  }'
```

## 5. Rental Endpoints

### Create Rentals
```bash
# Replace {customerId} and {carId} with actual UUIDs
# First rental
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-20T10:00:00.000Z",
    "return_date": "2025-11-25T10:00:00.000Z",
    "total_cost": 250.00
  }'

# Second rental (different car, same customer)
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{differentCarId}",
    "rental_date": "2025-11-26T10:00:00.000Z",
    "return_date": "2025-11-30T10:00:00.000Z",
    "total_cost": 300.00
  }'

# Ongoing rental (no return date)
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{differentCustomerId}",
    "car_id": "{thirdCarId}",
    "rental_date": "2025-11-18T10:00:00.000Z",
    "total_cost": 150.00
  }'
```

### Test Date Conflict Validation
```bash
# Try to create overlapping rental (should fail with 409)
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-22T10:00:00.000Z",
    "return_date": "2025-11-27T10:00:00.000Z",
    "total_cost": 350.00
  }'

# Try to rent car that has ongoing rental (should fail)
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{thirdCarId}",
    "rental_date": "2025-11-19T10:00:00.000Z",
    "return_date": "2025-11-21T10:00:00.000Z",
    "total_cost": 200.00
  }'
```

### Get All Rentals (with populated customer and car data)
```bash
curl -X GET http://localhost:3000/api/rentals
```

### Get Rental by ID
```bash
# Replace {rentalId} with actual UUID
curl -X GET http://localhost:3000/api/rentals/{rentalId}
```

### Update Rental
```bash
# Replace {rentalId}, {customerId}, and {carId} with actual UUIDs
curl -X PUT http://localhost:3000/api/rentals/{rentalId} \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "2025-11-20T10:00:00.000Z",
    "return_date": "2025-11-24T10:00:00.000Z",
    "total_cost": 225.00
  }'
```

### Test Rental Validation Errors
```bash
# Test invalid customer UUID
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "invalid-uuid",
    "car_id": "{carId}",
    "rental_date": "2025-12-01T10:00:00.000Z"
  }'

# Test invalid car UUID
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "invalid-uuid",
    "rental_date": "2025-12-01T10:00:00.000Z"
  }'

# Test non-existent but valid UUIDs (should pass validation)
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "550e8400-e29b-41d4-a716-446655440001",
    "car_id": "550e8400-e29b-41d4-a716-446655440002",
    "rental_date": "2025-12-01T10:00:00.000Z",
    "return_date": "2025-12-05T10:00:00.000Z",
    "total_cost": 400.00
  }'

# Test invalid date format
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customerId}",
    "car_id": "{carId}",
    "rental_date": "invalid-date"
  }'
```

## 6. Delete Operations

### Delete Rentals First (to avoid dependency issues in testing)
```bash
# Replace {rentalId} with actual UUID
curl -X DELETE http://localhost:3000/api/rentals/{rentalId}
```

### Delete Cars
```bash
# Replace {carId} with actual UUID
curl -X DELETE http://localhost:3000/api/cars/{carId}
```

### Delete Employees
```bash
# Replace {employeeId} with actual UUID
curl -X DELETE http://localhost:3000/api/employees/{employeeId}
```

### Delete Customers
```bash
# Replace {customerId} with actual UUID
curl -X DELETE http://localhost:3000/api/customers/{customerId}
```

### Delete Locations
```bash
# Replace {locationId} with actual UUID
curl -X DELETE http://localhost:3000/api/locations/{locationId}
```

### Test Delete with Invalid UUIDs
```bash
# Test delete with invalid UUID
curl -X DELETE http://localhost:3000/api/locations/invalid-uuid

# Test delete with non-existent but valid UUID
curl -X DELETE http://localhost:3000/api/locations/550e8400-e29b-41d4-a716-446655440999
```

## Quick Test Script

Here's a bash script to run a complete test sequence:

```bash
#!/bin/bash

echo "Starting API Test Sequence..."

# Create locations and capture IDs
echo "Creating locations..."
LOCATION1=$(curl -s -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Location 1", "city": "Test City"}' | jq -r '.id')

# Create customers and capture IDs
echo "Creating customers..."
CUSTOMER1=$(curl -s -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Customer", "email": "test@example.com"}' | jq -r '.id')

# Create cars and capture IDs
echo "Creating cars..."
CAR1=$(curl -s -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{"make": "Test Make", "model": "Test Model", "year": 2023, "license_plate": "TEST123", "rental_location_id": "'$LOCATION1'"}' | jq -r '.id')

# Create rental
echo "Creating rental..."
RENTAL1=$(curl -s -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "'$CUSTOMER1'", "car_id": "'$CAR1'", "rental_date": "2025-11-20T10:00:00.000Z", "return_date": "2025-11-25T10:00:00.000Z", "total_cost": 250}' | jq -r '.id')

echo "Created:"
echo "Location ID: $LOCATION1"
echo "Customer ID: $CUSTOMER1" 
echo "Car ID: $CAR1"
echo "Rental ID: $RENTAL1"

echo "Testing complete! Use these IDs for manual testing."
```

## Key Differences from MongoDB Version

1. **UUIDs instead of ObjectIds**: All IDs are now UUID v4 format
2. **Foreign Key Validation**: Only validates UUID format, doesn't check existence
3. **No Population**: Related data is manually populated in responses
4. **In-Memory Storage**: Data is lost when server restarts
5. **Same Business Logic**: All original validations and business rules maintained

## Expected Error Codes

- **400**: Validation errors, invalid UUID format, duplicate unique fields
- **404**: Entity not found
- **409**: Date conflict in rentals
- **500**: Server errors

Remember to replace all placeholder UUIDs (`{locationId}`, `{customerId}`, etc.) with actual UUIDs returned from the API responses!