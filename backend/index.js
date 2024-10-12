require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
});

// Route to create a new custom pizza
app.post('/api/custom-pizza', async (req, res) => {
    const { name, ingredient_names } = req.body; // Expecting name and ingredient_names in the request body

    // Calculate the final price based on ingredient names
    let final_price = 0;

    // Fetch costs for each ingredient
    try {
        const ingredientCosts = await pool.query(
            `SELECT cost FROM Ingredients WHERE name = ANY($1::TEXT[])`,
            [ingredient_names]
        );

        // Sum the costs
        final_price = ingredientCosts.rows.reduce((total, ingredient) => {
            return total + parseFloat(ingredient.cost);
        }, 0);

        // Insert the new custom pizza into the CustomItems table
        const result = await pool.query(
            `INSERT INTO CustomItems (name, ingredient_names, final_price) 
            VALUES ($1, $2, $3) RETURNING *`,
            [name, ingredient_names, final_price]
        );

        res.status(201).json({
            message: 'Custom pizza created successfully!',
            customPizza: result.rows[0],
        });
    } catch (error) {
        console.error('Error creating custom pizza:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get all ingredients
app.get('/api/ingredients', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Ingredients');
        res.json(result.rows); // Send the ingredients as JSON response
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get all custom pizzas
app.get('/api/custom-pizzas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM CustomItems');
        res.json(result.rows); // Send the custom pizzas as JSON response
    } catch (error) {
        console.error('Error fetching custom pizzas:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete a custom pizza
app.delete('/api/custom-pizza/:id', async (req, res) => {
    const { id } = req.params; // Get the pizza ID from the URL

    try {
        const result = await pool.query('DELETE FROM CustomItems WHERE id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pizza not found' });
        }

        res.status(200).json({ message: 'Pizza deleted successfully' });
    } catch (error) {
        console.error('Error deleting pizza:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update a custom pizza
app.put('/api/custom-pizza/:id', async (req, res) => {
    const { id } = req.params; // Get the pizza ID from the URL
    const { name, ingredient_names } = req.body; // Expecting updated name and ingredient_names

    try {
        const ingredientCosts = await pool.query(
            `SELECT cost FROM Ingredients WHERE name = ANY($1::TEXT[])`,
            [ingredient_names]
        );

        // Calculate the final price based on ingredient names
        let final_price = ingredientCosts.rows.reduce((total, ingredient) => {
            return total + parseFloat(ingredient.cost);
        }, 0);

        // Update the custom pizza in the CustomItems table
        const result = await pool.query(
            `UPDATE CustomItems 
            SET name = $1, ingredient_names = $2, final_price = $3 
            WHERE id = $4 RETURNING *`,
            [name, ingredient_names, final_price, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pizza not found' });
        }

        res.status(200).json({
            message: 'Custom pizza updated successfully!',
            customPizza: result.rows[0],
        });
    } catch (error) {
        console.error('Error updating custom pizza:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get a single custom pizza by ID
app.get('/api/custom-pizza/:id', async (req, res) => {
    const { id } = req.params; // Get the pizza ID from the URL
    try {
      const result = await pool.query('SELECT * FROM CustomItems WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pizza not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching pizza details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to update a custom pizza
app.put('/api/custom-pizza/:id', async (req, res) => {
    const { id } = req.params;
    const { name, ingredient_names } = req.body;
  
    try {
      const ingredientCosts = await pool.query(
        `SELECT cost FROM Ingredients WHERE name = ANY($1::TEXT[])`,
        [ingredient_names]
      );
  
      let final_price = ingredientCosts.rows.reduce((total, ingredient) => {
        return total + parseFloat(ingredient.cost);
      }, 0);
  
      // Add base price
      final_price += 5.0;
  
      const result = await pool.query(
        `UPDATE CustomItems 
        SET name = $1, ingredient_names = $2, final_price = $3 
        WHERE id = $4 RETURNING *`,
        [name, ingredient_names, final_price, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Pizza not found' });
      }
  
      res.status(200).json({
        message: 'Custom pizza updated successfully!',
        customPizza: result.rows[0],
      });
    } catch (error) {
      console.error('Error updating custom pizza:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
