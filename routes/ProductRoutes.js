const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  searchProducts,
} = require("../controllers/ProductController");
const { authenticateSeller } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.post("/", authenticateSeller, createProduct);
router.delete("/:id", authenticateSeller, deleteProductById);

module.exports = router;