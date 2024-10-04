import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Ensure this is imported
import App from './App.jsx';
import LocationDetails from './LocationDetails.jsx'; // Existing component
import AllEvents from './AllEvents.jsx'; // Import the new component
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Main page with locations */}
        <Route path="/location/:id" element={<LocationDetails />} /> {/* Details for specific location */}
        <Route path="/events" element={<AllEvents />} /> {/* New route for all events */}
      </Routes>
    </Router>
  </StrictMode>,
);
