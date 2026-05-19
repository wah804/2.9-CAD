import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ManageCar from './pages/ManageCar';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<ManageCar />} />
          <Route path="/edit/:id" element={<ManageCar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
