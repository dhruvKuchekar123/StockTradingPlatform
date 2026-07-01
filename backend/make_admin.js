/**
 * One-off admin promotion script. NOT an endpoint — run manually from the shell.
 *
 *   node make_admin.js <email>
 *
 * Promotes exactly the one account matching <email> (case-insensitive) to
 * role "admin". Refuses to run without an explicit email argument, and is a
 * no-op if the account is already an admin.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./model/UserModel");

const email = process.argv[2];
if (!email) {
  console.error("Usage: node make_admin.js <email>");
  process.exit(1);
}

(async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL is not set in the environment.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URL);

  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const user = await User.findOne({ email: { $regex: `^${escaped}$`, $options: "i" } });

  if (!user) {
    console.error(`No account found for "${email}". Nobody was promoted.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  if (user.role === "admin") {
    console.log(`"${user.email}" is already an admin. No change.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  user.role = "admin";
  await user.save(); // password is not modified, so the pre-save hook won't re-hash it
  console.log(`Promoted "${user.email}" (id ${user._id}) to admin.`);

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("Promotion failed:", err.message);
  process.exit(1);
});
