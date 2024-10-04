// AllEvents.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopBar from './TopBar'; 

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]); // State for locations
  const [selectedLocation, setSelectedLocation] = useState(''); // State for selected location

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/events'); // Fetch all events
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/locations'); // Fetch locations
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchEvents();
    fetchLocations();
  }, []);

  // Filter events based on selected location
  const filteredEvents = selectedLocation
    ? events.filter(event => event.location_id === parseInt(selectedLocation))
    : events;

  return (
    <div>
      <TopBar />
      <label htmlFor="location-select">See events at:  </label>
      <select
        id="location-select"
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
      >
        <option value="">All Locations</option>
        {locations.map(location => (
          <option key={location.id} value={location.id}>
            {location.address}
          </option>
        ))}
      </select>
      {/* Button to show all events */}
      <button onClick={() => setSelectedLocation('')} className="show-all-button">
        Show All Events
      </button>
      <ul>
        {filteredEvents.map(event => (
          <li key={event.id}>
            <h3>{event.title}</h3>
            <p>Date: {new Date(event.event_time).toLocaleString()}</p>
            <p>Host: {event.host}</p>
            <a href={event.link} target="_blank" rel="noopener noreferrer">More Info</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllEvents;

