import { storage, generateUUID, isValidUUID, findById, findIndexById } from '../storage/data.js';
import { validateLocation } from '../utils/validation.js';

export const getLocations = async (req, res) => {
  res.json(storage.locations);
};

export const getLocationById = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const location = findById('locations', req.params.id);
  if (!location) return res.status(404).json({ message: 'Location not found' });
  res.json(location);
};

export const createLocation = async (req, res) => {
  const validationErrors = validateLocation(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: validationErrors.join(', ') });
  }
  
  // Check unique name
  const existingLocation = storage.locations.find(loc => loc.name === req.body.name);
  if (existingLocation) {
    return res.status(400).json({ message: 'Location name must be unique' });
  }
  
  const location = {
    id: generateUUID(),
    ...req.body
  };
  
  storage.locations.push(location);
  res.status(201).json(location);
};

export const updateLocation = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const validationErrors = validateLocation(req.body, true);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: validationErrors.join(', ') });
  }
  
  const index = findIndexById('locations', req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Location not found' });
  }
  
  // Check unique name if being updated
  if (req.body.name) {
    const existingLocation = storage.locations.find(loc => loc.name === req.body.name && loc.id !== req.params.id);
    if (existingLocation) {
      return res.status(400).json({ message: 'Location name must be unique' });
    }
  }
  
  storage.locations[index] = { ...storage.locations[index], ...req.body };
  res.json(storage.locations[index]);
};

export const deleteLocation = async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format. Must be a valid UUID' });
  }
  
  const index = findIndexById('locations', req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Location not found' });
  }
  
  storage.locations.splice(index, 1);
  res.json({ message: 'Location deleted successfully' });
};
