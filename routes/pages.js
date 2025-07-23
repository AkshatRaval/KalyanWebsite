const express = require("express");
const router = express.Router();
const path = require("path");

// Serve pages
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/index.html"));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/login.html"));
});

router.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/about.html"));
});

router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/signup.html"));
});

router.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/profile.html"));
});

router.get("/registration", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/registration.html"));
});

router.get("/donationPage", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/donationPage.html"));
});

router.get("/myApplication", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/myApplication.html"));
});

router.get("/forgotPass", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/forgotPass.html"));
});
// Export routes
// router.get("/test", (req, res) => {
//     res.send("Form route working!");
// });

module.exports = router;
