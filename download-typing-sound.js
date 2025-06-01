const fs = require("fs");
const https = require("https");
const path = require("path");

// URL of a mechanical keyboard typing sound
// This is a placeholder URL - in a real scenario, you might want to use a specific sound
const typingSoundURL =
  "https://www.soundjay.com/mechanical/sounds/typewriter-1.mp3";

const outputFilePath = path.join(__dirname, "public", "typing.mp3");

console.log(`Downloading typing sound effect to ${outputFilePath}...`);

https
  .get(typingSoundURL, (response) => {
    if (response.statusCode !== 200) {
      console.error(
        `Failed to download: ${response.statusCode} ${response.statusMessage}`
      );
      return;
    }

    const fileStream = fs.createWriteStream(outputFilePath);
    response.pipe(fileStream);

    fileStream.on("finish", () => {
      fileStream.close();
      console.log("Download completed!");
    });
  })
  .on("error", (err) => {
    console.error(`Error downloading sound: ${err.message}`);
  });
