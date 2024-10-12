import React, { useEffect, useState } from 'react';
import { Container, Typography, FormControl, InputLabel, Select, MenuItem, Button, Checkbox, ListItemText, Box, Grid } from '@mui/material';
import axios from 'axios';
import TopBar from './TopBar';
import { useNavigate } from 'react-router-dom';


const App = () => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [pizzaName, setPizzaName] = useState('');
  const [finalPrice, setFinalPrice] = useState(5.00); // Initial price
  const navigate = useNavigate();

  // Fetch ingredients from the API
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/ingredients'); // Adjust the endpoint as necessary
        setIngredients(response.data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchIngredients();
  }, []);

// Handle ingredient selection
const handleIngredientChange = (event) => {
  const { target: { value } } = event;
  setSelectedIngredients(value);

  // Calculate the final price based on selected ingredients
  const totalIngredientCost = ingredients
    .filter(ingredient => value.includes(ingredient.name))
    .reduce((total, ingredient) => total + parseFloat(ingredient.cost) || 0, 0);
  
  // Add base price (5.00) to the total
  setFinalPrice(5.00 + totalIngredientCost); // Ensure base price is included
};

// Submit the pizza customization
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!pizzaName.trim()) {
    alert('Pizza name cannot be empty.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:5001/api/custom-pizza', {
      name: pizzaName,
      ingredient_names: selectedIngredients,
      final_price: finalPrice,
    });
    console.log('Custom pizza created:', response.data);

    // Extract the new pizza's ID from the response
    const newPizzaId = response.data.customPizza.id;

    // Redirect to the new pizza's detail page
    navigate(`/itemdetail/${newPizzaId}`);

    // Optionally reset form fields
    setPizzaName('');
    setSelectedIngredients([]);
    setFinalPrice(5.0); // Reset to initial price
  } catch (error) {
    console.error('Error creating custom pizza:', error);
  }
};



  // Group ingredients by type
  const ingredientTypes = [...new Set(ingredients.map(ingredient => ingredient.type))];

  return (
    <Container>
      <TopBar />

      <Box textAlign="center" marginBottom={4}>
        <img 
          src="/pizza.png" // Update the path based on your file structure
          alt="Pizza"
          style={{ marginTop:"70px", width: '300px', height: 'auto' }} // Adjust the width as necessary
        />
      </Box>

      <Typography variant="h4" gutterBottom textAlign="center">
        Customize Your Pizza
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <input
            type="text"
            value={pizzaName}
            onChange={(e) => setPizzaName(e.target.value)}
            placeholder="Enter your pizza name"
            style={{ width: '250px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </FormControl>
        
        <Grid container spacing={2}>
          {ingredientTypes.map((type) => (
            <Grid item xs={6} key={type}>  {/* 2 items per row (6/12 = 50%) */}
              <FormControl fullWidth margin="normal">
                <InputLabel id={`${type}-select-label`}>Select {type}</InputLabel>
                <Select
                  labelId={`${type}-select-label`}
                  multiple
                  value={selectedIngredients}
                  onChange={handleIngredientChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {ingredients.filter(ingredient => ingredient.type === type).map((ingredient) => (
                    <MenuItem key={ingredient.id} value={ingredient.name}>
                      <Checkbox checked={selectedIngredients.indexOf(ingredient.name) > -1} />
                      <ListItemText primary={ingredient.name} />
                      <span style={{ marginLeft: 'auto' }}>${ingredient.cost}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6">Final Price: ${finalPrice.toFixed(2)}</Typography>

        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Submit Custom Pizza
        </Button>
      </form>
    </Container>
  );
};

export default App;
