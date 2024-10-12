import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  List,
  ListItem,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import TopBar from './TopBar';

const ItemDetails = () => {
  const { id } = useParams(); // Get the pizza ID from the route parameters
  const navigate = useNavigate(); // Hook for navigation
  const [pizza, setPizza] = useState(null);
  const [ingredients, setIngredients] = useState([]); // State for all ingredients
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]); // For ingredient selection in edit dialog
  const [finalPrice, setFinalPrice] = useState(5.0); // Base price

  useEffect(() => {
    const fetchPizza = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/custom-pizza/${id}`);
        setPizza(response.data);
      } catch (error) {
        console.error('Error fetching pizza details:', error);
      }
    };

    const fetchIngredients = async () => {
      try {
        const ingredientsResponse = await axios.get('http://localhost:5001/api/ingredients');
        setIngredients(ingredientsResponse.data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchPizza();
    fetchIngredients();
  }, [id]);

  // Handle delete action
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/custom-pizza/${id}`);
      // After deletion, navigate back to the list of pizzas
      navigate('/');
    } catch (error) {
      console.error('Error deleting pizza:', error);
    }
  };

  // Handle edit action
  const handleEdit = () => {
    setEditName(pizza.name);
    setSelectedIngredients(pizza.ingredient_names || []);
    calculateFinalPrice(pizza.ingredient_names || []); // Calculate price based on current ingredients
    setIsEditing(true);
  };

  // Handle ingredient selection in edit dialog
  const handleIngredientChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedIngredients(value);
    calculateFinalPrice(value);
  };

  // Calculate final price based on selected ingredients
  const calculateFinalPrice = (selectedIngredientNames) => {
    const totalIngredientCost = ingredients
      .filter((ingredient) => selectedIngredientNames.includes(ingredient.name))
      .reduce((total, ingredient) => total + parseFloat(ingredient.cost) || 0, 0);

    // Base price is $5.00
    setFinalPrice(5.0 + totalIngredientCost);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editName.trim()) {
      alert('Pizza name cannot be empty.');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/custom-pizza/${id}`,
        {
          name: editName,
          ingredient_names: selectedIngredients,
          final_price: finalPrice,
        }
      );
      setPizza(response.data.customPizza || response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating pizza:', error);
    }
  };

  if (!pizza) {
    return (
      <Container>
        <TopBar />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <TopBar />
      <Typography variant="h4" gutterBottom textAlign="center">
        {pizza.name} 🍕
      </Typography>
      <Box textAlign="center" marginBottom={4}>
        <img
          src="/pizza.png"
          alt="Pizza"
          style={{ marginTop: '20px', width: '200px', height: 'auto' }}
        />
      </Box>
      <Typography variant="h6">Ingredients:</Typography>
      <List>
        {Array.isArray(pizza.ingredient_names) &&
          pizza.ingredient_names.map((ingredient, index) => (
            <ListItem key={index}>{ingredient}</ListItem>
          ))}
      </List>
      <Typography variant="h6">
        Price: ${(parseFloat(pizza.final_price)+5.00).toFixed(2)}
      </Typography>

      {/* Add Edit and Delete Buttons */}
      <Box marginTop={2} display="flex" justifyContent="center" gap={2}>
        <Button variant="contained" color="primary" onClick={handleEdit}>
          Edit
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDelete}>
          Delete
        </Button>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Pizza</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit}>
            <TextField
              fullWidth
              label="Pizza Name"
              variant="outlined"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              sx={{ marginBottom: '20px' }}
            />

            {/* Multiple-choice ingredient selection */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="ingredient-select-label">Select Ingredients</InputLabel>
              <Select
                labelId="ingredient-select-label"
                multiple
                value={selectedIngredients}
                onChange={handleIngredientChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {ingredients.map((ingredient) => (
                  <MenuItem key={ingredient.id} value={ingredient.name}>
                    <Checkbox
                      checked={selectedIngredients.indexOf(ingredient.name) > -1}
                    />
                    <ListItemText primary={ingredient.name} />
                    <span style={{ marginLeft: 'auto' }}>${ingredient.cost}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Display final price */}
            <Typography variant="h6" sx={{ marginTop: '10px' }}>
              Final Price: ${finalPrice.toFixed(2)}
            </Typography>

            <DialogActions>
              <Button onClick={() => setIsEditing(false)} color="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ItemDetails;
