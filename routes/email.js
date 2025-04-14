const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Email Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Function To Send Payment Confirmation Email
async function sendPaymentConfirmationEmail(userEmail, name, aadhaar, payment_id, fileUrls) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "✅ Registration Successful - Kalyan Charitable Trust",
        html: `
        <h2>✅ Your Registration Is Successful</h2>
        <p>Dear ${name},</p>
        <p>We have successfully received your application for scholarship registration.</p>
        <h3>Application Details:</h3>
        <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Aadhaar No.:</strong> ${aadhaar}</li>
            <li><strong>Payment ID:</strong> ${payment_id}</li>
            <li><strong>Documents Folder:</strong> <a href="${fileUrls}" target="_blank">Click Here</a></li>
        </ul>
        <p>✅ You will receive a response from our team soon. Thank you for applying.</p>
        <hr>
        <p><strong>Kalyan Educational and Charitable Trust</strong></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email Sent Successfully.");
    } catch (error) {
        console.error("❌ Error Sending Email:", error);
    }
}

module.exports = sendPaymentConfirmationEmail;
