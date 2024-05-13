const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = Schema({
  name: {
    type: String,
    required: true,
  },
});

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;