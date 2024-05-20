const express = require("express");
const { authorizeAdmin, authorizeUserOrAdmin } = require("../middlewares/authMiddleware");
const { getUser, updateUser, getAllUsers} = require("../controllers/UserController");
const router = express.Router();

router.get("/", authorizeAdmin , getAllUsers);
router.get("/:id", authorizeUserOrAdmin , getUser);
router.put("/:id", authorizeUserOrAdmin , updateUser);

module.exports = router;