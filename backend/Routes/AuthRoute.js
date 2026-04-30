const { Signup, Login, GoogleLogin, VerifyEmail, ForgotPassword, ResetPassword, GetProfile } = require("../Controllers/AuthController");
const { userVerification, checkUserStatus } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/google-login", GoogleLogin);
router.post("/verify-email/:token", VerifyEmail);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password/:token", ResetPassword);
router.get("/profile", userVerification, GetProfile);


router.post("/", checkUserStatus);

module.exports = router;