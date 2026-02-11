const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth.verifyToken, controller.createOrder);
router.get("/", auth.verifyToken, controller.getMyOrders);
router.get("/:id", auth.verifyToken, controller.getOrderById);

module.exports = router;
