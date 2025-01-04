const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Use true for port 465 (SSL/TLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// const mailOptions = {
//   from: process.env.SENDER_EMAIL,
//   to: "philipmaulidi@yahoo.com", // Replace with a valid email address
//   subject: "Test Email",
//   text: "This is a test email from Nodemailer.",
// };

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error("Error sending email:", error);
//   } else {
//     console.log("Email sent successfully:", info.response);
//   }
// });

module.exports = transporter;
