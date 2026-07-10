import Specialization from '../models/Specialization.js';

export const getSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find({});
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSpecialization = async (req, res) => {
  try {
    const { name } = req.body;
    const spec = await Specialization.create({ name });
    res.status(201).json(spec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSpecialization = async (req, res) => {
  try {
    const spec = await Specialization.findById(req.params.id);
    if (spec) {
      await spec.deleteOne();
      res.json({ message: 'Specialization removed' });
    } else {
      res.status(404).json({ message: 'Specialization not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
