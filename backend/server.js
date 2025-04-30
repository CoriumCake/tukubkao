require('dotenv').config();
const express = require('express');
const { Deepseek } = require('node-deepseek');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  console.error('Error: DEEPSEEK_API_KEY environment variable is not set');
  process.exit(1);
}

const client = new Deepseek({
  apiKey: apiKey
});

app.post('/api/recipes', async (req, res) => {
    try {
      const { ingredients } = req.body;
      
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ error: 'Please provide an array of ingredients' });
      }
  
      const ingredientsList = ingredients.join(', ');
      
      const response = await client.chat.createCompletion({
        messages: [
          {
            role: 'system',
            content: `You are a strict recipe analyzer. Only suggest dishes that can be made 
                      with exactly the provided ingredients. Never add ingredients. 
                      Format: comma-separated dish names, lowercase, no punctuation.`
          },
          {
            role: 'user',
            content: `Ingredients: ${ingredientsList}`
          }
        ],
        model: 'deepseek-chat',
        temperature: 0.3,
        max_tokens: 150
      });
  
      const recipes = response.choices[0].message.content
        .split(',')
        .map(recipe => recipe.trim().toLowerCase())
        .filter(recipe => recipe.length > 0 && recipe !== 'no valid dishes found');
  
      res.json({ 
        recipes: recipes.length > 0 
          ? recipes 
          : ['No dishes found with these ingredients'] 
      });
      
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'An error occurred while processing your request',
        details: error.message 
      });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
  