const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

// Handle donation POST request
router.post("/donate", async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).send("Invalid donation amount.");
        }

        // Create Razorpay order (amount in paise)
        const order = await razorpay.orders.create({
            amount: parseInt(amount) * 100,
            currency: "INR",
            payment_capture: 1,
            notes: { purpose: "Donation" }
        });

        // You can render a payment page or send order details as JSON
        res.json({ orderId: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error("Error creating donation order:", error);
        res.status(500).send("Something went wrong. Please try again.");
    }
});

module.exports = router;