import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const TopBar = () => {
  return (
    <div className="topbar">
      <Link to="/" className="logo">Home</Link> 
      <div className="nav-buttons">
        <Link to="/" className="nav-button">Home</Link> 
        <Link to="/events" className="nav-button">Events</Link>
      </div>
    </div>
  );
};

export default TopBar;
