import { storage, generateUUID, isValidUUID, findById, findIndexById } from '../storage/data.js';
import { validateCustomer } from '../utils/validation.js';

export const getCustomers = async (req, res) => {
  res.json(storage.customers);
};

export const getCustomerById = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const customer = findById('customers', req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
};

export const createCustomer = async (req, res) => {
  const validationErrors = validateCustomer(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: validationErrors.join(', ') });
  }
  
  // Check unique email
  const existingCustomer = storage.customers.find(customer => customer.email === req.body.email);
  if (existingCustomer) {
    return res.status(400).json({ message: 'Email must be unique' });
  }
  
  const customer = {
    id: generateUUID(),
    ...req.body
  };
  
  storage.customers.push(customer);
  res.status(201).json(customer);
};

export const updateCustomer = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const validationErrors = validateCustomer(req.body, true);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: validationErrors.join(', ') });
  }
  
  const index = findIndexById('customers', req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  // Check unique email if being updated
  if (req.body.email) {
    const existingCustomer = storage.customers.find(customer => customer.email === req.body.email && customer.id !== req.params.id);
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email must be unique' });
    }
  }
  
  storage.customers[index] = { ...storage.customers[index], ...req.body };
  res.json(storage.customers[index]);
};

export const deleteCustomer = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const index = findIndexById('customers', req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  storage.customers.splice(index, 1);
  res.json({ message: 'Customer deleted successfully' });
};
