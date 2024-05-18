const express = require("express");
const { placeOrder, viewOrders, viewOrderDetails, requestDownload } = require("../controllers/OrderController");
const { authenticateUser, authorizeCustomer } = require("../middlewares/authMiddleware");
const router = express.Router();


router.get("/", authenticateUser , viewOrders);
router.get("/:id", authenticateUser , viewOrderDetails);
router.post("/", authorizeCustomer, placeOrder);
router.post("/:id/request-download", authenticateUser, requestDownload);


module.exports = router;