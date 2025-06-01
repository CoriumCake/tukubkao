require('dotenv').config();
const express = require('express');
const { Deepseek } = require('node-deepseek');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:19006', 'http://localhost:19000', 'exp://localhost:19000'], // Add your frontend URLs
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Validate API key
const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  console.error('Error: DEEPSEEK_API_KEY environment variable is not set');
  process.exit(1);
}

const client = new Deepseek({
  apiKey: apiKey
});

// Input validation middleware
const validateIngredients = (req, res, next) => {
  const { ingredients } = req.body;
  
  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }
  
  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Ingredients must be an array' });
  }
  
  if (ingredients.length === 0) {
    return res.status(400).json({ error: 'At least one ingredient is required' });
  }
  
  if (ingredients.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 ingredients allowed' });
  }
  
  next();
};

app.post('/api/recipes', validateIngredients, async (req, res) => {
  try {
    const { ingredients } = req.body;
    const ingredientsList = ingredients.join(', ');
    
    const response = await client.chat.createCompletion({
      messages: [
        {
          role: 'system',
          content: `You are a strict recipe analyzer. Only suggest dishes that can be made 
                    with exactly the provided ingredients. Never add ingredients. 
                    Format: comma-separated dish names, lowercase, no punctuation.
                    Maximum 5 dish suggestions.`
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

    if (recipes.length === 0) {
      return res.status(404).json({ 
        error: 'No dishes found',
        message: 'No dishes could be made with the provided ingredients'
      });
    }

    res.json({ recipes });
    
  } catch (error) {
    console.error('Recipe Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recipes',
      message: 'Please try again in a few moments',
      details: error.message
    });
  }
});

app.post('/api/recipe-details', validateIngredients, async (req, res) => {
  try {
    const { title, ingredients } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Recipe title is required' });
    }

    const ingredientsList = ingredients.join(', ');
    
    const response = await client.chat.createCompletion({
      messages: [
        {
          role: 'system',
          content: `You are a professional chef. Format your recipe response in the following structure:
                   
                   INGREDIENTS:
                   • [List each ingredient on a new line with a bullet point]
                   
                   INSTRUCTIONS:
                   [Numbered steps for cooking process]
                   
                   COOKING TIME:
                   [Total time needed]
                   
                   TIPS:
                   • [List any helpful tips with bullet points]
                   
                   Important: Do not use asterisks or markdown for bold text. The sections INGREDIENTS, INSTRUCTIONS, COOKING TIME, and TIPS will be automatically formatted as bold in the app.`
        },
        {
          role: 'user',
          content: `Create a detailed recipe for "${title}" using these ingredients: ${ingredientsList}. 
                   Format the response with bullet points for ingredients and tips, and numbered steps for instructions.
                   Do not use any markdown formatting or asterisks.`
        }
      ],
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 500
    });

    const recipeDescription = response.choices[0].message.content;

    res.json({
      title,
      recipe_desc: recipeDescription,
      ingred: ingredients
    });
  } catch (error) {
    console.error('Recipe Details Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recipe details',
      message: 'Please try again in a few moments',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong. Please try again later.'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API endpoints available at:`);
  console.log(`- POST http://localhost:${port}/api/recipes`);
  console.log(`- POST http://localhost:${port}/api/recipe-details`);
});
  