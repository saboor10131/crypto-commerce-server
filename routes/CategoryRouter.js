const express = require("express");
const { authorizeAdmin } = require("../middlewares/authMiddleware");
const {
  updateCategory,
  addCategory,
  getAllCategories,
} = require("../controllers/CategoryController");
const router = express.Router();

router.get("/", getAllCategories);
router.post("/", authorizeAdmin, addCategory);
router.put("/:id", authorizeAdmin, updateCategory);

module.exports = router;
