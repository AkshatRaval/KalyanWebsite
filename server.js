const express = require("express");
const Razorpay = require("razorpay");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const credentials = require("./keyFirebase.json");

// ✅ Load environment variables
dotenv.config();

// ✅ Express App
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Firebase Admin SDK (Prevent Multiple Initializations)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(credentials)
    });
}

// ✅ Razorpay Setup (Ensure Environment Variables Are Loaded)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ Debug Log for Environment Variables
console.log("✅ Razorpay Key ID Loaded:", process.env.RAZORPAY_KEY_ID ? "Yes" : "No");

// ✅ Create Razorpay Order (Fix API Key Issue)
app.post("/create-order", async (req, res) => {
    const options = {
        amount: 100, // ₹300 in paise
        currency: "INR",
        receipt: `order_rcptid_${Date.now()}`, // Dynamic receipt ID
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json({
            order,
            key: process.env.RAZORPAY_KEY_ID // ✅ Send API key in response
        });
    } catch (error) {
        console.error("❌ Razorpay Error:", error);
        res.status(500).json({ success: false, message: "Error creating order." });
    }
});

// ✅ Confirm Payment (Fix Missing `payment_id`)
app.post("/confirm-payment", async (req, res) => {
    const { payment_id, order_id } = req.body;

    if (!payment_id) {
        return res.status(400).json({ success: false, message: "❌ payment_id is required" });
    }

    try {
        const payment = await razorpay.payments.fetch(payment_id);
        res.json({ success: true, payment });
    } catch (error) {
        console.error("❌ Payment Verification Failed:", error);
        res.status(500).json({ success: false, message: "Payment verification failed." });
    }
});

// ✅ Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));
app.use("/api/form", require("./routes/form"));
app.use("/", require("./routes/form"));

const donateRouter = require('./routes/donate');
app.use('/', donateRouter);

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
