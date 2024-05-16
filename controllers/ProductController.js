const { v4: uuidv4 } = require("uuid");
const firebaseApp = require("../firebase");
const {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} = require("firebase/storage");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { getFileExtensionFromDataURL } = require("../helpers");

const uploadFile = async (baseUrl, file) => {
  try {
    let timestamp = Date.now();
    let fileExt = getFileExtensionFromDataURL(file);
    let id = uuidv4();
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `${baseUrl}/${timestamp}-${id}.${fileExt}`);
    const snapshot = await uploadString(storageRef, file, "data_url");
    return snapshot.ref.fullPath;
  } catch (error) {
    throw error;
  }
};
const uploadImage = async (baseUrl, img) => {
  try {
    let timestamp = Date.now();
    let fileExt = getFileExtensionFromDataURL(img);
    let id = uuidv4();
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `${baseUrl}/${timestamp}-${id}.${fileExt}`);
    const snapshot = await uploadString(storageRef, img, "data_url");
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    throw error;
  }
};

const createProduct = async (req, res) => {
  try {
    //upload product (file content)
    if (!req.body.content)
      return res.status(400).json({ message: "Product File is Required" });
    let baseUrlProd = `products/${req.sellerId}`;
    const contentRef = await uploadFile(baseUrlProd, req.body.content);

    //upload product Image
    if (!req.body.image)
      return res.status(400).json({ message: "Product image is required" });
    let baseUrlImg = `images/${req.sellerId}`;
    const imageUrl = await uploadImage(baseUrlImg, req.body.image);

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      categoryId: req.body.categoryId,
      imageUrl,
      tags: req.body.tags,
      contentRef,
      sellerId: req.sellerId,
    });

    await product.save();

    return res.status(201).json({ message: "Product saved successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories", // The name of the Category collection
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $addFields: {
          category: "$category.name",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          imageUrl: 1,
          tags: 1,
          category: 1,
          "seller.name": 1,
          "seller.email": 1,
        },
      },
    ]);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { categoryId, sellerId, minPrice, maxPrice, searchQuery } = req.query;
    let matchStage = {};
    if (categoryId) {
      matchStage.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (sellerId) {
      matchStage.sellerId = new mongoose.Types.ObjectId(sellerId);
    }
    if (minPrice) {
      matchStage.price.$gte = minPrice;
    }
    if (maxPrice) {
      matchStage.price.$lte = maxPrice;
    }

    let aggregatePipline = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $addFields: {
          category: "$category.name",
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: searchQuery || "", $options: "i" } },
            { description: { $regex: searchQuery || "", $options: "i" } },
            { tags: { $regex: searchQuery || "", $options: "i" } },
            { category: { $regex: searchQuery || "", $options: "i" } },
          ],
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          tags: 1,
          imageRef: 1,
          "seller.name": 1,
          "seller.email": 1,
        },
      },
    ];

    const products = await Product.aggregate(aggregatePipline).exec();

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getProductById = async (req, res) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const products = await Product.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $addFields: {
          category: "$category.name",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          imageUrl: 1,
          tags: 1,
          category: 1,
          "seller.name": 1,
          "seller.email": 1,
        },
      },
    ]);
    if (products.length == 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ data: products[0] });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchSellerProducts = async (req, res) => {
  if (!req.sellerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { searchQuery } = req.query;
  console.log(searchQuery);
  let matchStage = {};

  // Add search query filter if present
  if (searchQuery) {
    console.log("got search Query");
    matchStage = {
        $or: [
          { name: { $regex: searchQuery || "", $options: "i" } },
          { description: { $regex: searchQuery || "", $options: "i" } },
          { tags: { $regex: searchQuery || "", $options: "i" } },
          { category: { $regex: searchQuery || "", $options: "i" } },
        ],
    };
  }
  // const products  = await Product.find({sellerId:req.sellerId})
  const products = await Product.aggregate([
    {
      $match: { sellerId: new mongoose.Types.ObjectId(req.sellerId) },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $addFields: {
        category: "$category.name",
      },
    },
    {
      $match: matchStage,
    },
    {
      $project: {
        name: 1,
        price: 1,
        description: 1,
        imageUrl: 1,
        tags: 1,
        category: 1,
      },
    },
  ]);
  return res.status(200).json(products);
};

const deleteProductById = async (req, res) => {
  try {
    let id = req.params.id;
    let sellerId = req.sellerId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.sellerId != sellerId) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this product" });
    }
    await Product.findByIdAndDelete(product._id);
    return res.status(204).json({ message: "product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  searchSellerProducts,
  getProductById,
  deleteProductById,
  searchProducts,
};
