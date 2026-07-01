const UserModel = require("../model/UserModel");
const { retryFailedEmails } = require("../util/EmailService");

module.exports.retryFailedEmails = async (req, res) => {
    try {
        const summary = await retryFailedEmails();
        res.json({ success: true, ...summary });
    } catch (error) {
        console.error("Retry Failed Emails Error:", error);
        res.status(500).json({ success: false, message: "Error retrying failed emails" });
    }
};

module.exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await UserModel.find({ isApproved: false, role: "user" }).select("-password");
        res.json({ success: true, users: pendingUsers });
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching pending users" });
    }
};

module.exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: "Cannot approve user. Email is not verified yet." });
        }

        user.isApproved = true;
        await user.save();
        res.json({ success: true, message: "User approved successfully!" });
    } catch (error) {
        console.error("Admin Approve Error:", error);
        res.status(500).json({ success: false, message: "Error approving user" });
    }
};

module.exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await UserModel.findByIdAndDelete(userId);
        res.json({ success: true, message: "User rejected and removed." });
    } catch (error) {
        console.error("Admin Reject Error:", error);
        res.status(500).json({ success: false, message: "Error rejecting user" });
    }
};
