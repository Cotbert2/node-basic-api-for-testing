import Location from '../models/location.model.js';

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const location = new Location(req.body);
    const saved = await location.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ubicación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
