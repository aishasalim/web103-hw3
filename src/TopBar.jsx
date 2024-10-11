import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const TopBar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 'none' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'black' }}  // Change text color to black
        >
          Pizza factory 🍕
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          color="primary" 
          sx={{ marginLeft: 2, color: 'white' }}  // Set blue background and white text
        >
          Customize
        </Button>
        <Button 
          component={Link} 
          to="/customitems" 
          variant="contained" 
          color="primary" 
          sx={{ marginLeft: 2, color: 'white' }}  // Set blue background and white text
        >
          View all
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
