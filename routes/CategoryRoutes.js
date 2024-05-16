const express = require("express");
const { authenticateAdmin } = require("../middlewares/authMiddleware");
const {
  updateCategory,
  addCategory,
  getAllCategories,
} = require("../controllers/CategoryController");
const router = express.Router();

router.get("/", getAllCategories);
router.post("/", authenticateAdmin, addCategory);
router.put("/:id", authenticateAdmin, updateCategory);

module.exports = router;
