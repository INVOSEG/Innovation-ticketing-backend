require("dotenv").config();
const fetch = require("node-fetch");
const { SABRE } = require("../../config/config");
const xml2js = require("xml2js");

/**
 * Creates a SOAP session with Sabre and returns the security token
 * @returns {Promise<string>} Binary security token for SOAP requests
 */
async function createSoapSession() {
  try {
    const username = process.env.SABRE_SOAP_CLIENT_ID;
    const password = process.env.SABRE_SOAP_CLIENT_SECRET;
    const organization = process.env.SABRE_SOAP_PCC;

    const request = `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Header>
            <MessageHeader xmlns="http://www.ebxml.org/namespaces/messageHeader">
                <From>
                    <PartyId>Agency</PartyId>
                </From>
                <To>
                    <PartyId>Sabre_API</PartyId>
                </To>
                <ConversationId>2021.01.DevStudio</ConversationId>
                <Action>SessionCreateRQ</Action>
            </MessageHeader>
            <Security xmlns="http://schemas.xmlsoap.org/ws/2002/12/secext">
                <UsernameToken>
                    <Username>${username}</Username>
                    <Password>${password}</Password>
                    <Organization>${organization}</Organization>
                    <Domain>DEFAULT</Domain>
                </UsernameToken>
            </Security>
        </SOAP-ENV:Header>
        <SOAP-ENV:Body>
            <SessionCreateRQ returnContextID="true" Version="1.0.0" xmlns="http://www.opentravel.org/OTA/2002/11"/>
        </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;
    const soapUrl =
      process.env.SABRE_SOAP_URL ||
      SABRE.SOAP_URL ||
      "https://webservices.havail.sabre.com";

    const response = await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "SessionCreateRQ",
      },
      body: request,
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(
        `SOAP Session creation failed: ${response.status} ${response.statusText}\n${responseText},:::::::::${request}`,
      );
    }

    // Try to extract token using regex as fallback
    const tokenMatch = responseText.match(
      /<wsse:BinarySecurityToken[^>]*>([^<]+)<\/wsse:BinarySecurityToken>/,
    );
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1].trim();
    }

    // Try XML parsing
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitCharkey: false,
      trim: true,
      normalize: true,
      ignoreAttrs: false,
    });

    const result = await parser.parseStringPromise(responseText);

    // Extract BinarySecurityToken from response - try multiple paths
    let securityToken = null;

    // Try different possible paths in the XML structure
    const paths = [
      result?.["soap-env:Envelope"]?.["soap-env:Header"]?.["wsse:Security"]?.[
      "wsse:BinarySecurityToken"
      ],
      result?.["soap-env:Envelope"]?.["soap-env:Header"]?.["wsse:Security"]?.[
        "wsse:BinarySecurityToken"
      ]?._,
      result?.["soap-env:Envelope"]?.["soap-env:Header"]?.[0]?.[
      "wsse:Security"
      ]?.[0]?.["wsse:BinarySecurityToken"]?.[0],
      result?.["soap-env:Envelope"]?.["soap-env:Header"]?.[0]?.[
        "wsse:Security"
      ]?.[0]?.["wsse:BinarySecurityToken"]?.[0]?._,
    ];

    for (const path of paths) {
      if (path && typeof path === "string") {
        securityToken = path;
        break;
      } else if (path && path._) {
        securityToken = path._;
        break;
      }
    }

    if (!securityToken) {
      console.error("SOAP Response:", responseText);
      throw new Error("Failed to extract security token from SOAP response");
    }

    return securityToken;
  } catch (error) {
    console.error("Error creating SOAP session:", error);
    throw new Error(`Failed to create SOAP session: ${error.message}`);
  }
}

/**
 * Closes a SOAP session with Sabre
 * @param {string} sessionToken - Binary security token from the session
 * @returns {Promise<void>}
 */
async function closeSoapSession(sessionToken) {
  try {
    const request = `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Header>
            <MessageHeader xmlns="http://www.ebxml.org/namespaces/messageHeader">
                <From>
                    <PartyId>Agency</PartyId>
                </From>
                <To>
                    <PartyId>Sabre_API</PartyId>
                </To>
                <ConversationId>2021.01.DevStudio</ConversationId>
                <Action>SessionCloseRQ</Action>
            </MessageHeader>
            <Security xmlns="http://schemas.xmlsoap.org/ws/2002/12/secext">
                <BinarySecurityToken EncodingType="Base64Binary" valueType="String">${sessionToken}</BinarySecurityToken>
            </Security>
        </SOAP-ENV:Header>
        <SOAP-ENV:Body>
            <SessionCloseRQ xmlns="http://www.opentravel.org/OTA/2002/11"/>
        </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    const soapUrl =
      process.env.SABRE_SOAP_URL ||
      SABRE.SOAP_URL ||
      "https://webservices.havail.sabre.com";

    await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "SessionCloseRQ",
      },
      body: request,
    });
  } catch (error) {
    // Log but don't throw - session close is best effort
    console.warn("Warning: Failed to close SOAP session:", error.message);
  }
}

/**
 * Formats date to Sabre format (DDMMMYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatSabreDate(date) {
  if (!date) return "";

  // If already in Sabre format (e.g., "21DEC21"), return as is
  if (typeof date === "string" && /^\d{2}[A-Z]{3}\d{2}$/.test(date.trim())) {
    return date.trim();
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "";
  }

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
}

/**
 * Formats date-time to Sabre format (DDMMMYY/HHMM)
 * @param {string|Date} dateTime - Date-time to format
 * @returns {string} Formatted date-time string
 */
