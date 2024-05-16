const express = require("express");
const { authenticateSeller, authenticateAdmin, authenticateUserOrAdmin } = require("../middlewares/authMiddleware");
const { getUser, updateUser, getAllCustomers, getAllSellers } = require("../controllers/UserController");
const { searchSellerProducts } = require("../controllers/ProductController");
const router = express.Router();

router.get("/customers" , getAllCustomers);
router.get("/sellers", authenticateAdmin , getAllSellers);
router.get("/:id", authenticateUserOrAdmin , getUser);
router.put("/:id", authenticateUserOrAdmin , updateUser);
router.get("/:id/products" , authenticateUserOrAdmin , searchSellerProducts)


module.exports = router;
