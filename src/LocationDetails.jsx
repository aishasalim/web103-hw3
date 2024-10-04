// LocationDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import TopBar from './TopBar'; 

const LocationDetails = () => {
  const { id } = useParams(); // Get the location ID from the URL
  const [events, setEvents] = useState([]);
  const [countdowns, setCountdowns] = useState([]); // State to store countdowns
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/locations/${id}/events`);
        setEvents(response.data);
        // Initialize countdowns when events are fetched
        setCountdowns(response.data.map(event => ({
          id: event.id,
          remaining: getTimeRemaining(event.event_time) // Calculate initial countdown
        })));
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [id]);

  const getTimeRemaining = (eventTime) => {
    const eventDate = new Date(eventTime);
    const now = new Date();
    const difference = eventDate - now;

    if (difference <= 0) return 'Event has started';

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prevCountdowns => 
        prevCountdowns.map(countdown => ({
          ...countdown,
          remaining: getTimeRemaining(events.find(event => event.id === countdown.id)?.event_time) // Update countdown
        }))
      );
    }, 1000);

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [events]); // Only re-run this effect if events change

  return (
    <div>
      <TopBar />
      <button onClick={() => navigate(-1)} className="back-button">Back</button> {/* Back button */}
      <h2>Events at Location {id}</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <h3>{event.title}</h3>
            <p>Date: {new Date(event.event_time).toLocaleString()}</p>
            <p>Host: {event.host}</p>
            <p>Countdown: {countdowns.find(c => c.id === event.id)?.remaining}</p> {/* Display countdown */}
            <a href={event.link} target="_blank" rel="noopener noreferrer">More Info</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LocationDetails;
