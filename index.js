import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
const port = 5000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Initialize OpenAI API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Endpoint for generating business names
app.post("/generate-names", async (req, res) => {
  try {
    const { category, keywords, length } = req.body;

    // Construct prompt for OpenAI based on user criteria
    const messages = [
      {
        role: "user",
        content: `Generate business names for category: ${category}, keywords: ${keywords}, length: ${length}`,
      },
    ];

    //     // Call OpenAI API to generate business names
    //     const response = await openai.chat.completions.create({
    //       model: "gpt-3.5-turbo", // Choose appropriate OpenAI model
    //       messages,
    //     });

    //     // Safeguard against undefined choices
    //     if (!response.choices) {
    //       throw new Error("Unexpected response structure: choices are undefined");
    //     }

    //     // Extract the generated names from the response, ensuring text property exists
    //     const generatedNames = response.data.choices
    //       .map((choice) => (choice.text ? choice.text.trim() : ""))
    //       .join("\n");

    //     res.json({ names: generatedNames });
    //   } catch (error) {
    //     console.error("Error generating business names:", error);
    //     res
    //       .status(500)
    //       .json({ error: "An error occurred while generating business names." });
    //   }
    // });

    // Call OpenAI API to generate business names
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    // Check if the response has an error
    if (response.error) {
      throw new Error(`OpenAI API error: ${response.error.message}`);
    }

    // Check if the response has a valid structure
    if (
      !response.data ||
      !response.data.choices ||
      response.data.choices.length === 0
    ) {
      throw new Error(
        "Unexpected response structure: choices are missing or empty"
      );
    }

    // Extract the generated names from the response
    const generatedNames = response.data.choices
      .map((choice) => (choice.text ? choice.text.trim() : ""))
      .join("\n");

    res.json({ names: generatedNames });
  } catch (error) {
    console.error("Error generating business names:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating business names." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
