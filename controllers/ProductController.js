const Product = require("../models/Product");


const createProduct = async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    categoryId: req.body.categoryId,
    image: req.body.image,
    tags: req.body.tags,
    sellerId: req.body.sellerId,
  });
  await product.save();
  return res.status(201).json({ message: "Product saved successfully" });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find();
  return res.status(200).json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  return res.status(200).json(product);
};
const searchProducts = async (req, res) => {

}


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  searchProducts,
}