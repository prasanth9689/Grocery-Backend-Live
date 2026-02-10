const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, controller.createOrder);
router.get("/", auth, controller.getMyOrders);
router.get("/:id", auth, controller.getOrderById);

module.exports = router;
