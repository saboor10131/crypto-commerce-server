const mongoose = require("mongoose");
const { Schema } = mongoose;

const downloadTokenSchema = Schema({
  token: {
    type: String,
    required: true,
  },
  used : {
    type : Boolean,
    default : false,
  },
  expiresAt:{
    type : String,
    required : true,
  }
});

const DownloadTokenModel = mongoose.model("DownloadToken", downloadTokenSchema);

module.exports = DownloadTokenModel;