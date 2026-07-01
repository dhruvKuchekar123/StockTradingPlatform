const { executeSell } = require("../Controllers/SellController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.post("/execute", userVerification, executeSell);

module.exports = router;
