import Employee from '../models/employee.model.js';

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('location_id');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('location_id');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const saved = await employee.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'empl deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
