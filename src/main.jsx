import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Ensure this is imported
import App from './App.jsx';
import CustomItems from './customItems.jsx';
import ItemDetails from './ItemDetails.jsx';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const root = createRoot(document.getElementById('root'));

root.render(
  <ThemeProvider theme={theme}>
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> 
        <Route path="/customitems" element={<CustomItems />} /> 
        <Route path="/itemdetail/:id" element={<ItemDetails />} />
      </Routes>
    </Router>
  </StrictMode>,
  </ThemeProvider>
);
