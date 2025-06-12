const express = require("express");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ✅ Load Firebase Admin SDK
const serviceAccount = require("../keyFirebase.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const auth = admin.auth();
const actionCodeSettings = {
    url: "https://kalyangcg.in/login", // <-- your live domain
    handleCodeInApp: false
};
// 🔹 Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY || "YOUR_SECRET_KEY";

// 🟢 SIGNUP Route (Storing Name in Firestore & Sending Email Verification)
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        try {
            await auth.getUserByEmail(email);
            return res.status(400).json({ success: false, message: "Email already in use." });
        } catch (error) {
            if (error.code !== "auth/user-not-found") {
                return res.status(500).json({ success: false, message: "Error checking email." });
            }
        }

        // 🔹 Create User in Firebase Authentication
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name
        });

        // 🔹 Store user data in Firestore
        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            name,
            email,
            emailVerified: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // ✅ FIXED: Use Firebase Admin SDK to send an email verification link
        const actionCodeSettings = {
            url: "https://kalyangcg.in/login", // Change this to your actual login page URL
            handleCodeInApp: false
        };
        const verificationLink = await auth.generateEmailVerificationLink(email, actionCodeSettings);

        // Return verification link (for testing)
        res.json({
            success: true,
            message: "User registered successfully! Please check your email for verification.",

        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Signup failed." });
    }
});

// 🟢 LOGIN Route (Must authenticate from frontend)
router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required!" });
        }

        try {
            const firebaseUser = await auth.getUserByEmail(email);

            if (!firebaseUser.emailVerified) {
                return res.status(400).json({ success: false, message: "Please verify your email first." });
            }

            // 🔹 Fetch Name from Firestore
            const userDoc = await db.collection("users").doc(firebaseUser.uid).get();
            const userData = userDoc.exists ? userDoc.data() : { name: "User" };

            // 🔹 Generate JWT token
            const token = jwt.sign({ uid: firebaseUser.uid, email: firebaseUser.email }, SECRET_KEY, { expiresIn: "1h" });

            res.json({ 
                success: true, 
                token, 
                user: { uid: firebaseUser.uid, email: firebaseUser.email, name: userData.name },
                message: "Login successful!" 
            });

        } catch (error) {
            console.error("Login Error:", error);
            return res.status(400).json({ success: false, message: "Invalid email." });
        }

    } catch (error) {
        console.error("Error in login route:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
