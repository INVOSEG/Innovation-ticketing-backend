require("dotenv").config();
const SABRE_URL = process.env.SABRE;
const AMADEUS_URL = process.env.AMADEUS_URL;
const SABRE_PCC = process.env.SABRE_PCC;
const Company_Code = process.env.Company_Code;
const AMADEUS_CURRENCY = process.env.AMADEUS_CURRENCY;
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_PORT: process.env.CLIENT_PORT,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  DB_URI: process.env.DB_URI,
  SESS_SECRET: process.env.SESS_SECRET,
  COOKIE_NAME: process.env.COOKIE_NAME,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  AMADEUS: {
    CLIENT_ID: process.env.AMADEUS_CLIENT_ID,
    CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET,
    TOKEN_URL: `${AMADEUS_URL}/v1/security/oauth2/token`,
    BASE_URL: `${AMADEUS_URL}/v2`,
    Company_Code: `${Company_Code}`,
    URL: `${AMADEUS_URL}/v1`,
    CURRENCY: `${AMADEUS_CURRENCY}`,
  },
  SABRE: {
    CLIENT_ID: process.env.SABRE_CLIENT_ID,
    CLIENT_SECRET: process.env.SABRE_CLIENT_SECRET,
    TOKEN_URL: `${SABRE_URL}/v2/auth/token`,
    BASE_URL: `${SABRE_URL}`,
    SABRE_PCC: `${SABRE_PCC}`,
    SABRE_IMPORTPNR: process.env.IMPORTSABRE,
    SOAP_URL: process.env.SABRE_SOAP_URL || "https://webservices.havail.sabre.com",
  },
  HITIT: {
    USERNAME: process.env.HITIT_USERNAME,
    PASSWORD: process.env.HITIT_PASSWORD,
    BASE_URL: process.env.HITIT_BASE_URL,
    AGENCY_ID: process.env.HITIT_AGENCY_ID,
    EMAIL: process.env.HITIT_EMAIL,
    AGENCY_NAME: process.env.HITIT_AGENCY_NAME,
  },
};
