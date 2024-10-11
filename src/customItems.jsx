import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import TopBar from './TopBar';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const CustomItems = () => {
  const [customPizzas, setCustomPizzas] = useState([]);
  const [ingredients, setIngredients] = useState([]); // State for all ingredients
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPizzaId, setSelectedPizzaId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]); // For ingredient selection in edit dialog
  const [finalPrice, setFinalPrice] = useState(5.0); // Base price

  // Fetch custom pizzas and ingredients from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch custom pizzas
        const pizzasResponse = await axios.get('http://localhost:5001/api/custom-pizzas');
        setCustomPizzas(pizzasResponse.data);

        // Fetch ingredients
        const ingredientsResponse = await axios.get('http://localhost:5001/api/ingredients');
        setIngredients(ingredientsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle menu opening
  const handleClick = (event, pizzaId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPizzaId(pizzaId);
  };

  // Handle menu closing
  const handleMenuClose = () => {
    setAnchorEl(null);
    // Do not reset selectedPizzaId here
  };

  // Handle dialog closing
  const handleDialogClose = () => {
    setIsEditing(false);
    setSelectedPizzaId(null); // Reset after editing is done
    setFinalPrice(5.0); // Reset price
  };

  // Handle edit action
  const handleEdit = (pizza) => {
    setSelectedPizzaId(pizza.id); // Set the selected pizza ID
    setEditName(pizza.name);
    setSelectedIngredients(pizza.ingredient_names || []);
    calculateFinalPrice(pizza.ingredient_names || []); // Calculate price based on current ingredients
    setIsEditing(true);
    handleMenuClose(); // Close the menu
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
        `http://localhost:5001/api/custom-pizza/${selectedPizzaId}`,
        {
          name: editName,
          ingredient_names: selectedIngredients,
          final_price: finalPrice,
        }
      );
      setCustomPizzas(
        customPizzas.map((pizza) =>
          pizza.id === selectedPizzaId ? response.data.customPizza : pizza
        )
      );
      handleDialogClose(); // Close dialog after submission
    } catch (error) {
      console.error('Error updating pizza:', error);
    }
  };

  // Handle delete action
  const handleDelete = async (pizzaId) => {
    try {
      await axios.delete(`http://localhost:5001/api/custom-pizza/${pizzaId}`);
      setCustomPizzas(customPizzas.filter((pizza) => pizza.id !== pizzaId));
      handleMenuClose();
      setSelectedPizzaId(null); // Reset after deletion
    } catch (error) {
      console.error('Error deleting pizza:', error);
    }
  };

  // Group ingredients by type (optional, if you want to categorize them)
  const ingredientTypes = [...new Set(ingredients.map((ingredient) => ingredient.type))];

  return (
    <>
      <TopBar />

      <Container>
        <Typography variant="h4" gutterBottom textAlign="center">
          Created Custom Pizzas
        </Typography>
        <Grid container spacing={2}>
          {customPizzas.map((pizza) => (
            <Grid
              sx={{ marginTop: '80px' }}
              item
              xs={12}
              sm={6}
              md={4}
              key={pizza.id}
            >
              <Card
                sx={{
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  padding: 2,
                  position: 'relative',
                }}
              >
                <IconButton
                  onClick={(event) => handleClick(event, pizza.id)}
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                >
                  <MoreVertIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleEdit(pizza)}>Edit</MenuItem>
                  <MenuItem onClick={() => handleDelete(pizza.id)}>Delete</MenuItem>
                </Menu>

                <CardContent>
                  <Typography variant="h5">
                    {pizza.name || 'Unnamed Pizza'} 🍕
                  </Typography>
                  <Box textAlign="center" marginBottom={4}>
                    <img
                      src="/pizza.png"
                      alt="Pizza"
                      style={{ marginTop: '70px', width: '150px', height: 'auto' }}
                    />
                  </Box>

                  <Typography variant="h6">Ingredients:</Typography>
                  <List>
                    <Grid container spacing={1}>
                      {Array.isArray(pizza.ingredient_names) &&
                        pizza.ingredient_names.map((ingredient, index) => (
                          <Grid item xs={6} key={index}>
                            <ListItem sx={{ fontFamily: '"Arial", sans-serif' }}>
                              {ingredient}
                            </ListItem>
                          </Grid>
                        ))}
                    </Grid>
                  </List>
                  <Typography variant="h6">
                    Price: ${(parseFloat(pizza.final_price) + 5.00).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={isEditing} onClose={handleDialogClose} fullWidth maxWidth="sm">
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
                <Button onClick={handleDialogClose} color="secondary">
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
    </>
  );
};

export default CustomItems;
