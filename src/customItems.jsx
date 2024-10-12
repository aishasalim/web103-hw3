import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  Button,
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
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const CustomItems = () => {
  const [customPizzas, setCustomPizzas] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [finalPrice, setFinalPrice] = useState(5.0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pizzasResponse = await axios.get('http://localhost:5001/api/custom-pizzas');
        setCustomPizzas(pizzasResponse.data);

        const ingredientsResponse = await axios.get('http://localhost:5001/api/ingredients');
        setIngredients(ingredientsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleClick = (event, pizza) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPizza(pizza);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setIsEditing(false);
    setFinalPrice(5.0);
    // Do not reset selectedPizza here; we need it during submission
  };

  const handleEdit = () => {
    if (!selectedPizza) return;
    setEditName(selectedPizza.name);
    setSelectedIngredients(selectedPizza.ingredient_names || []);
    calculateFinalPrice(selectedPizza.ingredient_names || []);
    setIsEditing(true);
    handleMenuClose();
  };

  const handleIngredientChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedIngredients(value);
    calculateFinalPrice(value);
  };

  const calculateFinalPrice = (selectedIngredientNames) => {
    const totalIngredientCost = ingredients
      .filter((ingredient) => selectedIngredientNames.includes(ingredient.name))
      .reduce((total, ingredient) => total + parseFloat(ingredient.cost) || 0, 0);

    setFinalPrice(5.0 + totalIngredientCost);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    console.log('Selected Pizza:', selectedPizza);

    if (!editName.trim()) {
      alert('Pizza name cannot be empty.');
      return;
    }

    if (!selectedPizza) {
      alert('No pizza selected for editing.');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/custom-pizza/${selectedPizza.id}`,
        {
          name: editName,
          ingredient_names: selectedIngredients,
        }
      );
      setCustomPizzas(
        customPizzas.map((pizza) =>
          pizza.id === selectedPizza.id ? response.data.customPizza : pizza
        )
      );
      handleDialogClose();
      setSelectedPizza(null); // Reset after submission is complete
    } catch (error) {
      console.error('Error updating pizza:', error);
      alert('Failed to update pizza. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!selectedPizza) return;
    try {
      await axios.delete(`http://localhost:5001/api/custom-pizza/${selectedPizza.id}`);
      setCustomPizzas(customPizzas.filter((pizza) => pizza.id !== selectedPizza.id));
      handleMenuClose();
      setSelectedPizza(null);
    } catch (error) {
      console.error('Error deleting pizza:', error);
    }
  };

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
                onClick={() => navigate(`/itemdetail/${pizza.id}`)}
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
                  onClick={(event) => handleClick(event, pizza)}
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                >
                  <MoreVertIcon />
                </IconButton>

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
                    Price: ${parseFloat(pizza.final_price).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Move Menu outside the map */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={(event) => {
              event.stopPropagation();
              handleEdit();
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
          >
            Delete
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
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
