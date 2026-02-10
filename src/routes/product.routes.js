// const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// router.get("/", verifyToken, controller.getAll);
// router.post("/", verifyToken, isAdmin, controller.create);


const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");

router.get("/", controller.getAll);
router.post("/", controller.create);

module.exports = router;
