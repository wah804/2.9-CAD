import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ManageCar() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: ''
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      const fetchCar = async () => {
        try {
          const res = await axios.get('/api/cars');
          const car = res.data.find(c => c._id === id);
          if (car) {
            setFormData({
              make: car.make,
              model: car.model,
              year: car.year
            });
          }
        } catch (err) {
          console.error('Error fetching car:', err);
        }
      };
      fetchCar();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`/api/cars/${id}`, formData);
      } else {
        await axios.post('/api/cars', formData);
      }
      navigate('/');
    } catch (err) {
      console.error('Error saving car:', err);
      alert('Failed to save car. Please try again.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Car Details' : 'Add New Car'}</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="make">Make</label>
            <input
              type="text"
              id="make"
              name="make"
              className="form-control"
              value={formData.make}
              onChange={handleChange}
              placeholder="e.g. Porsche"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              className="form-control"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. 911 GT3"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="year">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              className="form-control"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 2024"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-danger" style={{flex: 0.5}} onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-submit">
              {isEdit ? 'Update Car' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
