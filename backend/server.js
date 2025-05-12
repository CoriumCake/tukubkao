require('dotenv').config();
const express = require('express');
const { Deepseek } = require('node-deepseek');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

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

app.post('/api/recipe-details', async (req, res) => {
  try {
    const { title, ingredients } = req.body;

    if (!title || !ingredients) {
      return res.status(400).json({ error: 'Title and ingredients are required' });
    }

    const ingredientsList = ingredients.join(', ');
    
    try {
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
    } catch (apiError) {
      console.error('Deepseek API Error:', apiError);
      res.status(500).json({ 
        error: 'Failed to generate recipe details',
        message: 'Please try again in a few moments'
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      message: 'Please try again later'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
  