require("dotenv").config();
const logo = process.env.LOGO_URL;
const email = process.env.MAILER_EMAIL;
const forgetPassword = (name, link) => {
  return `
    <body style="width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="text-align: center; padding-bottom: 20px;">
            <img crossorigin="anonymous"  src="cid:logo"  alt="Al-Saboor logo" width="200" style="margin: 20px 0;" />
          </td>
        </tr>
        <tr>
          <td>
            <p style="font-size: 18px; color: #333;">Dear ${name},</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin-top: 16px;">
              Please <a href="${link}" target="_blank" style="color: #007BFF; text-decoration: none;">click here</a> to reset your Password.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin-top: 16px;">
              The link will expire in 1 hour.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin-top: 16px;">
              For assistance or concerns, please contact our support team at 
              <a href="mailto:${email}" style="color: #007BFF; text-decoration: none;">${email}</a>.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin-top: 16px;">
              Thank you for your attention.
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 24px;">
              Best regards,
            </p>
            <p style="font-size: 16px; font-weight: 600; color: #333; margin-top: 10px;">
              Fly Tech Group
            </p>
          </td>
        </tr>
      </table>
    </body>
  `;
};

module.exports = {
  forgetPassword,
};
