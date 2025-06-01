const fs = require("fs");
const https = require("https");
const path = require("path");

// URL of a better mechanical keyboard typing sound
// Using a different URL since the previous one failed
const typingSoundURL =
  "https://www.soundjay.com/buttons/sounds/keyboard-typing-1.mp3";

const outputFilePath = path.join(__dirname, "public", "typing.mp3");

console.log(`Downloading improved typing sound effect to ${outputFilePath}...`);

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
      console.log("Download completed! New typing sound is ready to use.");
      console.log("Refresh your app to hear the new sound when typing.");
    });
  })
  .on("error", (err) => {
    console.error(`Error downloading sound: ${err.message}`);

    // If download fails, print instructions for manual download
    console.log(
      "\nIf automatic download failed, please manually download a typing sound:"
    );
    console.log("1. Download a keyboard typing sound of your choice");
    console.log('2. Rename it to "typing.mp3"');
    console.log('3. Place it in the "public" folder of your project');
  });
