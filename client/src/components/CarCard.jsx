import { Link } from 'react-router-dom';

export default function CarCard({ car, onDelete }) {
  return (
    <div className="car-card">
      <h3 className="car-title">{car.make} {car.model}</h3>
      <p className="car-year">Year: {car.year}</p>
      
      <div className="car-actions">
        <Link to={`/edit/${car._id}`} className="btn btn-primary">Edit</Link>
        <button onClick={() => onDelete(car._id)} className="btn btn-danger">Delete</button>
      </div>
    </div>
  );
}
