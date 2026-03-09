require("dotenv").config();
const logo = process.env.LOGO_URL;
const email = process.env.MAILER_EMAIL;

const otpReceivedTemplate = (name, otp) => {
  return `
      <body style="width: 600px; margin: 0px auto; font-size: 16px;">
        <img  src="cid:logo" alt="Al-Saboor logo" width="200" style="margin: 10px 0px;" />
        <p>Dear ${name},</p>
        <p style="margin-top: 16px;">Your OTP (One-Time Password) for account verification is:</p>
        <p style="font-size: 24px; font-weight: bold; margin: 20px 0px;">${otp}</p>
        <p>Please use this OTP to complete your verification process. This OTP is valid for the next 5 minutes.</p>
        <p>If you did not request this OTP, please contact our support team immediately at <a href="mailto:${email}">${email}</a>.</p>
        <p>Thank you for your attention.</p>
        <p>Best regards,</p>
        <p style="margin-top: 10px; font-weight: 600;">Fly Tech Group</p>
      </body>
    `;
};
module.exports = {
  otpReceivedTemplate,
};
