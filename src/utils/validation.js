import { isValidUUID } from '../storage/data.js';

// Validation functions for each entity type
export const validateLocation = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && (!data.name || typeof data.name !== 'string')) {
    errors.push('Name is required and must be a string');
  }

  if (data.address && typeof data.address !== 'string') {
    errors.push('Address must be a string');
  }

  if (data.city && typeof data.city !== 'string') {
    errors.push('City must be a string');
  }

  if (data.state && typeof data.state !== 'string') {
    errors.push('State must be a string');
  }

  if (data.zip_code && typeof data.zip_code !== 'string') {
    errors.push('Zip code must be a string');
  }

  return errors;
};

export const validateCustomer = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && (!data.name || typeof data.name !== 'string')) {
    errors.push('Name is required and must be a string');
  }

  if (data.name && /\d/.test(data.name)) {
    errors.push('The name cannot contain numbers');
  }

  if (!isUpdate && (!data.email || typeof data.email !== 'string')) {
    errors.push('Email is required and must be a string');
  }

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }
  }

  if (data.phone_number) {
    if (typeof data.phone_number !== 'string') {
      errors.push('Phone number must be a string');
    } else if (/[a-zA-Z]/.test(data.phone_number)) {
      errors.push('The phone number cannot contain letters');
    }
  }

  if (data.driver_license_number && typeof data.driver_license_number !== 'string') {
    errors.push('Driver license number must be a string');
  }

  return errors;
};

export const validateEmployee = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && (!data.name || typeof data.name !== 'string')) {
    errors.push('Name is required and must be a string');
  }

  if (data.email) {
    if (typeof data.email !== 'string') {
      errors.push('Email must be a string');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }
  }

  if (data.phone_number && typeof data.phone_number !== 'string') {
    errors.push('Phone number must be a string');
  }

  if (data.location_id && !isValidUUID(data.location_id)) {
    errors.push('Location ID must be a valid UUID');
  }

  return errors;
};

export const validateCar = (data, isUpdate = false) => {
  const errors = [];
  const currentYear = new Date().getFullYear();

  if (!isUpdate && (!data.make || typeof data.make !== 'string')) {
    errors.push('Make is required and must be a string');
  }

  if (!isUpdate && (!data.model || typeof data.model !== 'string')) {
    errors.push('Model is required and must be a string');
  }

  if (!isUpdate && (!data.year || typeof data.year !== 'number')) {
    errors.push('Year is required and must be a number');
  } else if (data.year) {
    if (data.year < 1886) {
      errors.push('Year must be at least 1886 (first car invented)');
    } else if (data.year > currentYear + 1) {
      errors.push('Year cannot be more than 1 year in the future');
    }
  }

  if (!isUpdate && (!data.license_plate || typeof data.license_plate !== 'string')) {
    errors.push('License plate is required and must be a string');
  }

  if (data.rental_location_id && !isValidUUID(data.rental_location_id)) {
    errors.push('Rental location ID must be a valid UUID');
  }

  return errors;
};

export const validateRental = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && (!data.customer_id || !isValidUUID(data.customer_id))) {
    errors.push('Customer ID is required and must be a valid UUID');
  }

  if (!isUpdate && (!data.car_id || !isValidUUID(data.car_id))) {
    errors.push('Car ID is required and must be a valid UUID');
  }

  if (!isUpdate && (!data.rental_date)) {
    errors.push('Rental date is required');
  }

  if (data.rental_date && isNaN(new Date(data.rental_date))) {
    errors.push('Rental date must be a valid date');
  }

  if (data.return_date && isNaN(new Date(data.return_date))) {
    errors.push('Return date must be a valid date');
  }

  if (data.total_cost && typeof data.total_cost !== 'number') {
    errors.push('Total cost must be a number');
  }

  return errors;
};