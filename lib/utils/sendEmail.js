const nodemailer = require("nodemailer");
require("dotenv").config();
const twilio = require("twilio");

const sender_name = process.env.MAILER_NAME;
const sender_email = process.env.MAILER_EMAIL;
const sender_password = process.env.MAILER_PASSWORD;
const mail_domain = "smtp.hostinger.com";
// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number

// Sender mail server config from hostinger
// const transporter = nodemailer.createTransport({
//   host: mail_domain,
//   secure: true, // if not written it will mark the email as spam and microsoft will not show this emailin the inbox
//   port: 465,
//   auth: {
//     user: sender_email,
//     pass: sender_password,
//   },
// });

// const sendEmail = async (email, subject, content) => {
//   try {
//     console.log("sender_email:", sender_email, sender_password);

//     const mailOptions = {
//       from: `${sender_name} <${sender_email}>`,
//       to: email,
//       subject: subject,
//       html: content,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Failed to send email: ", error);
//   }
// };

const transporter = nodemailer.createTransport({
  host: "mail.alsaboor.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: sender_email,
    pass: sender_password,
  },
});

const sendEmail = async (email, subject, content) => {
  try {
    console.log("sender_email:", sender_email, sender_password);
    let logoImage = process.env.LOGO_URL;

    const mailOptions = {
      from: `${sender_name} <${sender_email}>`,
      to: email,
      subject: subject,
      html: content,
      attachments: [
        {
          filename: "alsaboor-logo.png",
          path: logoImage,
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email: ", error);
  }
};

const sendCustomEmail = async (emails, subject, content) => {
  try {
    const emailString = emails.join(", ");

    const mailOptions = {
      from: `${sender_name} <${sender_email}>`,
      to: emailString,
      subject: subject,
      html: content,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email: ", error);
  }
};

// Function to send WhatsApp message
const sendWhatsAppMessage = async (to, message) => {
  try {
    const msg = await twilioClient.messages.create({
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(
      "WhatsApp message sent: ",
      msg.sid,
      "from",
      twilioWhatsAppNumber,
      "to",
      to,
      "message",
      message
    );
  } catch (error) {
    console.error("Failed to send WhatsApp message: ", error);
  }
};

module.exports = {
  sendEmail,
  sendCustomEmail,
  sendWhatsAppMessage,
};
