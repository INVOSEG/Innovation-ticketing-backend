const SibApi = require("sib-api-v3-sdk");
const SibClient = SibApi.ApiClient.instance;

const apiInstance = new SibApi.TransactionalEmailsApi();
const sendSmtpEmail = new SibApi.SendSmtpEmail();

const {
  HOST,
  PORT,
  SESS_SECRET,
  NODE_ENV,
  CLIENT_PORT,
} = require("../../config/config");

// Authentication
SibClient.authentications["api-key"].apiKey = process.env.SIB_API_KEY;

const htmlTemplateReset = `
<!-- Free to use, HTML email template designed & built by FullSphere. Learn more about us at www.fullsphere.co.uk -->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->

  <!-- Your title goes here -->
  <title>Newsletter</title>
  <!-- End title -->

  <!-- Start stylesheet -->
  <style type="text/css">
    * {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: sans-serif;
      color: #192D36;
    }

    .container {
      max-width: 500px;
      margin: 0 auto;
    }

    a,
    a[href],
    a:hover,
    a:link,
    a:visited {
      /* This is the link colour */
      text-decoration: none !important;
      color: inherit;
    }

    .link {
      text-decoration: underline !important;
    }

    p,
    p:visited {
      /* Fallback paragraph style */
      font-size: 15px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: 300;
      text-decoration: none;
      color: #000000;
    }

    h1 {
      /* Fallback heading style */
      font-size: 22px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: normal;
      text-decoration: none;
      color: #000000;
    }

    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td {
      line-height: 100%;
    }

    .ExternalClass {
      width: 100%;
    }
  </style>
  <!-- End stylesheet -->

</head>

<!-- You can change background colour here -->

<body align="center">

  <!-- Fallback force center content -->
  <div class="container" style="text-align: center;">

    <!-- Start container for logo -->
    <table align="center" style="width: 100%; text-align: center; vertical-align: top;   background-color: #ffffff;">
      <tbody>
        <tr>
          <td style="width: 596px; vertical-align: top; padding-left: 0; padding-right: 0; padding-top: 15px; padding-bottom: 15px;" width="596">

            <!-- Your logo is here -->
            <h1>Beauty by Mandy</h1>

          </td>
        </tr>
      </tbody>
    </table>
    <!-- End container for logo -->

    <!-- Start unsubscribe section -->
    <table align="center" style="text-align: center; width: 100%; vertical-align: top;">
      <tbody>
        <tr>
          <td style="  vertical-align: top;">
            <h2 style="font-size: 18px; font-family: sans-serif; border-bottom: 1px solid #AFAEB1; padding-bottom: 22px; ">
            Reset Your Password 
            </h2>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Start unsubscribe section -->
    <table align="left" style="padding-top: 20px; text-align: left; vertical-align: top;">
      <tbody>
        <tr>
          <td>

            <p style="font-weight: bold">
            Hi John,
            </p>
            <div style="margin-top: 22px; font-size: 15px;">
            We’re sending you this email because you requested a password reset. Click on given below link to create a new password.<br><br>
          </div>
            </td>
           </tr>
 

         <tr>
          <td style="background-color: #DCB4BB; height:47px">
             <a href="reset-Link" style=" align-content: center; display: grid; color: white; text-align: center;border-radius: 8px;">
             Reset Password
            </a> 
          </td>
             </tr>
         <tr>
          <td>
   
                                
            
        
            
            <div style="margin-top: 30px;">
              <p>If you didn’t request a password reset, you can ignore this email. Your password will not be changed.</p><br>
              <p>Beauty by Mandy Team</p>
              
              </div>
         
          </td>
              </tr>
        </tr>
      </tbody>
    </table>
    <!-- End unsubscribe section -->

  </div>

</body>

</html>`;

