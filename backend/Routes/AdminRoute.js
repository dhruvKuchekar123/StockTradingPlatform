const { getPendingUsers, approveUser, rejectUser } = require("../Controllers/AdminController");
const { adminVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.get("/pending-users", adminVerification, getPendingUsers);
router.post("/approve-user/:userId", adminVerification, approveUser);
router.delete("/reject-user/:userId", adminVerification, rejectUser);

module.exports = router;
