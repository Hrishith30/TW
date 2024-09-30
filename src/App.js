import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Time from './components/Time';
import Weather from './components/Weather';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Time />} />
        <Route path="/weather" element={<Weather />} />
      </Routes>
    </Router>
  );
}

export default App;