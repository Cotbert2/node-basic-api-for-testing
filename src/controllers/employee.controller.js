import { storage, generateUUID, isValidUUID, findById, findIndexById } from '../storage/data.js';
import { validateEmployee } from '../utils/validation.js';

export const getEmployees = async (req, res) => {
  try {
    // Populate location data for each employee
    const employeesWithLocation = storage.employees.map(employee => {
      if (employee.location_id) {
        const location = findById('locations', employee.location_id);
        return { ...employee, location_id: location || employee.location_id };
      }
      return employee;
    });
    res.json(employeesWithLocation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
    }
    
    const employee = findById('employees', req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    // Populate location data if exists
    if (employee.location_id) {
      const location = findById('locations', employee.location_id);
      employee.location_id = location || employee.location_id;
    }
    
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const validationErrors = validateEmployee(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    
    // Check unique email if provided
    if (req.body.email) {
      const existingEmployee = storage.employees.find(emp => emp.email === req.body.email);
      if (existingEmployee) {
        return res.status(400).json({ message: 'Email must be unique' });
      }
    }
    
    const employee = {
      id: generateUUID(),
      ...req.body
    };
    
    storage.employees.push(employee);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
    }
    
    const validationErrors = validateEmployee(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    
    const index = findIndexById('employees', req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check unique email if being updated
    if (req.body.email) {
      const existingEmployee = storage.employees.find(emp => emp.email === req.body.email && emp.id !== req.params.id);
      if (existingEmployee) {
        return res.status(400).json({ message: 'Email must be unique' });
      }
    }
    
    storage.employees[index] = { ...storage.employees[index], ...req.body };
    res.json(storage.employees[index]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
    }
    
    const index = findIndexById('employees', req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    storage.employees.splice(index, 1);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
