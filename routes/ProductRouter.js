const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  searchProducts,
  donwloadProduct,
} = require("../controllers/ProductController");
const { authorizeSeller } = require("../middlewares/authMiddleware");

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.get("/download/:id/:token", donwloadProduct);
router.post("/", authorizeSeller, createProduct);
router.delete("/:id", authorizeSeller, deleteProductById);

module.exports = router;