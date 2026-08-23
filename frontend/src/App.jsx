import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import ReviewResult from './Components/ReviewResult';
import Privacy from './Components/Privacy';
import CreatorWidget from './Components/CreatorWidget';

const App = () => (
    <Router>
        <Routes>
            {/* Pinterest redirects back here with ?code=... after the user
                authorizes - Login.jsx handles both "show the connect button"
                and "finish the handshake" depending on whether ?code is present. */}
            <Route path="/" element={<Login />} />

            {/* Post-login home: past reviews + a button to make a new one */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Explicit, separate step - only reached by clicking "Generate" */}
            <Route path="/review/new" element={<ReviewResult />} />

            <Route path="/privacy-policy" element={<Privacy />} />
        </Routes>

        {/* Present on every page */}
        <CreatorWidget />
    </Router>
);

export default App;
