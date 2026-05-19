const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// GET all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().sort({ created_at: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new car
router.post('/', async (req, res) => {
  const car = new Car({
    make: req.body.make,
    model: req.body.model,
    year: req.body.year
  });

  try {
    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT/PATCH a car
router.put('/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year
      },
      { new: true } // Returns the updated document
    );
    if (!updatedCar) return res.status(404).json({ message: 'Car not found' });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a car
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Deleted Car' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
