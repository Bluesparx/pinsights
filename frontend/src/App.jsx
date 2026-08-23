import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import ReviewResult from './Components/ReviewResult';
import Privacy from './Components/Privacy';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/review/new" element={<ReviewResult />} />

            <Route path="/privacy-policy" element={<Privacy />} />
        </Routes>
    </Router>
);

export default App;
