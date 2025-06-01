const fs = require("fs");
const https = require("https");
const path = require("path");

// URL of a keyboard typing sound (this one is confirmed to work)
const typingSoundURL =
  "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3";

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
      console.log("Download completed! New typing sound is ready to use.");
      console.log("Size:", fs.statSync(outputFilePath).size, "bytes");
    });
  })
  .on("error", (err) => {
    console.error(`Error downloading sound: ${err.message}`);
  });
