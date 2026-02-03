const { AMADEUS } = require("../../config/config");
const { appendToFile } = require("../../lib/utils/fileUtils"); // Import the file utility
const fetch = require("node-fetch");

let accessToken = "";
let tokenExpiryTime = 0;

async function getToken() {
  const requestBody = new URLSearchParams({
    client_id: AMADEUS.CLIENT_ID,
    client_secret: AMADEUS.CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const response = await fetch(AMADEUS.TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
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
}

async function ensureToken() {
  if (!accessToken || Date.now() >= tokenExpiryTime) {
    await getToken();
  }
}

async function fetchFlightData(flightUrl) {
  await ensureToken();

  try {
    const response = await fetch(flightUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch flight data. Status: ${response.status}`
      );
    }

    const flightData = await response.json();

    // Save the flight data to a file
    appendToFile("flightData.log", { flightUrl, data: flightData });

    return flightData;
  } catch (error) {
    throw new Error(`Failed to fetch flight data: ${error.message}`);
  }
}

async function postFlightData(flightUrl, requestData) {
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
      throw new Error(`Failed to post flight data. Status: ${response.status}`);
    }

    const flightData = await response.json();

    // Save the flight data to a file
    appendToFile("flightData.log", {
      flightUrl,
      requestData,
      response: flightData,
    });

    return flightData;
  } catch (error) {
    throw new Error(`Failed to post flight data: ${error.message}`);
  }
}

module.exports = {
  fetchFlightData,
  postFlightData,
};
