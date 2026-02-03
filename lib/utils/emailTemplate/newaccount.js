require("dotenv").config();
const logo = process.env.LOGO_URL;
const newAccount = (firstName, lastName, email, phoneNumber, country, city) => {
  return `
    <body style="width: 600px; margin: 0px auto; font-size: 16px;">
      <img src="cid:logo" alt="INNOVATION TECH logo" width="200" style="margin: 10px 0px;" />
      <p>Dear ${admin},</p>
      <p style="margin-top: 16px;">A new agency has requested to create account with follow ing details </p>
      <ul>
        <li>name: ${firstName} ${lastName}</li>
        <li>email: ${email}</li>
        <li>email: ${phoneNumber}</li>
        <li>email: ${country}</li>
        <li>email: ${city}</li>
      </ul>
      <p>Thank you for your attention.</p>
      <p>Best regards,</p>
      <p style="margin-top: 10px; font-weight: 600;">Fly Tech Group</p>
    </body>
  `;
};

module.exports = {
  newAccount,
};
