const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { google } = require("googleapis");
const { Readable } = require('stream');
const Razorpay = require("razorpay");
const sendPaymentConfirmationEmail = require("./email");
const upload = multer({ storage: multer.memoryStorage() });

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../keyGoogle.json"),
    scopes: SCOPES
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = process.env.SHEET_ID;
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

// ✅ Ensure Header Exists (Run Once at Startup)
async function ensureHeaderExists() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Sheet1!A1:Z1"
        });

        if (!response.data.values || response.data.values.length === 0) {
            const headerRow = [[
                "Aadhaar No.", "Name", "Email", "Mobile", "Whatsapp No.",
                "Father's Income", "Address", "City", "State", "Pincode",
                "School Name", "School Address", "School City", "School Type",
                "School Board", "School Medium", "Roll Number", "9th Marks",
                "Best Subject", "Weakest Subject", "Stream",
                "Career Aspirations", "Files Uploaded", "Payment ID", "Payment Status"
            ]];

            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: "Sheet1!A1",
                valueInputOption: "RAW",
                requestBody: { values: headerRow }
            });
        }
    } catch (error) {
        console.error("❌ Error ensuring header exists:", error);
    }
}

// Run header check at startup
ensureHeaderExists();

// ✅ Optimize Duplicate Aadhaar Check
router.get("/check-duplicate/:aadhaar", async (req, res) => {
    try {
        const aadhaar = req.params.aadhaar;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Sheet1!A:A"
        });

        const exists = response.data.values?.some(row => row[0] === aadhaar) || false;
        res.json({ exists });

    } catch (error) {
        console.error("❌ Error checking duplicate:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// ✅ Create Razorpay Order
router.post("/create-order", async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: 250 * 100,
            currency: "INR",
            receipt: `receipt#${Date.now()}`
        });

        res.json({ success: true, id: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY_ID });

    } catch (error) {
        console.error("❌ Error Creating Order:", error);
        res.status(500).json({ success: false });
    }
});

// ✅ Handle Form Submission (Optimized)
router.post("/submit", upload.any(), async (req, res) => {
    try {
        const {
            firstName, middleName, lastName, email, mobile,
            whatsapp, aadhaar, fatherIncome, address, city, state,
            pincode, schoolName, schoolAddress, schoolCity,
            schoolType, schoolBoard, schoolMedium, rollNumber,
            ninthMarks, bestSubject, weakestSubject, stream,
            careerAspirations, payment_id
        } = req.body;

        const files = req.files;
        if (!aadhaar) return res.status(400).json({ success: false, error: "Aadhaar is required." });

        // ✅ Verify Payment
        const payment = await razorpay.payments.fetch(payment_id);
        if (payment.status !== "captured") {
            return res.status(400).json({ success: false, error: "Payment not verified. Please complete payment first." });
        }

        // ✅ Create Folder in Google Drive
        const folderResponse = await drive.files.create({
            requestBody: { name: aadhaar, mimeType: "application/vnd.google-apps.folder" },
            fields: "id"
        });

        await drive.permissions.create({
            fileId: folderResponse.data.id,
            requestBody: { role: "reader", type: "anyone" }
        });

        const folderId = folderResponse.data.id;

        // ✅ Upload Files in Parallel
        const fileUploadPromises = files.map(file => {
            const stream = new Readable();
            stream.push(file.buffer);
            stream.push(null);

            return drive.files.create({
                requestBody: { name: file.originalname, parents: [folderId] },
                media: { mimeType: file.mimetype, body: stream }
            }).then(response => `https://drive.google.com/file/d/${response.data.id}/view`);
        });

        const fileUrls = await Promise.all(fileUploadPromises);

        // ✅ Append Data to Google Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [[
                    aadhaar, `${firstName} ${middleName} ${lastName}`,
                    email, mobile, whatsapp, fatherIncome,
                    address, city, state, pincode, schoolName,
                    schoolAddress, schoolCity, schoolType,
                    schoolBoard, schoolMedium, rollNumber,
                    ninthMarks, bestSubject, weakestSubject,
                    stream, careerAspirations, fileUrls.join("\n"),
                    payment_id, "✅ Paid"
                ]]
            }
        });

        // ✅ Send Confirmation Email
        sendPaymentConfirmationEmail(email, {
            name: `${firstName} ${middleName} ${lastName}`,
            paymentId: payment_id,
            amount: "₹250",
            fileUrls
        });

        res.json({ success: true, message: "✅ Registration Successful." });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
