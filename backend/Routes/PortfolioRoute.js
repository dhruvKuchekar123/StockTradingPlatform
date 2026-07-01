const { getPortfolio, toggleVisibility } = require("../Controllers/PortfolioController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.get("/:username", getPortfolio);
router.patch("/toggle-visibility", userVerification, toggleVisibility);

module.exports = router;
