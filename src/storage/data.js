import { v4 as uuidv4, validate as validateUUID } from 'uuid';

// Simulated storage using arrays for each entity
export const storage = {
  locations: [],
  customers: [],
  employees: [],
  cars: [],
  rentals: []
};

// Helper function to generate UUID v4
export const generateUUID = () => {
  return uuidv4();
};

// Helper function to validate UUID format
export const isValidUUID = (id) => {
  return validateUUID(id);
};

// Helper function to find entity by ID in any collection
export const findById = (collection, id) => {
  return storage[collection].find(item => item.id === id);
};

// Helper function to find index by ID in any collection
export const findIndexById = (collection, id) => {
  return storage[collection].findIndex(item => item.id === id);
};