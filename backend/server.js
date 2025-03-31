const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware to parse JSON request body
app.use(express.json());

app.post("/chat", async (req, res) => {
    // Retrieve the prompt from the request body
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
        return res.status(400).json({ error: "Please provide a prompt!" });
    }

    // Refine the prompt to specify that only menu items should be returned
    const refinedPrompt = `Given the ingredients: ${userPrompt}, what dishes can I cook? Please provide a simple list of dish names separated by commas, without any additional formatting, numbering, or punctuation.`;

    try {
        const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
            model: "llama3.3:latest",
            prompt: refinedPrompt, // Use the refined prompt here
            stream: true,
        }, {
            responseType: "stream",
        });

        let responseText = "";

        ollamaResponse.data.on("data", (chunk) => {
            const lines = chunk.toString().split("\n").filter(line => line.trim());

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        responseText += json.response + " ";
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            }
        });

        ollamaResponse.data.on("end", () => {
            // Post-process the response to extract only the list of dishes
            const dishes = responseText.trim()
                .replace(/[0-9]+\.\s*/g, '') // Remove numbering (e.g., "1. ", "2. ")
                .replace(/[\(\)\[\]{}\'\"]/g, '') // Remove parentheses and other punctuation
                .replace(/[^a-zA-Z0-9,\s]/g, '') // Remove any non-alphanumeric characters except commas and spaces
                .split(',')
                .map(dish => dish.trim())
                .filter(dish => dish.length > 0); // Filter out empty strings

            res.json({ response: dishes });
        });

        ollamaResponse.data.on("error", (error) => {
            console.error("Stream error:", error);
            res.status(500).json({ error: "Failed to process stream from Ollama" });
        });

    } catch (error) {
        console.error("Error fetching from Ollama:", error);
        res.status(500).json({ error: "Failed to get response from Ollama" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});