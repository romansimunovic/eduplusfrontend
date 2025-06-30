import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Radionice from './pages/Radionice';
import Polaznici from './pages/Polaznici';
import Prisustva from './pages/Prisustva';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Radionice</Link></li>
          <li><Link to="/polaznici">Polaznici</Link></li>
          <li><Link to="/prisustva">Prisustva</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Radionice />} />
        <Route path="/polaznici" element={<Polaznici />} />
        <Route path="/prisustva" element={<Prisustva />} />
      </Routes>
    </Router>
  );
}

export default App;
