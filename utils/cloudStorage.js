require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");
const serviceAccountKey = require("../firebase_key.json");
const mime = require("mime-types"); // To dynamically get content type

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, //you can find in storage.
});

var bucket = admin.storage().bucket();

const uploadFile = async (baseUrl, dataUrl, public = false) => {
  try {
    let contentRef;
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).send("Invalid file format");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const extension = mime.extension(mimeType);
    const filename = `${baseUrl}/${uuidv4()}.${extension}`;
    const file = bucket.file(filename);

    return new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: mimeType,
        },
      });

      stream.on("error", (err) => {
        reject("Failed to upload file");
      });

      stream.on("finish", async () => {
        try {
          let contentRef;
          if (public) {
            await file.makePublic();
            contentRef = `https://storage.googleapis.com/${bucket.name}/${filename}`;
          } else {
            contentRef = `${filename}`;
          }
          resolve(contentRef);
        } catch (err) {
          reject("Failed to upload file")
        }
      });

      stream.end(buffer);
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload file");
  }
};

const downloadFile = async (contentRef, res, callback) => {
  try {
    const filename = contentRef;
    const file = bucket.file(filename);

    const [metadata] = await file.getMetadata();
    const mimeType = metadata.contentType;

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const stream = file.createReadStream();
    stream.on("error", (err) => {
      console.error(err);
      res.status(500).send("Failed to download file");
    });

    stream.on("close", () => {
      callback();
    });

    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to download file");
  }
};

module.exports = {
  uploadFile,
  downloadFile,
};
