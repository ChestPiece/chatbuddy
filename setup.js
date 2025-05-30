const fs = require("fs");
const readline = require("readline");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("===== AI Assistant Chatbot Setup =====");
console.log(
  "This script will help you set up your OpenAI API key and Assistant ID."
);
console.log("You can get an API key from https://platform.openai.com/api-keys");
console.log(
  "and create an Assistant at https://platform.openai.com/assistants"
);
console.log("");

// Check if .env.local already exists
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  console.log(
    "An .env.local file already exists. Do you want to overwrite it?"
  );
  rl.question("Overwrite? (y/n): ", (answer) => {
    if (answer.toLowerCase() === "y") {
      promptForCredentials();
    } else {
      console.log(
        "Setup canceled. Your existing .env.local file was not modified."
      );
      rl.close();
    }
  });
} else {
  promptForCredentials();
}

function promptForCredentials() {
  rl.question("Enter your OpenAI API key: ", (apiKey) => {
    if (!apiKey.trim()) {
      console.log(
        "No API key provided. Using mock responses for demonstration."
      );
      console.log(
        "You can run this setup script again later to set up your API key."
      );
      rl.close();
      return;
    }

    rl.question(
      "Enter your OpenAI Assistant ID (optional, but recommended for agent functionality): ",
      (assistantId) => {
        // Create or update .env.local file
        try {
          let envContent = `OPENAI_API_KEY=${apiKey.trim()}\n`;

          if (assistantId.trim()) {
            envContent += `OPENAI_ASSISTANT_ID=${assistantId.trim()}\n`;
          }

          fs.writeFileSync(envPath, envContent);
          console.log("");
          console.log(
            "Success! Your credentials have been saved to .env.local"
          );
          console.log("");

          if (!assistantId.trim()) {
            console.log("NOTE: You didn't provide an Assistant ID.");
            console.log(
              "The application will fall back to using the regular chat completions API."
            );
            console.log(
              "To use the Assistants API with full agent capabilities, create an Assistant at:"
            );
            console.log("https://platform.openai.com/assistants");
            console.log(
              "Then run this setup script again to add your Assistant ID."
            );
            console.log("");
          }

          console.log("You can now run the app with:");
          console.log("  npm run dev");
          console.log("");
          console.log(
            "Remember to never commit your .env.local file to version control!"
          );
        } catch (error) {
          console.error("Error saving credentials:", error.message);
        }

        rl.close();
      }
    );
  });
}