function formatSabreDateTime(dateTime) {
  if (!dateTime) return "";
  const d = new Date(dateTime);
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}${month}${year}/${hours}${minutes}`;
}

/**
 * Formats date to ISO format for SOAP XML (YYYY-MM-DDTHH:mm:ss)
 * @param {string|Date} dateTime - Date-time to format
 * @returns {string} ISO formatted date-time string
 */
function formatISODateTime(dateTime) {
  if (!dateTime) return "";

  // If already in ISO format, return as is
  if (
    typeof dateTime === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateTime)
  ) {
    return dateTime;
  }

  const d = new Date(dateTime);
  if (isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Sanitizes fare basis code to match Sabre pattern [A-Z0-9]+(/[A-Z0-9]+)?
 * Removes dots and other invalid characters, converts to uppercase
 * @param {string} fareBasisCode - Fare basis code to sanitize
 * @param {string} bookingClass - Optional booking class to prepend if not present
 * @returns {string} Sanitized fare basis code
 */
function sanitizeFareBasisCode(fareBasisCode, bookingClass = null) {
  if (!fareBasisCode) return "";

  // Convert to uppercase and remove invalid characters
  // Keep only A-Z, 0-9, and / (slash)
  // Pattern: [A-Z0-9]+(/[A-Z0-9]+)?
  let sanitized = fareBasisCode.toUpperCase();

  // Replace dots with nothing (remove them)
  sanitized = sanitized.replace(/\./g, "");

  // Remove any other invalid characters (keep only A-Z, 0-9, /)
  sanitized = sanitized.replace(/[^A-Z0-9/]/g, "");

  // If booking class is provided and fare basis doesn't start with a letter (likely booking class),
  // prepend the booking class
  if (bookingClass && sanitized && /^[0-9]/.test(sanitized)) {
    const classCode = bookingClass.toUpperCase().charAt(0);
    // Only prepend if it doesn't already start with that class
    if (!sanitized.startsWith(classCode)) {
      sanitized = classCode + sanitized;
    }
  }

  return sanitized;
}

/**
 * Formats date to ISO format for SOAP XML (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
function formatISODate(date) {
  if (!date) return "";

  // If already in ISO date format, return as is
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    return date.trim();
  }

  // If it's in ISO datetime format, extract just the date part
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}T/.test(date.trim())) {
    return date.trim().split("T")[0];
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Adds days to a YYYY-MM-DD string and returns YYYY-MM-DD.
 * @param {string} dateStr
 * @param {number} days
 */
function addDays(dateStr, days = 0) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + Number(days || 0));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Normalize a time string to HH:MM:SS (strips offsets or trailing Z).
 * @param {string} timeStr
 */
function normalizeTime(timeStr = "") {
  if (!timeStr) return "";
  // Remove trailing Z or timezone offsets like +04:00 / -05:30
  const noOffset = timeStr.split(/[+-]/)[0].replace(/Z$/i, "");
  // Some times may already be HH:MM:SS; take first 8 chars to be safe
  return noOffset.substring(0, 8);
}

/**
 * Build flight details + fare bases from Sabre groupedItineraryResponse.
 * Works for roundtrip and multi-city itineraries that carry fare component refs.
 * @param {Object} groupedItineraryResponse
 * @returns {{flightDetails: Array, validatingCarrier: string, paxCounts: {ADT:number,CNN:number,INF:number}}}
 */
function buildFareRulesFromGroupedItineraryResponse(
  groupedItineraryResponse = {},
) {
  const itineraryGroups = groupedItineraryResponse?.itineraryGroups || [];
  const firstGroup = itineraryGroups[0] || {};
  const currentItinerary =
    (firstGroup.itineraries || []).find((it) => it.currentItinerary) ||
    (firstGroup.itineraries || [])[0];

  if (!currentItinerary) {
    return { flightDetails: [], validatingCarrier: "", paxCounts: {} };
  }

  const fare =
    currentItinerary?.pricingInformation?.[0]?.fare ||
    currentItinerary?.pricingInformation?.[0] ||
    {};
  const validatingCarrier = fare?.validatingCarrierCode || "";

  const passengerInfo =
    fare?.passengerInfoList?.[0]?.passengerInfo ||
    fare?.passengerInfoList?.[0] ||
    {};
  const fareComponents = passengerInfo?.fareComponents || [];
  const paxCounts = {
    ADT:
      (passengerInfo?.passengerType === "ADT"
        ? passengerInfo?.passengerNumber
        : 0) ||
      passengerInfo?.count ||
      1,
    CNN: 0,
    INF: 0,
  };

  const fareComponentDescs = new Map();
  (groupedItineraryResponse?.fareComponentDescs || []).forEach((fc) => {
    fareComponentDescs.set(fc.id, fc);
  });

  // Build per-segment fare component data in travel order to keep booking code + basis aligned.
  const segmentComponentData = [];
  fareComponents.forEach((fc, idx) => {
    const desc = fareComponentDescs.get(fc.ref) || {};
    const fareBasisCode =
      desc.fareBasisCode || desc.FareBasisCode || fc.fareBasisCode || "";
    const bookingCode =
      fc?.segments?.[0]?.segment?.bookingCode ||
      fc?.segments?.[0]?.segment?.BookingCode ||
      "Y";
    const componentNumber = idx + 1;

    const segmentCount = (fc.segments || []).filter((s) => s.segment).length;
    for (let i = 0; i < Math.max(segmentCount, 1); i += 1) {
      segmentComponentData.push({
        fareBasisCode,
        bookingCode,
        componentNumber,
      });
    }
  });

  // Build segment list from legs/schedules
  const scheduleMap = new Map();
  (groupedItineraryResponse?.scheduleDescs || []).forEach((s) =>
    scheduleMap.set(s.id, s),
  );

  const legMap = new Map();
  (groupedItineraryResponse?.legDescs || []).forEach((l) =>
    legMap.set(l.id, l),
  );

  const legDescriptions =
    firstGroup?.groupDescription?.legDescriptions ||
    groupedItineraryResponse?.groupDescription?.legDescriptions ||
    [];

  const segments = [];
  let segmentIdx = 0;

  (currentItinerary?.legs || []).forEach((leg, legIdx) => {
    const legDesc = legMap.get(leg.ref) || {};
    const baseDate = legDescriptions[legIdx]?.departureDate || "";

    (legDesc.schedules || []).forEach((schedRefObj) => {
      const refId = schedRefObj?.ref || schedRefObj;
      const sched = scheduleMap.get(refId) || {};
      const depAdjust = schedRefObj?.departureDateAdjustment || 0;
      const depDate = addDays(baseDate, depAdjust);
      const depTime = normalizeTime(sched?.departure?.time || "");
      const arrTime = normalizeTime(sched?.arrival?.time || depTime);

      const depDateTime = depTime ? `${depDate}T${depTime}` : "";
      let arrDate = depDate;
      if (depTime && arrTime) {
        const dep = new Date(depDateTime.replace("Z", "+00:00"));
        const arrCandidate = new Date(
          `${depDate}T${arrTime}`.replace("Z", "+00:00"),
        );
        if (
          !isNaN(dep) &&
          !isNaN(arrCandidate) &&
          arrCandidate.getTime() < dep.getTime()
        ) {
          arrDate = addDays(depDate, 1);
        }
      }
      const arrDateTime = arrTime ? `${arrDate}T${arrTime}` : "";

      const component =
        segmentComponentData[segmentIdx] ||
        segmentComponentData[segmentComponentData.length - 1] ||
        {};

      // Carrier fallbacks: prefer marketing, else operating, else validating carrier, else YY (placeholder)
      const marketingCode =
        sched?.carrier?.marketing ||
        sched?.carrier?.operating ||
        validatingCarrier ||
        (fare?.governingCarriers
          ? String(fare.governingCarriers).split(" ")[0]
          : "") ||
        "YY";

      segments.push({
        DepartureDate: depDateTime,
        ArrivalDate: arrDateTime,
        BookingDate: depDate,
        FlightNumber:
          sched?.carrier?.marketingFlightNumber ||
          sched?.carrier?.operatingFlightNumber ||
          "",
        DepartureAirport: sched?.departure?.airport || "",
        ArrivalAirport: sched?.arrival?.airport || "",
        MarketingAirline: marketingCode || "YY",
        ResBookDesigCode: component.bookingCode || "Y",
        farebase: [
          {
            FareBasisCode: component.fareBasisCode || "",
            FareComponentNumber: component.componentNumber || segmentIdx + 1,
            PassengerType: passengerInfo?.passengerType || "ADT",
          },
        ],
      });

      segmentIdx += 1;
    });
  });

  return {
    flightDetails: segments,
    validatingCarrier,
    paxCounts,
    segmentComponentData,
  };
}

/**
 * Derives fare component numbers for each flight segment.
 * Tries to respect explicit direction indicators before falling back
 * to time-gap based grouping (helps separate outbound vs inbound legs).
 * @param {Array} flights
 * @returns {Array<number>}
 */
function deriveFareComponentNumbers(flights = []) {
  if (!Array.isArray(flights) || flights.length === 0) {
    return [];
  }

  const assignments = new Array(flights.length).fill(null);
  const directionMap = new Map();

  const getDirectionKey = (flight) =>
    flight?.fareConstructionDirection ||
    flight?.direction ||
    flight?.Direction ||
    flight?.directionKey ||
    flight?.directionId ||
    flight?.OriginDestinationRPH ||
    flight?.originDestinationRPH ||
    flight?.originDestinationId ||
    flight?.itineraryId ||
    flight?.journeyType ||
    flight?.tripType ||
    flight?.tripIndicator ||
    null;

  flights.forEach((flight, index) => {
    const dirKey = getDirectionKey(flight);
    if (dirKey !== undefined && dirKey !== null && dirKey !== "") {
      const normalizedKey = dirKey.toString();
      if (!directionMap.has(normalizedKey)) {
        directionMap.set(normalizedKey, directionMap.size + 1);
      }
      assignments[index] = directionMap.get(normalizedKey);
    }
  });

  if (directionMap.size === 0) {
    // Fallback: split components when there is a long gap (>36h) between legs.
    let currentComponent = 1;
    let lastArrivalDate = null;
    flights.forEach((flight, index) => {
      const departureDate = new Date(
        flight?.DepartureDate ||
        flight?.departureDate ||
        flight?.departure?.at ||
        flight?.Departure?.DateTime ||
        "",
      );
      if (
        lastArrivalDate instanceof Date &&
        !isNaN(lastArrivalDate) &&
        departureDate instanceof Date &&
        !isNaN(departureDate)
      ) {
        const gapHours =
          (departureDate.getTime() - lastArrivalDate.getTime()) / 36e5;
        if (gapHours > 36) {
          currentComponent += 1;
        }
      }
      assignments[index] = currentComponent;

      const arrivalDate = new Date(
        flight?.ArrivalDate ||
        flight?.arrivalDate ||
        flight?.arrival?.at ||
        flight?.Arrival?.DateTime ||
        "",
      );
      if (arrivalDate instanceof Date && !isNaN(arrivalDate)) {
        lastArrivalDate = arrivalDate;
      }
    });
  } else {
    // Ensure every segment has an assignment, fallback to last known component.
    let lastKnownComponent = 1;
    flights.forEach((_, index) => {
      if (assignments[index]) {
        lastKnownComponent = assignments[index];
      } else {
        assignments[index] = lastKnownComponent;
      }
    });
  }

  return assignments;
}

/**
 * Gets fare rules from Sabre using SOAP StructureFareRulesRQ
 * @param {Object} params - Parameters for fare rules request
 * @param {number} params.adult - Number of adult passengers
 * @param {number} params.child - Number of child passengers
 * @param {number} params.infant - Number of infant passengers
 * @param {Array} params.flightDetails - Array of flight segment details
 * @param {string} params.fareId - Fare ID to filter flights
 * @param {string} params.validatingCarrier - Validating carrier code
 * @param {Object} params.options - Additional options (brandId, accountCode, corporateId, etc.)
 * @returns {Promise<Object>} Parsed fare rules response
 */
async function getFareRules({
  adult = 0,
  child = 0,
  infant = 0,
  flightDetails = [],
  fareId,
  validatingCarrier,
  options = {},
  groupedItineraryResponse,
}) {
  try {
    // Create SOAP session
    const sessionToken = await createSoapSession();

    // Initialize segment component data if available
    let segmentComponentData = [];

    // If a Sabre groupedItineraryResponse is provided, derive flights/fare bases from it.
    if (groupedItineraryResponse) {
      const built = buildFareRulesFromGroupedItineraryResponse(
        groupedItineraryResponse,
      );
      if (built.flightDetails?.length) {
        flightDetails = built.flightDetails;
      }
      if (built.segmentComponentData) {
        segmentComponentData = built.segmentComponentData;
      }
      if (!validatingCarrier && built.validatingCarrier) {
        validatingCarrier = built.validatingCarrier;
      }
      if (adult === 0 && child === 0 && infant === 0) {
        adult = built.paxCounts?.ADT || adult || 1;
        child = built.paxCounts?.CNN || 0;
        infant = built.paxCounts?.INF || 0;
      }
    }

    // Build passenger types XML
    let passengerTypesXml = "";
    if (adult > 0) {
      passengerTypesXml += `  <PassengerType Code="ADT" Count="${adult}"/>`;
    }
    if (child > 0) {
      passengerTypesXml += `\n  <PassengerType Code="CNN" Count="${child}"/>`;
    }
    if (infant > 0) {
      passengerTypesXml += `\n  <PassengerType Code="INF" Count="${infant}"/>`;
    }

    // Build flight segments XML
    let flightSegmentsXml = "";

    // Filter flight details by fareId if provided
    const filteredFlights = fareId
      ? flightDetails.filter(
        (flight) => flight.fare_itr === fareId || flight.fareId === fareId,
      )
      : flightDetails;

    const derivedComponentNumbers = deriveFareComponentNumbers(filteredFlights);

    // Get validating carrier: prefer explicit param, otherwise marketing carrier from first segment,
    // then other fallbacks. This avoids picking an operating/validating mismatch that can trigger
    // "NO FARE FOR CLASS USED" when fares are filed under the marketing carrier.
    const validatingCarrierCode =
      validatingCarrier ||
      filteredFlights[0]?.marketingCarrier ||
      filteredFlights[0]?.MarketingCarrier ||
      filteredFlights[0]?.MarketingAirline?.Code ||
      filteredFlights[0]?.marketingAirline ||
      filteredFlights[0]?.MarketingAirline ||
      filteredFlights[0]?.carrierCode ||
      filteredFlights[0]?.MarketingAirlineCode ||
      filteredFlights[0]?.ValidatingCarrier ||
      filteredFlights[0]?.validatingCarrier ||
      filteredFlights[0]?.operatingCarrier ||
      filteredFlights[0]?.operating ||
      "YY";

    // Keep fare component numbers consistent: same fare basis + pax type => same number.
    // If a suggested number is already owned by a different fare basis, allocate a new one.
    const resolveFareComponentNumber = (() => {
      const keyToNumber = new Map(); // `${pax}|${fareBasis}`
      const numberOwners = new Map(); // number -> key
      let nextNumber = 1;

      return (fareBasisCode, passengerType = "ADT", suggestedNumber) => {
        const basis = (fareBasisCode || "").trim();
        const key = `${passengerType}|${basis || "NOFARE"}`;

        if (keyToNumber.has(key)) {
          return keyToNumber.get(key);
        }

        if (suggestedNumber && !numberOwners.has(suggestedNumber)) {
          keyToNumber.set(key, suggestedNumber);
          numberOwners.set(suggestedNumber, key);
          nextNumber = Math.max(nextNumber, suggestedNumber + 1);
          return suggestedNumber;
        }

        while (numberOwners.has(nextNumber)) {
          nextNumber += 1;
        }

        keyToNumber.set(key, nextNumber);
        numberOwners.set(nextNumber, key);
        return nextNumber++;
      };
    })();

    filteredFlights.forEach((flight, flightIndex) => {
      const usedFareBasisCodes = new Set();
      const componentData =
        segmentComponentData[flightIndex] ||
        segmentComponentData[segmentComponentData.length - 1] ||
        {};
      const ResBookDesigCode =
        flight.ResBookDesigCode ||
        componentData.bookingCode ||
        flight.bookingCode ||
        flight.cabinTypeCode ||
        "Y";
      // Use ISO format for SOAP XML (YYYY-MM-DDTHH:mm:ss)
      const DepartureDate = formatISODateTime(
        flight.DepartureDate || flight.departureDate || flight.departure?.at,
      );
      const ArrivalDate = formatISODateTime(
        flight.ArrivalDate || flight.arrivalDate || flight.arrival?.at,
      );
      // BookingDate should be just date (YYYY-MM-DD) + T00:00:00
      const bookingDateRaw =
        flight.BookingDate ||
        flight.bookingDate ||
        flight.DepartureDate ||
        flight.departureDate;
      const BookingDate = formatISODate(bookingDateRaw);
      const FlightNumber =
        flight.FlightNumber || flight.flightNumber || flight.number || "";
      const DepartureAirport =
        flight.DepartureAirport ||
        flight.departureAirport ||
        flight.departure?.iataCode ||
        flight.OriginLocation?.LocationCode ||
        "";
      const ArrivalAirport =
        flight.ArrivalAirport ||
        flight.arrivalAirport ||
        flight.arrival?.iataCode ||
        flight.DestinationLocation?.LocationCode ||
        "";
      const MarketingAirline =
        flight.MarketingAirline?.Code || // object shape { Code: "EY" }
        flight.MarketingAirline || // string shape "EY"
        flight.marketingAirline || // alternative string shape
        flight.marketingCarrier ||
        flight.MarketingCarrier ||
        flight.marketing ||
        flight.carrierCode ||
        flight.operatingCarrier ||
        flight.operating ||
        flight.validatingCarrier ||
        flight.ValidatingCarrier ||
        validatingCarrierCode || // fallback to derived validating carrier
        "YY";
      const SegmentNumber =
        flight.SegmentNumber || flight.segmentNumber || String(flightIndex + 1);
      const SegmentType = flight.SegmentType || flight.segmentType || "A";
      const RealReservationStatus =
        flight.RealReservationStatus || flight.realReservationStatus || "NN";
      const derivedComponentNumber =
        componentData.componentNumber ||
        derivedComponentNumbers[flightIndex] ||
        1;

      flightSegmentsXml += `\n    <OriginDestinationOption>`;
      // BookingDate needs to be in format YYYY-MM-DDTHH:mm:ss
      const bookingDateTime = BookingDate ? `${BookingDate}T00:00:00` : "";
      flightSegmentsXml += `\n      <FlightSegment ArrivalDate="${ArrivalDate}" BookingDate="${bookingDateTime}" DepartureDate="${DepartureDate}" FlightNumber="${FlightNumber}" RealReservationStatus="${RealReservationStatus}" ResBookDesigCode="${ResBookDesigCode}" SegmentNumber="${SegmentNumber}" SegmentType="${SegmentType}">`;
      flightSegmentsXml += `\n        <DepartureAirport LocationCode="${DepartureAirport}"/>`;
      flightSegmentsXml += `\n        <ArrivalAirport LocationCode="${ArrivalAirport}"/>`;
      flightSegmentsXml += `\n        <MarketingAirline Code="${MarketingAirline}"/>`;
      flightSegmentsXml += `\n      </FlightSegment>`;

      // PaxTypeInformation is REQUIRED inside each OriginDestinationOption
      // Add fare basis codes if available
      // Note: Fare basis codes should come from the actual pricing response
      // If not available, we'll add a basic PaxTypeInformation without fare basis code
      let hasPaxTypeInfo = false;

      if (
        flight.farebase &&
        Array.isArray(flight.farebase) &&
        flight.farebase.length > 0
      ) {
        flight.farebase.forEach((fare) => {
          const rawFareBasisCode =
            fare.FareBasisCode ||
            fare.fareBasisCode ||
            componentData.fareBasisCode ||
            "";
          // Pass ResBookDesigCode to potentially prepend booking class
          const FareBasisCode = sanitizeFareBasisCode(
            rawFareBasisCode,
            ResBookDesigCode,
          );
          const PassengerType =
            fare.PassengerType || fare.passengerType || "ADT";
          const FareComponentNumber =
            fare.FareComponentNumber ||
            fare.fareComponentNumber ||
            componentData.componentNumber ||
            resolveFareComponentNumber(
              FareBasisCode,
              PassengerType,
              derivedComponentNumber,
            );

          // Only add if different from last one to avoid duplicates
          const fareKey = `${PassengerType}-${FareBasisCode}-${FareComponentNumber}`;
          if (FareBasisCode && !usedFareBasisCodes.has(fareKey)) {
            flightSegmentsXml += `\n      <PaxTypeInformation FareBasisCode="${FareBasisCode}" FareComponentNumber="${FareComponentNumber}" PassengerType="${PassengerType}"/>`;
            usedFareBasisCodes.add(fareKey);
            hasPaxTypeInfo = true;
          }
        });
      } else if (
        flight.FareBasisCode ||
        flight.fareBasisCode ||
        componentData.fareBasisCode
      ) {
        // Single fare basis code
        const rawFareBasisCode =
          flight.FareBasisCode ||
          flight.fareBasisCode ||
          componentData.fareBasisCode;
        // Pass ResBookDesigCode to potentially prepend booking class
        const FareBasisCode = sanitizeFareBasisCode(
          rawFareBasisCode,
          ResBookDesigCode,
        );
        const FareComponentNumber =
          componentData.componentNumber ||
          resolveFareComponentNumber(
            FareBasisCode,
            "ADT",
            derivedComponentNumber,
          );
        const fareKey = `ADT-${FareBasisCode}-${FareComponentNumber}`;
        if (FareBasisCode && !usedFareBasisCodes.has(fareKey)) {
          flightSegmentsXml += `\n      <PaxTypeInformation FareBasisCode="${FareBasisCode}" FareComponentNumber="${FareComponentNumber}" PassengerType="ADT"/>`;
          usedFareBasisCodes.add(fareKey);
          hasPaxTypeInfo = true;
        }
      }

      // If no fare basis code provided, add basic PaxTypeInformation (required by schema)
      // This allows Sabre to determine fare rules based on flight details
      if (!hasPaxTypeInfo) {
        // Add PaxTypeInformation for each passenger type that was requested
        if (adult > 0) {
          const fc = resolveFareComponentNumber(
            null,
            "ADT",
            derivedComponentNumber,
          );
          flightSegmentsXml += `\n      <PaxTypeInformation FareComponentNumber="${fc}" PassengerType="ADT"/>`;
        }
        if (child > 0) {
          const fc = resolveFareComponentNumber(
            null,
            "CNN",
            derivedComponentNumber,
          );
          flightSegmentsXml += `\n      <PaxTypeInformation FareComponentNumber="${fc}" PassengerType="CNN"/>`;
        }
        if (infant > 0) {
          const fc = resolveFareComponentNumber(
            null,
            "INF",
            derivedComponentNumber,
          );
          flightSegmentsXml += `\n      <PaxTypeInformation FareComponentNumber="${fc}" PassengerType="INF"/>`;
        }
        // If no passengers specified, default to ADT
        if (adult === 0 && child === 0 && infant === 0) {
          const fc = resolveFareComponentNumber(
            null,
            "ADT",
            derivedComponentNumber,
          );
          flightSegmentsXml += `\n      <PaxTypeInformation FareComponentNumber="${fc}" PassengerType="ADT"/>`;
        }
      }

      flightSegmentsXml += `\n    </OriginDestinationOption>`;
    });

    // Build optional qualifiers
    let optionalQualifiersXml = "";
    if (options.brandId) {
      optionalQualifiersXml += `\n        <BrandID>${options.brandId}</BrandID>`;
    }
    if (options.accountCode) {
      optionalQualifiersXml += `\n        <AccountCode>${options.accountCode}</AccountCode>`;
    }
    if (options.corporateId) {
      optionalQualifiersXml += `\n        <CorporateID>${options.corporateId}</CorporateID>`;
    }
    if (options.privateFare === true) {
      optionalQualifiersXml += `\n        <PrivateFare Ind="true"/>`;
    }
    if (options.publicFare === true) {
      optionalQualifiersXml += `\n        <PublicFare Ind="true"/>`;
    }
    if (
      options.retailerRuleQualifiers &&
      Array.isArray(options.retailerRuleQualifiers)
    ) {
      options.retailerRuleQualifiers.forEach((rrq) => {
        optionalQualifiersXml += `\n        <RetailerRuleQualifier>${rrq}</RetailerRuleQualifier>`;
      });
    }
    if (options.returnRouting === true) {
      optionalQualifiersXml += `\n        <ReturnRouting Ind="true"/>`;
    }

    // Build the SOAP request
    const soapRequest = `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
      <SOAP-ENV:Header>
        <MessageHeader xmlns="http://www.ebxml.org/namespaces/messageHeader">
          <From>
            <PartyId>Agency</PartyId>
          </From>
          <To>
            <PartyId>SWS</PartyId>
          </To>
          <ConversationId>2020.04.DevStudio</ConversationId>
          <Action>StructureFareRulesRQ</Action>
        </MessageHeader>
        <Security xmlns="http://schemas.xmlsoap.org/ws/2002/12/secext">
          <BinarySecurityToken EncodingType="Base64Binary" valueType="String">${sessionToken}</BinarySecurityToken>
        </Security>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
        <StructureFareRulesRQ xmlns="http://webservices.sabre.com/sabreXML/2003/07" Version="3.0.0">
          <PriceRequestInformation>
            <PassengerTypes>
