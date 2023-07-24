// Import necessary dependencies from the "openai" module.
import { Configuration, OpenAIApi } from "openai";

// Create a new instance of the Configuration class with the OpenAI API key from the environment variable.
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a new instance of the OpenAIApi class, passing the configuration object with the API key.
const openai = new OpenAIApi(configuration);

// Define the main request handler function that will be executed when the server receives a POST request.
export default async function (req, res) {
  // Check if the OpenAI API key is missing or not configured.
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  // Retrieve the value of the "animal" property from the request body, or assign an empty string if not present.
  const animal = req.body.animal || '';

  // Check if the "animal" parameter is missing, empty, or contains only whitespace characters.
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid animal",
      }
    });
    return;
  }

  try {
    // Make an API call to OpenAI using the createCompletion method.
    // Provide the GPT-3 model ("text-davinci-003"), the generated prompt with the animal name, and set the temperature to 0.6.
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(animal),
      temperature: 0.6,
    });

    // Respond with a 200 status and send back the suggested superhero names extracted from the OpenAI API response.
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // If an error occurs during the API call, handle the error and respond accordingly.
    if (error.response) {
      // Log the status and data of the API response and send back the error response with the same status and data.
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // If there is no response from the OpenAI API, log the error message and send back a 500 status response with a generic error message.
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

// Define the generatePrompt function that takes an "animal" parameter and generates a prompt for the OpenAI API.
function generatePrompt(animal) {
  // Capitalize the first letter of the animal's name for consistency.
  const capitalizedAnimal = animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  
  // Create a template prompt asking the AI to suggest three superhero names for the provided animal.
  // Provide examples for "Cat" and "Dog" superheroes along with their names, and include the capitalized animal name in the prompt.
  return `Suggest three names for an animal that is a superhero.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}
