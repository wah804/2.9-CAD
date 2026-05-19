const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Car', carSchema);