${passengerTypesXml}
            </PassengerTypes>
          <ValidatingCarrier Code="${validatingCarrierCode || "YY"}"/>
            ${optionalQualifiersXml
        ? `<OptionalQualifiers>${optionalQualifiersXml}\n        </OptionalQualifiers>`
        : ""
      }
          </PriceRequestInformation>
          <AirItinerary>
            <OriginDestinationOptions>
${flightSegmentsXml}
            </OriginDestinationOptions>
          </AirItinerary>
        </StructureFareRulesRQ>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    // Send SOAP request
    // Use environment variable if available, otherwise use config, with fallback
    const soapUrl =
      process.env.SABRE_SOAP_URL ||
      SABRE.SOAP_URL ||
      "https://webservices.havail.sabre.com";

    const response = await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "StructureFareRulesRQ",
      },
      body: soapRequest,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Fare rules request failed: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const responseText = await response.text();
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitCharkey: true,
      trim: true,
      normalize: true,
    });

    const result = await parser.parseStringPromise(responseText);

    // Close the SOAP session
    await closeSoapSession(sessionToken);

    // Extract the response body (matching PHP behavior) and return along with the built request
    const responseBody =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
      "StructureFareRulesRS"
      ] || result;

    return {
      // requestXml: soapRequest,
      response: responseBody,
      rawResponse: result,
    };
  } catch (error) {
    console.error("Error getting fare rules:", error);
    throw new Error(`Failed to get fare rules: ${error.message}`);
  }
}