const htmlTemplate = `
<!-- Free to use, HTML email template designed & built by FullSphere. Learn more about us at www.fullsphere.co.uk -->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->

  <!-- Your title goes here -->
  <title>Newsletter</title>
  <!-- End title -->

  <!-- Start stylesheet -->
  <style type="text/css">
    * {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: sans-serif;
      color: #192D36;
    }

    .container {
      max-width: 500px;
      margin: 0 auto;
    }

    a,
    a[href],
    a:hover,
    a:link,
    a:visited {
      /* This is the link colour */
      text-decoration: none !important;
      color: inherit;
    }

    .link {
      text-decoration: underline !important;
    }

    p,
    p:visited {
      /* Fallback paragraph style */
      font-size: 15px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: 300;
      text-decoration: none;
      color: #000000;
    }

    h1 {
      /* Fallback heading style */
      font-size: 22px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: normal;
      text-decoration: none;
      color: #000000;
    }

    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td {
      line-height: 100%;
    }

    .ExternalClass {
      width: 100%;
    }
  </style>
  <!-- End stylesheet -->

</head>

<!-- You can change background colour here -->

<body align="center">

  <!-- Fallback force center content -->
  <div class="container" style="text-align: center;">

    <!-- Start container for logo -->
    <table align="center" style="width: 100%; text-align: center; vertical-align: top;   background-color: #ffffff;">
      <tbody>
        <tr>
          <td style="width: 596px; vertical-align: top; padding-left: 0; padding-right: 0; padding-top: 15px; padding-bottom: 15px;" width="596">

            <!-- Your logo is here -->
            <h1>Beauty By</h1>
            <h4>Mandy</h4>

          </td>
        </tr>
      </tbody>
    </table>
    <!-- End container for logo -->

    <!-- Start unsubscribe section -->
    <table align="center" style="text-align: center; width: 100%; vertical-align: top;">
      <tbody>
        <tr>
          <td style="  vertical-align: top;">
            <h2 style="font-size: 18px; font-family: sans-serif; border-bottom: 1px solid #AFAEB1; padding-bottom: 22px; ">
            Reset your Password
            </h2>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Start unsubscribe section -->
    <table align="left" style="padding-top: 20px; text-align: left; vertical-align: top;">
      <tbody>
        <tr>
          <td>

            <p style="font-weight: bold">
              Hi John,
            </p>
            <p>
              Your email email-Here was used to reset the password reset for
              Beauty by Mandy.
            </p>
            <p style="text-align: center; margin-top: 22px; margin-bottom: 22px;">Click on the following link to reset your email address: </p>
            </td>
           </tr>
        
         <tr>
          <td style="background-color: #DCB4BB; height:47px">
             <a href="reset-Link" style=" align-content: center; display: grid; color: white; text-align: center;border-radius: 8px;">
              Verify Password
            </a> 
          </td>
             </tr>
         <tr>
          <td>
              <p style="margin-top: 22px; color: #192D36;">This link will expire in 24 hours.</p>
            
            
            <div style="margin-top: 22px; font-size: 15px;">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,
              <span style="display: block; color: #48B74B; text-decoration: underline;">info@beautybymandy</span></div>
            
            <div style="margin-top: 30px;">
              <p>Best regards,</p>
              <p>Beauty by Mandy</p></div>
         
          </td>
              </tr>
        </tr>
      </tbody>
    </table>
    <!-- End unsubscribe section -->

  </div>

</body>

</html>`;

