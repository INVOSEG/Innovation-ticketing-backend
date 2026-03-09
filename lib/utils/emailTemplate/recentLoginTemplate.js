require("dotenv").config();
const logo = process.env.LOGO_URL;
const email = process.env.MAILER_EMAIL;

const recentLoginTemplate = (name, loginDetails) => {
  return `
    <body style="width: 600px; margin: 0 auto; font-size: 16px; font-family: Arial, sans-serif;">
      <img   src="cid:logo"  alt="Al-Saboor logo" width="200" style="margin: 10px 0px;" />
      <p>Dear ${name},</p>
      <p style="margin-top: 16px;">We have detected a recent login on your account. Below are the login details:</p>

      <pre style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
      ${loginDetails}
      </pre>

      <p style="margin-top: 16px;">If this was you, no further action is needed. However, if you did not initiate this login, please take the following steps:</p>
      <ul>
        <li>🔑 <strong>Reset Your Password:</strong> To ensure your account's security, update your password immediately.</li>
        <li>🔍 <strong>Review Account Activity:</strong> Check for any unfamiliar activity in your account.</li>
      </ul>
      <p>For assistance or concerns, please contact our support team at <a href="mailto:${email}">${email}</a>.</p>
      <p>Thank you for your attention.</p>
      <p>Best regards,</p>
      <p style="margin-top: 10px; font-weight: 600;">Fly Tech Group</p>
    </body>
  `;
};

module.exports = {
  recentLoginTemplate,
};
