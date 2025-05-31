const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // Your Gmail address
    pass: process.env.EMAIL_PASS      // App password or actual password
  }
});

function sendPaymentConfirmationEmail(to, { name, paymentId, amount, fileUrls }) {
  const htmlContent = `
    <h2>🎉 Thank you, ${name}!</h2>
    <p>Your payment of <strong>${amount}</strong> has been successfully received.</p>
    <p><strong>Payment ID:</strong> ${paymentId}</p>
    <p>Your documents:</p>
    <ul>
      ${fileUrls.map(url => `<li><a href="${url}">${url}</a></li>`).join("")}
    </ul>
    <p>All the best for your application!</p>
  `;

  return transporter.sendMail({
    from: `"Kalyan Scholarship" <${process.env.EMAIL_USER}>`,
    to,
    subject: "✅ Payment Confirmation & Documents Uploaded",
    html: htmlContent
  });
}

module.exports = sendPaymentConfirmationEmail;
