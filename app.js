import { v1beta2 } from "@google-ai/generativelanguage";
const { TextServiceClient } = v1beta2;
import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// cors
app.options("*", cors()); // Enable CORS pre-flight for all routes

// const corsOptions = {
//   origin: 'https://www.bizzowl.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//  };

app.use(
  cors({
    origin: "https://www.bizzowl.com",
  })
);

const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.GOOGLE_API_KEY;

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

// Endpoint to generate business names based on user input
app.post("/generate-names", async (req, res) => {
  try {
    const { category, keywords, length } = req.body;

    console.log("Sending data to API:", {
      category: category,
      keywords: keywords,
      length: length,
    });

    // Construct prompt based on user input
    const prompt = `Generate unique, memorable and catchy business names related to ${category} with the help of keywords like ${keywords} with maximum character limit upto ${length} characters.`;

    // Call Google AI Platform Text-to-Text Generation API
    const response = await client.generateText({
      model: MODEL_NAME,
      prompt: {
        text: prompt,
      },
    });

    console.log("API Response: ", JSON.stringify(response, null, 2));
    let output = response[0].candidates[0].output;
    console.log(output);

    // Assuming the names are separated by commas
    const generatedNames = output.split("\n");

    // Remove special characters from each name
    const cleanedNames = generatedNames.map((name) =>
      name.replace(/[^a-zA-Z0-9 ]/g, "").trim()
    );

    // Remove any empty strings from the array
    const filteredNames = cleanedNames.filter((name) => name !== "");

    // Send cleaned names array to frontend
    res.json({ names: filteredNames });
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
