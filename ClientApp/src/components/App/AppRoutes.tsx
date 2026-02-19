import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from 'forms/Home';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};
