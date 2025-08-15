const bcrypt = require("bcrypt");
const User = require("../model/UserModel"); // Adjust path

module.exports.Signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Ensure data is received
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("❌ Error in Signup:", err);
    res.status(500).json({ error: "Server error" });
  }
};