const htmlTemplateEmailVerify = `
<!-- Free to use, HTML email template designed & built by FullSphere. Learn more about us at www.fullsphere.co.uk -->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->

  <!-- Your title goes here -->
  <title>Newsletter</title>
  <!-- End title -->

  <!-- Start stylesheet -->
  <style type="text/css">
    * {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: sans-serif;
      color: #192D36;
    }

    .container {
      max-width: 500px;
      margin: 0 auto;
    }

    a,
    a[href],
    a:hover,
    a:link,
    a:visited {
      /* This is the link colour */
      text-decoration: none !important;
      color: inherit;
    }

    .link {
      text-decoration: underline !important;
    }

    p,
    p:visited {
      /* Fallback paragraph style */
      font-size: 15px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: 300;
      text-decoration: none;
      color: #000000;
    }

    h1 {
      /* Fallback heading style */
      font-size: 22px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: normal;
      text-decoration: none;
      color: #000000;
    }

    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td {
      line-height: 100%;
    }

    .ExternalClass {
      width: 100%;
    }
  </style>
  <!-- End stylesheet -->

</head>

<!-- You can change background colour here -->

<body align="center">

  <!-- Fallback force center content -->
  <div class="container" style="text-align: center;">

    <!-- Start container for logo -->
    <table align="center" style="width: 100%; text-align: center; vertical-align: top;   background-color: #ffffff;">
      <tbody>
        <tr>
          <td style="width: 596px; vertical-align: top; padding-left: 0; padding-right: 0; padding-top: 15px; padding-bottom: 15px;" width="596">

            <!-- Your logo is here -->
            <h1>Beauty By</h1>
            <h4>Mandy</h4>

          </td>
        </tr>
      </tbody>
    </table>
    <!-- End container for logo -->

    <!-- Start unsubscribe section -->
    <table align="center" style="text-align: center; width: 100%; vertical-align: top;">
      <tbody>
        <tr>
          <td style="  vertical-align: top;">
            <h2 style="font-size: 18px; font-family: sans-serif; border-bottom: 1px solid #AFAEB1; padding-bottom: 22px; ">
            Verify your Email
            </h2>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Start unsubscribe section -->
    <table align="left" style="padding-top: 20px; text-align: left; vertical-align: top;">
      <tbody>
        <tr>
          <td>

            <p style="font-weight: bold">
            Hi John,
            </p>
            <div style="margin-top: 22px; font-size: 15px;">
            We’re happy you signed up for Beauty by Mandy services. To start exploring the Mandy services and to reach the top destinations of beauty & wellness, please confirm your email address.<br><br>
          </div>
            </td>
           </tr>
 

         <tr>
          <td style="background-color: #DCB4BB; height:47px">
             <a href="reset-Link" style=" align-content: center; display: grid; color: white; text-align: center;border-radius: 8px;">
             Verify Email
            </a> 
          </td>
             </tr>
         <tr>
          <td>
   
                                
            
            <div style="margin-top: 30px; font-size: 14px; color: #888;">
              <p>Welcome to Beauty by Mandy!</p>
              <p>The Mandy Team</p>
              <p>This verification link will expire in 24 hours.</p>
            </div>
            
          </td>
              </tr>
        </tr>
      </tbody>
    </table>
    <!-- End unsubscribe section -->

  </div>

</body>

</html>`;

const htmlTemplateBook = `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <title>Newsletter</title>
  <style type="text/css">
    * {
      margin: 0;
      padding: 0;
    }
    body {
      font-family: sans-serif;
      color: #192D36;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
    }
    a,
    a[href],
    a:hover,
    a:link,
    a:visited {
      text-decoration: none !important;
      color: inherit;
    }
    .link {
      text-decoration: underline !important;
    }
    p,
    p:visited {
      font-size: 15px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: 300;
      text-decoration: none;
      color: #000000;
    }
    h1 {
      font-size: 22px;
      line-height: 24px;
      font-family: 'Helvetica', Arial, sans-serif;
      font-weight: normal;
      text-decoration: none;
      color: #000000;
    }
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td {
      line-height: 100%;
    }
    .ExternalClass {
      width: 100%;
    }
  </style>
</head>
<body align="center">
  <div class="container" style="text-align: center;">
    <table align="center" style="width: 100%; text-align: center; vertical-align: top; background-color: #ffffff;">
      <tbody>
        <tr>
          <td style="width: 596px; vertical-align: top; padding-left: 0; padding-right: 0; padding-top: 15px; padding-bottom: 15px;" width="596">
          <img src="https://i.ibb.co/Hq0LzZk/logo.png" alt="Beauty By Mandy ">          </td>
        </tr>
      </tbody>
    </table>
    <table align="center" style="text-align: center; width: 100%; vertical-align: top;">
      <tbody>
        <tr>
          <td style="vertical-align: top;">
            <h2 style="font-size: 18px; font-family: sans-serif; border-bottom: 1px solid #AFAEB1; padding-bottom: 22px; ">
              APPOINTMENT TITLE 
            </h2>
          </td>
        </tr>
      </tbody>
    </table>
    <table align="left" style="padding-top: 20px; text-align: left; vertical-align: top;">
      <tbody>
        <tr>
          <td>
            <p style="font-weight: bold">
            Hi John,
            </p>
      
            <div style="margin-top: 22px; font-size: 15px;">
            Your booking with Beauty
            <br><br>
            <strong>Order Summary </strong><br>
            Business: Business_PLACEHOLDER
            <br>
            Service: SERVICE_PLACEHOLDER
            <br>
            Date: DATE_PLACEHOLDER
            <br>
            Time: TIME_PLACEHOLDER
            <br>
            Appointment confirmed with staff member.: STAFF-Name
            <br>
            <br>
            We look forward to seeing you soon.<br><br>
          </div>
            </div>
          </td>
        </tr>
        <tr>

        </tr>
        <tr>
          <td>
           
              <p>Best regards,</p>
              <p>Beauty by Mandy</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
`;

