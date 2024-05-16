const firebaseApp  = require(".");
const {getStorage} = require("firebase/storage");

const firebaseStorage = getStorage(firebaseApp)

module.exports = firebaseStorage;