/**
 * Convenience helper: builds and sends StructureFareRulesRQ directly from a
 * Sabre groupedItineraryResponse (e.g., the body returned by Revalidate).
 * @param {Object} params
 * @param {Object} params.groupedItineraryResponse - Response object from revalidate
 * @param {Object} params.options - Optional qualifiers for fare rules request
 * @returns {Promise<Object>} Parsed fare rules response plus the SOAP request XML
 */
async function getFareRulesFromRevalidate({
  groupedItineraryResponse,
  validatingCarrier,
  adult,
  child,
  infant,
  options = {},
}) {
  if (!groupedItineraryResponse) {
    throw new Error("groupedItineraryResponse is required for fare rules");
  }

  return getFareRules({
    groupedItineraryResponse,
    validatingCarrier,
    adult,
    child,
    infant,
    options,
  });
}

/**
 * Alternative method using OTA_AirRulesRQ (as per documentation examples)
 * @param {Object} params - Parameters for fare rules request
 * @param {string} params.fareBasisCode - Fare basis code
 * @param {string} params.departureDate - Departure date
 * @param {string} params.classOfService - Class of service (e.g., "Y")
 * @param {string} params.carrierCode - Carrier code
 * @param {Object} params.options - Additional options
 * @returns {Promise<Object>} Parsed fare rules response
 */
