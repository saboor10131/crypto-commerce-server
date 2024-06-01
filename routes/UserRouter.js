const express = require("express");
const { authorizeAdmin, authorizeUserOrAdmin, authorizeSeller } = require("../middlewares/authMiddleware");
const { getUser, updateUser, getAllUsers, getCustomers} = require("../controllers/UserController");
const router = express.Router();

router.get("/", authorizeAdmin , getAllUsers);
router.get("/:id", authorizeUserOrAdmin , getUser);
router.get("/:id/customers", authorizeSeller , getCustomers);
router.put("/:id", authorizeUserOrAdmin , updateUser);

module.exports = router;