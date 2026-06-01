const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const auth = require('../middleware/auth');

// GET all cars for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const cars = await Car.find({ userId: req.user.id }).sort({ created_at: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new car for the logged-in user
router.post('/', auth, async (req, res) => {
  const car = new Car({
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    userId: req.user.id
  });

  try {
    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT/PATCH a car
router.put('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    // Check ownership
    if (car.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this car' });
    }

    car.make = req.body.make !== undefined ? req.body.make : car.make;
    car.model = req.body.model !== undefined ? req.body.model : car.model;
    car.year = req.body.year !== undefined ? req.body.year : car.year;

    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a car
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    // Check ownership
    if (car.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this car' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted Car' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
