import { useState, useEffect } from 'react';
import axios from 'axios';
import CarCard from '../components/CarCard';

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    try {
      const res = await axios.get('/api/cars');
      setCars(res.data);
    } catch (err) {
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await axios.delete(`/api/cars/${id}`);
        setCars(cars.filter(car => car._id !== id));
      } catch (err) {
        console.error('Error deleting car:', err);
      }
    }
  };

  if (loading) return <div className="page-title">Loading the vault...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your Collection</h1>
      </div>
      
      {cars.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No cars found. Start by adding one!</p>
      ) : (
        <div className="car-grid">
          {cars.map(car => (
            <CarCard key={car._id} car={car} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
