import Customer from '../models/customer.model.js';

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    // validacion para que el nombre no contenga numeros
    if (/\d/.test(req.body.name)) {
      return res.status(400).json({ message: 'The name cannot contain numbers' });
    }

    // validacion para numero de celular sin letras
    if (/[a-zA-Z]/.test(req.body.phone_number)) {
      return res.status(400).json({ message: 'The phone number cannot contain letters' });
    }

    // validacion para formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format or empty email' });
    }
    
    const customer = new Customer(req.body);
    const saved = await customer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    // validacion para que el nombre no contenga numeros
    if (/\d/.test(req.body.name)) {
      return res.status(400).json({ message: 'The name cannot contain numbers' });
    }

    // validacion para numero de celular sin letras
    if (/[a-zA-Z]/.test(req.body.phone_number)) {
      return res.status(400).json({ message: 'The phone number cannot contain letters' });
    }

    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