const emailRegistration = async (user, data) => {
  const verifyLink = `https://beautyparlor.qubitlab.net/account/email-verified?token=${data}`;

  const personalizedTemplate = htmlTemplateEmailVerify
    .replace("email-Here", `${user.email}`)
    .replace("reset-Link", `${verifyLink}`)
    .replace("Hi John", `Hi ${user.firstName}`);

  try {
    sendSmtpEmail.sender = { email: "usmanjamil196@gmail.com" };
    sendSmtpEmail.to = [{ email: user.email }];
    sendSmtpEmail.subject = "EMAIL VERIFICATION:";
    sendSmtpEmail.htmlContent = personalizedTemplate;
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (err) {
    console.error("Error sending email:", err);
    return err.message;
  }
};

const forgotPasswordEmail = async (user, data) => {
  //
  const resetLink = `https://beautyparlor.qubitlab.net/reset-password?token=${data}`;
  const personalizedTemplate = htmlTemplateReset
    .replace("email-Here", `${user.email}`)
    .replace("reset-Link", `${resetLink}`)
    .replace("Hi John", `Hi ${user.firstName}`);
  try {
    sendSmtpEmail.sender = { email: "usmanjamil196@gmail.com" };
    sendSmtpEmail.to = [{ email: user.email }];
    sendSmtpEmail.subject = "RESET PASSWORD";
    sendSmtpEmail.htmlContent = personalizedTemplate;
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (err) {
    console.error("Error sending email:", err);
    return err.message;
  }
};
const resetPassword = (email, data) => {
  //
  const tok = `https://beautyparlor.qubitlab.net/reset-password?token=${data}`;
  sgMail.send({
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: "Forgot Email",
    text: `Please click on that link to forgot passwor ${tok}`,
    html: `< strong > Please click on that link to forgot password ${tok} </strong > `,
  });
};

const bookEmail = async (customerData, slotValue) => {
  const time = tConvert(slotValue?.slots[0].startTime);

  let personalizedTemplate = htmlTemplateBook
    .replace("APPOINTMENT TITLE", `${customerData?.title}`)
    .replace("Hi John", `Hi ${customerData?.customerName}`)
    .replace("Your booking with Beauty", `${customerData?.description}`)
    .replace(
      "Service: SERVICE_PLACEHOLDER",
      `Service: ${customerData?.serviceName}`
    )
    .replace("Business_PLACEHOLDER", `${customerData?.businessName}`)
    .replace("Date: DATE_PLACEHOLDER", `Date: ${slotValue?.slots[0].startDate}`)
    .replace("Time: TIME_PLACEHOLDER", `Time: ${time}`)
    .replace("STAFF-Name", `${customerData?.staffName}`);

  // Business_PLACEHOLDER

  try {
    sendSmtpEmail.sender = { email: "usmanjamil196@gmail.com" };
    sendSmtpEmail.to = [{ email: `${customerData?.customerEmail}` }];
    sendSmtpEmail.subject = `${customerData?.title}`;
    sendSmtpEmail.htmlContent = personalizedTemplate;

    const emailData = await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (err) {
    console.error("Error sending email:", err);
    return err.message;
  }
};

function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? " AM" : " PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(""); // return adjusted time or original string
}

module.exports = {
  forgotPasswordEmail,
  resetPassword,
  emailRegistration,
  bookEmail,
};
