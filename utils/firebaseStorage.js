const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");
const mime = require("mime-types");
const path = require("path");
require("dotenv").config();

class FirebaseStorage {
  constructor() {
    if (FirebaseStorage.INSTANCE) {
      return FirebaseStorage.INSTANCE;
    }
    try {
      const fileJson = Buffer.from(
        process.env.FIREBASE_BASE64,
        "base64"
      ).toString();
      const filePath = path.join(__dirname, "firebase_config.json");
      fs.writeFileSync(filePath, fileJson);

      if (!fs.existsSync(filePath)) {
        throw new Error("firebase config not found");
      }
      admin.initializeApp({
        credential: admin.credential.cert(require(filePath)),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      this.bucket = admin.storage().bucket();

      fs.unlinkSync(filePath);
    } catch (error) {
      console.log("error");
      throw new Error(error);
    }
    FirebaseStorage.INSTANCE = this;
  }

  static getInstance() {
    if (!FirebaseStorage.INSTANCE) {
      FirebaseStorage.INSTANCE = new FirebaseStorage();
    }
    return FirebaseStorage.INSTANCE;
  }

  async uploadFile(baseUrl, dataUrl, publicPath = false) {
    try {
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new Error("Invalid file format");
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      const extension = mime.extension(mimeType);
      const filename = `${baseUrl}/${uuidv4()}.${extension}`;
      const file = this.bucket.file(filename);

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
            if (publicPath) {
              await file.makePublic();
              contentRef = `https://storage.googleapis.com/${this.bucket.name}/${filename}`;
            } else {
              contentRef = `${filename}`;
            }
            resolve(contentRef);
          } catch (err) {
            reject("Failed to upload file");
          }
        });

        stream.end(buffer);
      });
    } catch (error) {
      console.error(error);
      throw new Error("Failed to upload file");
    }
  }
  async downloadFile(contentRef, res, callback) {
    try {
      const filename = contentRef;
      const file = this.bucket.file(filename);

      const [metadata] = await file.getMetadata();
      const mimeType = metadata.contentType;

      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

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
  }
}

module.exports = FirebaseStorage;
