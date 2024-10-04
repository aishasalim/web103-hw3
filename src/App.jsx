// App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import TopBar from './TopBar'; 

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/locations'); 
        setData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <TopBar />
      <ul>
        {data.map(item => (
          <Link key={item.id} to={`/location/${item.id}`} className="card">
          <li>
            <strong>{item.name}</strong>
            <br /><br />
            {item.address}
          </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default App;