async function getFareRulesOTA({
  fareBasisCode,
  departureDate,
  classOfService,
  carrierCode,
  options = {},
}) {
  try {
    const sessionToken = await createSoapSession();

    // Sanitize fare basis code
    const sanitizedFareBasisCode = sanitizeFareBasisCode(fareBasisCode);

    // Format date
    const formattedDate = formatSabreDate(departureDate);

    // Build optional qualifiers
    let optionalQualifiersXml = "";
    if (options.returnRouting === true) {
      optionalQualifiersXml += `\n        <ReturnRouting/>`;
    }
    if (options.globalIndicator) {
      optionalQualifiersXml += `\n        <GlobalIndicator>${options.globalIndicator}</GlobalIndicator>`;
    }
    if (options.ticketDesignator) {
      optionalQualifiersXml += `\n        <TicketDesignator>${options.ticketDesignator}</TicketDesignator>`;
    }
    if (options.accountCode) {
      optionalQualifiersXml += `\n        <AccountCode>${options.accountCode}</AccountCode>`;
    }
    if (options.corporateId) {
      optionalQualifiersXml += `\n        <CorporateID>${options.corporateId}</CorporateID>`;
    }
    if (options.privateFare === true) {
      optionalQualifiersXml += `\n        <PrivateFare/>`;
    }
    if (options.publicFare === true) {
      optionalQualifiersXml += `\n        <PublicFare/>`;
    }
    if (options.historicalDate) {
      optionalQualifiersXml += `\n        <HistoricalDate>${formatSabreDate(
        options.historicalDate,
      )}</HistoricalDate>`;
    }
    if (options.ticketingDate) {
      optionalQualifiersXml += `\n        <TicketingDate>${formatSabreDateTime(
        options.ticketingDate,
      )}</TicketingDate>`;
    }
    if (options.ruleCategoryNumber) {
      optionalQualifiersXml += `\n        <RuleCategoryNumber>${options.ruleCategoryNumber}</RuleCategoryNumber>`;
    }
    if (
      options.retailerRuleQualifiers &&
      Array.isArray(options.retailerRuleQualifiers)
    ) {
      options.retailerRuleQualifiers.forEach((rrq) => {
        optionalQualifiersXml += `\n        <RetailerRuleQualifier>${rrq}</RetailerRuleQualifier>`;
      });
    }
    if (options.retailerRuleQualifierMatch) {
      optionalQualifiersXml += `\n        <RetailerRuleQualifierMatch>${options.retailerRuleQualifierMatch}</RetailerRuleQualifierMatch>`;
    }

    const soapRequest = `<OTA_AirRulesRQ xmlns="http://webservices.sabre.com/sabreXML/2011/10" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ReturnHostCommand="true" Version="2.3.0">
      <RuleReqInfo>
        <FareBasisCode>${sanitizedFareBasisCode}</FareBasisCode>
        <DepartureDate>${formattedDate}</DepartureDate>
        <ClassOfService>${classOfService}</ClassOfService>
        <CarrierCode>${carrierCode}</CarrierCode>
        ${optionalQualifiersXml
        ? `<OptionalQualifiers>${optionalQualifiersXml}\n        </OptionalQualifiers>`
        : ""
      }
      </RuleReqInfo>
    </OTA_AirRulesRQ>`;

    const fullSoapEnvelope = `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
      <SOAP-ENV:Header>
        <MessageHeader xmlns="http://www.ebxml.org/namespaces/messageHeader">
          <From>
            <PartyId>Agency</PartyId>
          </From>
          <To>
            <PartyId>SWS</PartyId>
          </To>
          <ConversationId>2020.04.DevStudio</ConversationId>
          <Action>OTA_AirRulesRQ</Action>
        </MessageHeader>
        <Security xmlns="http://schemas.xmlsoap.org/ws/2002/12/secext">
          <BinarySecurityToken EncodingType="Base64Binary" valueType="String">${sessionToken}</BinarySecurityToken>
        </Security>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
        ${soapRequest}
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    // Use environment variable if available, otherwise use config, with fallback
    const soapUrl =
      process.env.SABRE_SOAP_URL ||
      SABRE.SOAP_URL ||
      "https://webservices.havail.sabre.com";

    const response = await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "OTA_AirRulesRQ",
      },
      body: fullSoapEnvelope,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Fare rules request failed: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const responseText = await response.text();
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitCharkey: true,
      trim: true,
      normalize: true,
    });

    const result = await parser.parseStringPromise(responseText);

    // Close the SOAP session
    await closeSoapSession(sessionToken);

    return result;
  } catch (error) {
    console.error("Error getting fare rules (OTA):", error);
    throw new Error(`Failed to get fare rules: ${error.message}`);
  }
}

/**
 * Gets pricing from Sabre using SOAP AllBrandsPricingRQ
 * @param {Object} params - Parameters for pricing request
 * @param {number} params.adult - Number of adult passengers
 * @param {number} params.child - Number of child passengers
 * @param {number} params.infant - Number of infant passengers
 * @param {Array} params.flightDetails - Array of flight segment details
 * @param {Object} params.options - Additional options
 * @returns {Promise<Object>} Parsed pricing response
 */
async function getAllBrandsPricing({
  adult = 0,
  child = 0,
  infant = 0,
  flightDetails = [],
  options = {},
}) {
  try {
    // Create SOAP session
    const sessionToken = await createSoapSession();

    // Build passenger types XML
    let passengerTypesXml = "";
    if (adult > 0) {
      passengerTypesXml += `  <PassengerType Code="ADT" Count="${adult}"/>`;
    }
    if (child > 0) {
      passengerTypesXml += `\n  <PassengerType Code="CNN" Count="${child}"/>`;
    }
    if (infant > 0) {
      passengerTypesXml += `\n  <PassengerType Code="INF" Count="${infant}"/>`;
    }

    // Build flight segments XML - each segment in its own OriginDestinationOption
    let flightSegmentsXml = "";

    flightDetails.forEach((flight) => {
      const ResBookDesigCode =
        flight.ResBookDesigCode ||
        flight.bookingCode ||
        flight.cabinTypeCode ||
        "Y";
      const DepartureDate = formatISODateTime(
        flight.DepartureDate || flight.departureDate || flight.departure?.at,
      );
      const ArrivalDate = formatISODateTime(
        flight.ArrivalDate || flight.arrivalDate || flight.arrival?.at,
      );
      const FlightNumber =
        flight.FlightNumber || flight.flightNumber || flight.number || "";
      const DepartureAirport =
        flight.DepartureAirport ||
        flight.departureAirport ||
        flight.departure?.iataCode ||
        flight.OriginLocation?.LocationCode ||
        "";
      const ArrivalAirport =
        flight.ArrivalAirport ||
        flight.arrivalAirport ||
        flight.arrival?.iataCode ||
        flight.DestinationLocation?.LocationCode ||
        "";
      const MarketingAirline =
        flight.MarketingAirline ||
        flight.marketingAirline ||
        flight.carrierCode ||
        flight.MarketingAirline?.Code ||
        "";
      const SegmentNumber = flight.SegmentNumber || flight.segmentNumber || "1";
      const SegmentType = flight.SegmentType || flight.segmentType || "A";

      flightSegmentsXml += `\n            <OriginDestinationOption>`;
      flightSegmentsXml += `\n                <FlightSegment DepartureDate="${DepartureDate}" ArrivalDate="${ArrivalDate}" FlightNumber="${FlightNumber}" ResBookDesigCode="${ResBookDesigCode}" SegmentNumber="${SegmentNumber}" SegmentType="${SegmentType}">`;
      flightSegmentsXml += `\n                    <DepartureAirport LocationCode="${DepartureAirport}"/>`;
      flightSegmentsXml += `\n                    <ArrivalAirport LocationCode="${ArrivalAirport}"/>`;
      flightSegmentsXml += `\n                    <MarketingAirline Code="${MarketingAirline}"/>`;
      flightSegmentsXml += `\n                </FlightSegment>`;
      flightSegmentsXml += `\n            </OriginDestinationOption>`;
    });

    // Build the SOAP request
    const soapRequest = `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
      <SOAP-ENV:Header>
        <MessageHeader xmlns="http://www.ebxml.org/namespaces/messageHeader">
          <From>
            <PartyId>Agency</PartyId>
          </From>
          <To>
            <PartyId>SWS</PartyId>
          </To>
          <ConversationId>2020.04.DevStudio</ConversationId>
          <Action>AllBrandsPricingRQ</Action>
        </MessageHeader>
        <Security xmlns="http://schemas.xmlsoap.org/ws/2002/12/secext">
          <BinarySecurityToken EncodingType="Base64Binary" valueType="String">${sessionToken}</BinarySecurityToken>
        </Security>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
        <AllBrandsPricingRQ Version="1.1.4" xmlns="http://webservices.sabre.com/sabreXML/2003/07">
          <PriceRequestInformation>
            <PassengerTypes>
${passengerTypesXml}
            </PassengerTypes>
          </PriceRequestInformation>
          <AirItinerary>
            <OriginDestinationOptions>
${flightSegmentsXml}
            </OriginDestinationOptions>
          </AirItinerary>
        </AllBrandsPricingRQ>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    // Send SOAP request
    const soapUrl =
      process.env.SABRE_SOAP_URL ||
      SABRE.SOAP_URL ||
      "https://webservices.havail.sabre.com";

    const response = await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "AllBrandsPricingRQ",
      },
      body: soapRequest,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Pricing request failed: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const responseText = await response.text();
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitCharkey: true,
      trim: true,
      normalize: true,
    });

    const result = await parser.parseStringPromise(responseText);

    // Close the SOAP session
    await closeSoapSession(sessionToken);

    return (
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
      "AllBrandsPricingRS"
      ] || result
    );
  } catch (error) {
    console.error("Error getting all brands pricing:", error);
    throw new Error(`Failed to get pricing: ${error.message}`);
  }
}

module.exports = {
  createSoapSession,
  closeSoapSession,
  getFareRules,
  getFareRulesFromRevalidate,
  getFareRulesOTA,
  getAllBrandsPricing,
  formatSabreDate,
  formatSabreDateTime,
  formatISODateTime,
  formatISODate,
  sanitizeFareBasisCode,
  buildFareRulesFromGroupedItineraryResponse,
};
