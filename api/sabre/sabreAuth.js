require("dotenv").config();
const { v4 } = require("uuid");
const fetch = require("node-fetch");
const { SABRE } = require("../../config/config");
let accessToken = "";
let tokenExpiryTime = 0;

const generateAuthString = async (user, group, domain, password) => {
  const epr = `V1:${user}:${group}:${domain}`;

  const base64EPR = Buffer.from(epr).toString("base64");
  const base64Password = Buffer.from(password).toString("base64");

  const finalAuthString = Buffer.from(
    `${base64EPR}:${base64Password}`
  ).toString("base64");

  return finalAuthString;
};
const getToken = async () => {
  try {
    const requestBody = new URLSearchParams({
      client_id: process.env.SABRE_CLIENT_ID,
      client_secret: process.env.SABRE_CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    const id = process.env.SABRE_CLIENT_ID;
    const password = process.env.SABRE_CLIENT_SECRET;
    const pcc = process.env.SABRE_PCC;
    const authString = await generateAuthString(id, pcc, "AA", password);
    console.log(authString);

    const response = await fetch(process.env.SABRE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authString}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }

    const tokenData = await response.json();

    accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in;

    tokenExpiryTime = Date.now() + (expiresIn - 100) * 1000;

    setTimeout(getToken, (expiresIn - 100) * 1000);
  } catch (error) {
    console.log("Error fetching access token:", error);
    throw new Error("Failed to fetch access token");
  }
};

const ensureToken = async () => {
  if (!accessToken || Date.now() >= tokenExpiryTime) {
    await getToken();
  }
};

const postFlightData = async (flightUrl, requestData) => {
  await ensureToken();
  try {
    const response = await fetch(flightUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      const errorDetails = await response.text();

      throw new Error(`Failed to post flight data. Status: ${errorDetails}`);
    }

    const flightData = await response.json();
    return flightData;
  } catch (error) {
    throw new Error(`Failed to post flight data: ${error}`);
  }
};

module.exports = {
  postFlightData,
  ensureToken,
  getAccessToken: () => accessToken,
  getToken,
};
