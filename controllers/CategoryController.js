require("dotenv").config();
const Category = require("../models/Category")
const mongoose = require("mongoose");

const addCategory = async (req, res) => {
  try {
    const category = new Category({
        name : req.body.name
    })
    await category.save()
    return res.status(201).json({message:"Category added successfully"})
  } catch (error) {
    return res.status(500).json({message:"Server error"})
  }
};

const getAllCategories = async (req, res) => {
    try {
      const categories = await Category.find()
      return res.status(200).json({data:categories})
    } catch (error) {
      return res.status(500).json({message:"Server error"})
    }
  };

const updateCategory = async (req, res) => {
  try {
    let id = req.params.id
    if (mongoose.Types.ObjectId(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
    }
    const category = Category.findById(id)
    await category.save()
    return res.status(204).json({message:"Category updated successfully"})
  } catch (error) {
    return res.status(500).json({message:"Server error"})
  }
};

module.exports = {
  addCategory,
  updateCategory,
  getAllCategories
};
