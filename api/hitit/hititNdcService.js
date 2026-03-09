require("dotenv").config();
const fetch = require("node-fetch");
const { HITIT } = require("../../config/config");
const xml2js = require("xml2js");

/**
 * Creates HTTP Basic Auth header for Hitit NDC API
 * @returns {string} Base64 encoded credentials
 */
function createAuthHeader() {
  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";

  if (!username || !password) {
    console.warn(
      "[Hitit NDC] Warning: Username or password not set in environment variables"
    );
  }

  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${credentials}`;
}

/**
 * Builds Party block for NDC requests
 * @param {Object} options - Optional party information
 * @returns {string} XML Party block
 */
function buildPartyBlock(options = {}) {
  const agencyId =
    options.agencyId ||
    process.env.HITIT_AGENCY_ID ||
    HITIT?.AGENCY_ID ||
    "HITITADMIN";
  const email =
    options.email ||
    process.env.HITIT_EMAIL ||
    HITIT?.EMAIL ||
    "admin@hititcs.com";
  const name =
    options.name ||
    process.env.HITIT_AGENCY_NAME ||
    HITIT?.AGENCY_NAME ||
    "HITIT COMPUTER SERVICES";

  return `<Party>
            <Sender>
               <TravelAgency>
                  <AgencyID>${agencyId}</AgencyID>
                  <ContactInfo>
                     <EmailAddress>
                        <EmailAddressText>${email}</EmailAddressText>
                     </EmailAddress>
                  </ContactInfo>
                  <Name>${name}</Name>
               </TravelAgency>
            </Sender>
         </Party>`;
}

/**
 * Makes NDC API request to Hitit
 * @param {string} method - NDC method name (e.g., "DoGeneralParams", "DoAirShopping")
 * @param {string} requestBody - XML request body
 * @returns {Promise<Object>} Parsed XML response
 */
async function makeNdcRequest(method, requestBody) {
  try {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    // Try different URL patterns - some NDC APIs use /ndc/ prefix or different structures
    let url = `${baseUrl}/${method}`;

    // If base URL doesn't end with /, ensure proper path construction
    if (!baseUrl.endsWith("/") && !method.startsWith("/")) {
      url = `${baseUrl}/${method}`;
    } else if (baseUrl.endsWith("/") && method.startsWith("/")) {
      url = `${baseUrl}${method.substring(1)}`;
    } else if (baseUrl.endsWith("/")) {
      url = `${baseUrl}${method}`;
    } else {
      url = `${baseUrl}/${method}`;
    }

    const authHeader = createAuthHeader();

    console.log(`[Hitit NDC] Calling: ${url}`);
    console.log(`[Hitit NDC] Request body length: ${requestBody.length} chars`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        Accept: "application/xml",
        Authorization: authHeader,
      },
      body: requestBody,
    });

    const responseText = await response.text();
    const contentType = response.headers.get("content-type") || "";

    // Check if response is HTML (login page or error page)
    if (
      contentType.includes("text/html") ||
      responseText.trim().startsWith("<!DOCTYPE") ||
      responseText.trim().startsWith("<html") ||
      responseText.includes("<HTML>")
    ) {
      console.error(
        `[Hitit NDC] Received HTML response instead of XML. Status: ${response.status}`
      );
      console.error(
        `[Hitit NDC] Response preview: ${responseText.substring(0, 500)}`
      );

      // Try alternative URL patterns
      const alternativeUrls = [
        `${baseUrl}/ndc/${method}`,
        `${baseUrl}/api/${method}`,
        `${baseUrl}/CraneNDCService/${method}`,
      ];

      throw new Error(
        `Hitit API returned HTML login page instead of XML response. This usually means:\n` +
        `1. Authentication failed (check username/password)\n` +
        `2. Wrong endpoint URL (tried: ${url})\n` +
        `3. API endpoint structure is different\n\n` +
        `Response status: ${response.status}\n` +
        `Content-Type: ${contentType}\n` +
        `Response preview: ${responseText.substring(0, 200)}...`
      );
    }

    if (!response.ok) {
      throw new Error(
        `Hitit NDC request failed: ${response.status} ${response.statusText
        }\n${responseText.substring(0, 500)}`
      );
    }

    // Log debug info
    // console.log("[Hitit NDC] CWD:", process.cwd());
    // console.log("[Hitit NDC] Raw Response Preview:\n", responseText.substring(0, 2000));
    // require('fs').writeFileSync('debug_hitit_response.xml', responseText);

    // Hitit responses may contain slightly non-strict XML (e.g. attributes without values),
    // so we relax the parser to avoid hard failures on such cases.
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitCharkey: false,
      trim: true,
      normalize: true,
      ignoreAttrs: false,
      strict: false,
    });

    try {
      const result = await parser.parseStringPromise(responseText);
      return result;
    } catch (parseError) {
      // If parsing fails, log and return raw XML so the caller can still inspect it.
      console.error(`XML parse error in ${method}:`, parseError);
      return { rawXml: responseText, parseError: parseError.message };
    }
  } catch (error) {
    console.error(`Error in ${method}:`, error);
    throw new Error(`Failed to execute ${method}: ${error.message}`);
  }
}

/**
 * DoGeneralParams - Get general parameters (currencies, cabin classes, trip types, etc.)
 * @returns {Promise<Object>} General parameters response
 */
async function doGeneralParams() {
  const partyBlock = buildPartyBlock();
  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoGeneralParams>
  </DoGeneralParams>
</CraneNDCService>`;

  return await makeNdcRequest("DoGeneralParams", requestBody);
}

/**
 * DoAirlineProfile - Get airline profile and port combinations
 * @param {Object} params - Parameters for airline profile
 * @param {string} params.airlineCode - Airline code (optional)
 * @returns {Promise<Object>} Airline profile response
 */
async function doAirlineProfile(params = {}) {
  const partyBlock = buildPartyBlock();
  let airlineFilter = "";

  if (params.airlineCode) {
    airlineFilter = `<AirlineDesigCode>${params.airlineCode}</AirlineDesigCode>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoAirlineProfile>
    ${airlineFilter}
  </DoAirlineProfile>
</CraneNDCService>`;

  return await makeNdcRequest("DoAirlineProfile", requestBody);
}

/**
 * DoAirShopping - Search for flights via SOAP IATA_AirShoppingRQ
 * Supports OneWay, RoundTrip and MultiDestination by sending multiple OriginDestCriteria.
 * @param {Object} params - Search parameters
 * @param {Array} params.originDestCriteria - [{ originCode, destCode, departureDate }]
 * @param {Array} params.paxList - [{ paxID, ptc }]
 * @param {string} params.currency - Currency code (e.g. PKR)
 * @param {string} params.cabinClass - Cabin class code (e.g. Y)
 * @param {string} params.tripType - OneWay | RoundTrip | MultiDestination
 * @returns {Promise<Object>} Flight search response
 */
async function doAirShopping(params) {
  const {
    originDestCriteria = [],
    paxList = [],
    currency = "PKR",
    cabinClass = "Y",
    tripType = "OneWay",
  } = params || {};

  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";
  const agencyId = process.env.HITIT_AGENCY_ID || HITIT?.AGENCY_ID || "HITITADMIN";

  if (!username || !password) {
    throw new Error(
      "HITIT_USERNAME and HITIT_PASSWORD must be set for DoAirShopping SOAP request"
    );
  }

  // Build OriginDestCriteria blocks as per example
  let originDestCriteriaXml = "";
  originDestCriteria.forEach((od) => {
    originDestCriteriaXml += `
      <OriginDestCriteria>
        <DestArrivalCriteria>
          <IATA_LocationCode>${od.destCode}</IATA_LocationCode>
        </DestArrivalCriteria>
        <OriginDepCriteria>
          <Date>${od.departureDate}</Date>
          <IATA_LocationCode>${od.originCode}</IATA_LocationCode>
        </OriginDepCriteria>
        <PreferredCabinType>
          <CabinTypeCode>${cabinClass}</CabinTypeCode>
        </PreferredCabinType>
      </OriginDestCriteria>`;
  });

  // Build Paxs block
  let paxsXml = "";
  if (Array.isArray(paxList) && paxList.length > 0) {
    paxsXml = "<Paxs>";
    paxList.forEach((pax) => {
      paxsXml += `
      <Pax>
        <PaxID>${pax.paxID}</PaxID>
        <PTC>${pax.ptc}</PTC>
      </Pax>`;
    });
    paxsXml += "\n</Paxs>";
  }

  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <IATA_AirShoppingRQ xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_AirShoppingRQ">
      <MessageDoc>
        <Name>NDC GATEWAY</Name>
        <RefVersionNumber>20.1</RefVersionNumber>
      </MessageDoc>
      <Party>
        <Sender>
          <TravelAgency>
            <AgencyID>${agencyId}</AgencyID>
          </TravelAgency>
        </Sender>
      </Party>
      <Request>
        <FlightRequest>
${originDestCriteriaXml}
        </FlightRequest>
${paxsXml}
        <ResponseParameters>
          <CurParameter>
            <RequestedCurCode>${currency}</RequestedCurCode>
          </CurParameter>
          <LangUsage>
            <LangCode>EN</LangCode>
          </LangUsage>
        </ResponseParameters>
      </Request>
    </IATA_AirShoppingRQ>
  </soapenv:Body>
</soapenv:Envelope>`;

  // Use a dedicated SOAP endpoint if provided, otherwise construct from HITIT_BASE_URL
  let soapUrl = process.env.HITIT_AIRSHOPPING_URL;

  if (!soapUrl) {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    // If base URL doesn't look like a service endpoint, append standard Crane NDC path
    if (baseUrl && !baseUrl.includes("Service") && !baseUrl.includes(".asmx")) {
      soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
    } else {
      soapUrl = baseUrl;
    }
  }

  if (!soapUrl) {
    throw new Error(
      "HITIT_AIRSHOPPING_URL or HITIT_BASE_URL must be set for DoAirShopping"
    );
  }

  console.log("[Hitit NDC] DoAirShopping SOAP URL:", soapUrl);

  const response = await fetch(soapUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "application/xml",
      SOAPAction: "IATA_AirShoppingRQ",
      username: username,
      password: password,
    },
    body: soapEnvelope,
  });

  const responseText = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(
      `DoAirShopping SOAP request failed: ${response.status} ${response.statusText
      }\n${responseText.substring(0, 500)}`
    );
  }

  if (
    contentType.includes("text/html") ||
    responseText.trim().startsWith("<!DOCTYPE") ||
    responseText.trim().startsWith("<html") ||
    responseText.includes("<HTML>")
  ) {
    throw new Error(
      `DoAirShopping returned HTML instead of XML. Check SOAP endpoint and credentials.\nPreview: ${responseText.substring(
        0,
        300
      )}...`
    );
  }

  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitCharkey: false,
    trim: true,
    normalize: true,
    ignoreAttrs: false,
    strict: false,
  });

  try {
    const result = await parser.parseStringPromise(responseText);
    return result;
  } catch (parseError) {
    console.error("XML parse error in DoAirShopping:", parseError);
    return { rawXml: responseText, parseError: parseError.message };
  }
}


/**
 * Maps Hitit IATA_AirShoppingRS response into unified ticket JSON shape
 * similar to Sabre's postSabreFlightData output.
 * @param {Object} rawResponse - Parsed SOAP envelope from doAirShopping
 * @returns {Array} tickets
 */

function mapHititAirShoppingToTickets(rawResponse) {
  if (!rawResponse) return [];

  /* ---------------- SOAP SAFE ACCESS ---------------- */
  const env =
    rawResponse["S:Envelope"] || rawResponse["soapenv:Envelope"] || rawResponse;

  const body = env?.["S:Body"] || env?.Body || rawResponse?.body || {};

  const rs =
    body["IATA_AirShoppingRS"] ||
    body["ns8:IATA_AirShoppingRS"] ||
    body["NS8:IATA_AirShoppingRS"];

  if (!rs) return [];

  const response = rs.Response || rs["NS8:Response"] || {};

  const dataLists = response.DataLists || response["NS8:DataLists"] || {};

  /* ---------------- PAX LIST ---------------- */
  const paxRaw =
    dataLists.PaxList?.Pax || dataLists["NS8:PaxList"]?.["NS8:Pax"] || [];

  const paxList = Array.isArray(paxRaw) ? paxRaw : [paxRaw];

  const adt = paxList.find((p) => p.PTC === "ADT");
  const chd = paxList.find((p) => p.PTC === "CHD");
  const inf = paxList.find((p) => p.PTC === "INF");

  const ADT_ID = adt?.PaxID;

  /* ---------------- BAGGAGE MAP ---------------- */
  const baggageMap = {};
  const baggageRaw =
    dataLists.BaggageAllowanceList?.BaggageAllowance ||
    dataLists["NS8:BaggageAllowanceList"]?.["NS8:BaggageAllowance"] ||
    [];

  (Array.isArray(baggageRaw) ? baggageRaw : [baggageRaw]).forEach((b) => {
    if (!b?.BaggageAllowanceID) return;
    const m = b.PieceAllowance?.PieceWeightAllowance?.MaximumWeightMeasure;
    baggageMap[b.BaggageAllowanceID] = {
      weight: Number(m?._ || 0),
      unit: (m?.UnitCode || "KG").toLowerCase(),
    };
  });

  /* ---------------- SEGMENTS ---------------- */
  const segRaw =
    dataLists.PaxSegmentList?.PaxSegment ||
    dataLists["NS8:PaxSegmentList"]?.["NS8:PaxSegment"] ||
    [];

  const segments = (Array.isArray(segRaw) ? segRaw : [segRaw]).map((seg) => ({
    marketingCarrier: seg.MarketingCarrierInfo?.CarrierDesigCode,
    marketingFlightNumber:
      seg.MarketingCarrierInfo?.MarketingCarrierFlightNumberText,
    operating: seg.OperatingCarrierInfo?.CarrierDesigCode,
    operatingFlightNumber:
      seg.OperatingCarrierInfo?.OperatingCarrierFlightNumberText,
    departureTime: seg.Dep?.AircraftScheduledDateTime,
    arrivalTime: seg.Arrival?.AircraftScheduledDateTime,
    departureLocation: seg.Dep?.IATA_LocationCode,
    arrivalLocation: seg.Arrival?.IATA_LocationCode,
    elapsedTime: seg.Duration,
    stopCount: 0,
    equipmentType:
      seg.DatedOperatingLeg?.CarrierAircraftType?.CarrierAircraftTypeName,
    gav: seg.DatedOperatingLeg?.GAV || null,
    terminal: null,
    layoverTime: null,
    logo: null,
    operatinglogo: null,
  }));

  /* ---------------- OFFERS ---------------- */
  const offersRaw =
    response.OffersGroup?.CarrierOffers?.Offer ||
    response["NS8:OffersGroup"]?.["NS8:CarrierOffers"]?.["NS8:Offer"] ||
    [];

  const offers = Array.isArray(offersRaw) ? offersRaw : [offersRaw];

  /* ---------------- BRAND MAP (DEDUP) ---------------- */
  const brandMap = {};
  let adultTotalFare = 0;
  let adultBase = 0;
  let adultTax = 0;

  let childPrice = null;
  let infantPrice = null;

  offers.forEach((offer) => {
    const items = Array.isArray(offer.OfferItem)
      ? offer.OfferItem
      : [offer.OfferItem];

    items.forEach((item) => {
      const paxRef = item.Service?.PaxRefID;

      const price = item.Price || {};

      const base = Number(price.BaseAmount?._ || 0);
      const tax = Number(price.TaxSummary?.TotalTaxAmount?._ || 0);
      const total = base + tax;

      /* ----- CHILD / INFANT PRICES ----- */
      if (paxRef === chd?.PaxID) childPrice ??= total;
      if (paxRef === inf?.PaxID) infantPrice ??= total;

      /* ----- ADULT ONLY FOR BRANDS ----- */
      if (paxRef !== ADT_ID) return;

      adultTotalFare = total;
      adultBase = base;
      adultTax = tax;

      const fareComp = item.FareDetail?.FareComponent;
      const brandCode = fareComp?.FareBasisCode || "UNKNOWN";
      const brand = brandCode.replace(/CH$/, "");

      const bagId = item.FareDetail?.BaggageAllowance?.BaggageAllowanceID;
      const baggage = bagId && baggageMap[bagId] ? [baggageMap[bagId]] : [];

      if (!brandMap[brand] || total < brandMap[brand].fare) {
        brandMap[brand] = {
          brand,
          brandCode,
          fare: total,
          meal: false,
          cbag: true,
          baggage,
          rissue: false,
          seat: false,
          class: fareComp?.RBD?.RBD_CODE || "Y",
          Equip_type: segments[0]?.equipmentType || null,
          GAV: segments[0]?.gav || null,
        };
      }
    });
  });

  const brandedFare = Object.values(brandMap);

  /* ---------------- FINAL TICKET ---------------- */
  return [
    {
      api: "hitit",
      brandedFare,
      departure: segments,
      return: null,
      totalFare: adultTotalFare,
      netFare: adultTotalFare,
      passengerTotalFare: adultTotalFare,
      baseFare: adultBase,
      totalTax: adultTax,
      extra: {
        adult: { count: 1, Price: adultTotalFare },
        child: childPrice ? { count: 1, Price: childPrice } : null,
        infant: infantPrice ? { count: 1, Price: infantPrice } : null,
      },
      itineraries: [
        {
          departure: segments,
          bookingCode: [brandedFare[0]?.class || "Y"],
          totalFare: adultTotalFare,
        },
      ],
    },
  ];
}

/**
 * DoOrderCreate - Create reservation (Option PNR) or ticketed PNR (SOAP 20.1)
 * @param {Object} params - Order creation parameters
 * @returns {Promise<Object>} Order creation response
 */
async function doOrderCreate(params) {
  const {
    offerRefId,
    ownerCode = "PK",
    selectedOfferItems = [],
    totalAmount,
    paxList = [],
    contactInfoList = [],
    currency = "PKR",
  } = params || {};

  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";
  const agencyId = process.env.HITIT_AGENCY_ID || HITIT?.AGENCY_ID || "HITITADMIN";
  const agencyName = process.env.HITIT_AGENCY_NAME || HITIT?.AGENCY_NAME || "HITIT COMPUTER SERVICES";

  // Build SelectedOfferItems
  let selectedOfferItemsXml = "";
  selectedOfferItems.forEach(item => {
    selectedOfferItemsXml += `
          <SelectedOfferItem>
            <OfferItemRefID>${item.offerItemRefId}</OfferItemRefID>
            <PaxRefID>${item.paxRefId}</PaxRefID>
          </SelectedOfferItem>`;
  });

  // Build PaxList
  let paxListXml = "";
  paxList.forEach(pax => {
    paxListXml += `
        <Pax>
          ${pax.birthdate ? `<Birthdate>${pax.birthdate}</Birthdate>` : ""}
          ${pax.citizenshipCountryCode ? `<CitizenshipCountryCode>${pax.citizenshipCountryCode}</CitizenshipCountryCode>` : ""}
          ${pax.contactInfoRefID ? `<ContactInfoRefID>${pax.contactInfoRefID}</ContactInfoRefID>` : ""}
          ${pax.identityDoc ? `
          <IdentityDoc>
            <IdentityDocID>${pax.identityDoc.identityDocID}</IdentityDocID>
            <IdentityDocTypeCode>${pax.identityDoc.identityDocTypeCode || "NATIONAL_ID"}</IdentityDocTypeCode>
          </IdentityDoc>` : ""}
          <Individual>
            <GenderCode>${pax.individual?.genderCode || ""}</GenderCode>
            <GivenName>${pax.individual?.givenName || ""}</GivenName>
            <IndividualID>${pax.individual?.individualID || ("IND-" + pax.paxID)}</IndividualID>
            <Surname>${pax.individual?.surname || ""}</Surname>
            <TitleName>${pax.individual?.titleName || ""}</TitleName>
          </Individual>
          <PaxID>${pax.paxID}</PaxID>
          ${pax.paxRefID || pax.paxRefId ? `<PaxRefID>${pax.paxRefID || pax.paxRefId}</PaxRefID>` : ""}
          <PTC>${pax.ptc}</PTC>
        </Pax>`;
  });

  // Build ContactInfoList
  let contactInfoListXml = "";
  contactInfoList.forEach(contact => {
    contactInfoListXml += `
        <ContactInfo>
          <ContactInfoID>${contact.contactInfoID || "Contact-1"}</ContactInfoID>
          <EmailAddress>
            <EmailAddressText>${contact.emailAddress}</EmailAddressText>
          </EmailAddress>
          <Phone>
            <AreaCodeNumber>${contact.phone?.areaCodeNumber || ""}</AreaCodeNumber>
            <CountryDialingCode>${contact.phone?.countryDialingCode || "92"}</CountryDialingCode>
            <PhoneNumber>${contact.phone?.phoneNumber || ""}</PhoneNumber>
          </Phone>
        </ContactInfo>`;
  });

  // Ensure amount is formatted to 2 decimals
  const formattedAmount = totalAmount ? Number(totalAmount).toFixed(2) : "0.00";

  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_OrderCreateRQ">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <IATA_OrderCreateRQ>
      <Party>
        <Sender>
          <TravelAgency>
            <AgencyID>${agencyId}</AgencyID>
            <Name>${agencyName}</Name>
          </TravelAgency>
        </Sender>
      </Party>
      <PayloadAttributes>
        <PrimaryLangID>EN</PrimaryLangID>
      </PayloadAttributes>
      <Request>
        <CreateOrder>
          <SelectedOffer>
            <OfferRefID>${offerRefId}</OfferRefID>
            <OwnerCode>${ownerCode}</OwnerCode>
            ${selectedOfferItemsXml}
            <TotalOfferPriceAmount CurCode="${currency}">${formattedAmount}</TotalOfferPriceAmount>
          </SelectedOffer>
        </CreateOrder>
        <DataLists>
          <PaxList>
            ${paxListXml}
          </PaxList>
          <ContactInfoList>
            ${contactInfoListXml}
          </ContactInfoList>
        </DataLists>
        <OrderCreateParameters>
          <CurParameter>
            <CurCode>${currency}</CurCode>
          </CurParameter>
        </OrderCreateParameters>
      </Request>
    </IATA_OrderCreateRQ>
  </soapenv:Body>
</soapenv:Envelope>`;

  let soapUrl = process.env.HITIT_AIRSHOPPING_URL;
  if (!soapUrl) {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
  }

  console.log(`[Hitit NDC] DoOrderCreate Payload length: ${soapEnvelope.length}`);

  const response = await fetch(soapUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "application/xml",
      SOAPAction: "IATA_OrderCreateRQ",
      username: username,
      password: password,
    },
    body: soapEnvelope,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`DoOrderCreate failed: ${response.status}\n${responseText}`);
  }

  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitCharkey: false,
    trim: true,
    normalize: true,
    ignoreAttrs: false,
    strict: false,
  });

  return await parser.parseStringPromise(responseText);
}

/**
 * DoOrderRetrieve - Retrieve PNR information
 * @param {Object} params - Order retrieval parameters
 * @param {string} params.orderId - PNR/Order ID
 * @returns {Promise<Object>} Order retrieval response
 */
/**
 * DoOrderRetrieve - Retrieve PNR information (SOAP 20.1)
 * @param {Object} params - Order retrieval parameters
 * @param {string} params.orderId - PNR/Order ID
 * @returns {Promise<Object>} Order retrieval response
 */
async function doOrderRetrieve(params) {
  const { orderId } = params || {};
  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";
  const agencyId = process.env.HITIT_AGENCY_ID || HITIT?.AGENCY_ID || "HITITADMIN";
  const agencyName = process.env.HITIT_AGENCY_NAME || HITIT?.AGENCY_NAME || "HITIT COMPUTER SERVICES";

  console.log("[Hitit NDC] DoOrderRetrieve Params:", { orderId });

  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_OrderRetrieveRQ">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <IATA_OrderRetrieveRQ>
      <Party>
        <Sender>
          <TravelAgency>
            <AgencyID>${agencyId}</AgencyID>
            <Name>${agencyName}</Name>
          </TravelAgency>
        </Sender>
      </Party>
      <PayloadAttributes>
        <PrimaryLangID>EN</PrimaryLangID>
      </PayloadAttributes>
      <Request>
        <OrderFilterCriteria>
          <Order>
            <OrderID>${orderId}</OrderID>
            <OwnerCode>PK</OwnerCode>
          </Order>
        </OrderFilterCriteria>
      </Request>
    </IATA_OrderRetrieveRQ>
  </soapenv:Body>
</soapenv:Envelope>`;

  let soapUrl = process.env.HITIT_AIRSHOPPING_URL;
  if (!soapUrl) {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
  }

  console.log("[Hitit NDC] DoOrderRetrieve SOAP URL:", soapUrl);

  const response = await fetch(soapUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "application/xml",
      SOAPAction: "IATA_OrderRetrieveRQ",
      username: username,
      password: password,
    },
    body: soapEnvelope,
  });

  const responseText = await response.text();
  console.log("[Hitit NDC] DoOrderRetrieve Response Status:", response.status);
  console.log("[Hitit NDC] DoOrderRetrieve Raw Response:", responseText.substring(0, 500));

  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitCharkey: false,
    trim: true,
    normalize: true,
    ignoreAttrs: false,
    strict: false,
  });

  return await parser.parseStringPromise(responseText);
}

/**
 * DoOrderCancel - Cancel reservation or refund ticketed PNR
 * @param {Object} params - Order cancellation parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {string} params.action - Action type: "VIEW_ONLY" (preview) or "COMMIT" (execute)
 * @param {Object} params.changeOrder - Change order information (for COMMIT)
 * @returns {Promise<Object>} Order cancellation response
 */
// async function doOrderCancel(params) {
//   const { orderId, ownerCode = "PK", currency = "PKR" } = params || {};
//   const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
//   const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";

//   console.log("[Hitit NDC] DoOrderCancel Params:", { orderId, ownerCode, currency });

//   // Minified SOAP XML with MessageDoc to eliminate whitespace NPE and provide required metadata
//   const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_OrderChangeRQ"><soapenv:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><wsse:UsernameToken><wsse:Username>${username}</wsse:Username><wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password></wsse:UsernameToken></wsse:Security></soapenv:Header><soapenv:Body><IATA_OrderChangeRQ><MessageDoc><Name>NDC GATEWAY</Name><RefVersionNumber>20.1</RefVersionNumber></MessageDoc><Party><Sender><TravelAgency><AgencyID>SELENS</AgencyID><Name>NDC GATEWAY</Name></TravelAgency></Sender></Party><PayloadAttributes><PrimaryLangID>EN</PrimaryLangID></PayloadAttributes><Request><ChangeOrder><CancelOrder><OrderRefID>${orderId}</OrderRefID></CancelOrder></ChangeOrder><Order><OrderID>${orderId}</OrderID><OwnerCode>PK</OwnerCode></Order><OrderChangeParameters><CurParameter><CurCode>PKR</CurCode></CurParameter></OrderChangeParameters></Request></IATA_OrderChangeRQ></soapenv:Body></soapenv:Envelope>`;

//   let soapUrl = process.env.HITIT_AIRSHOPPING_URL;
//   if (!soapUrl) {
//     const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
//     soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
//   }

//   console.log("[Hitit NDC] DoOrderCancel SOAP URL:", soapUrl);
//   console.log("[Hitit NDC] DoOrderCancel SOAP Envelope (Minified):", soapEnvelope);

//   const response = await fetch(soapUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "text/xml; charset=utf-8",
//       Accept: "application/xml",
//       username: username,
//       password: password,
//       SOAPAction: "IATA_OrderChangeRQ",
//     },
//     body: soapEnvelope,
//   });

//   const responseText = await response.text();
//   console.log("[Hitit NDC] DoOrderCancel Response Status:", response.status);
//   console.log("[Hitit NDC] DoOrderCancel Raw Response:", responseText.substring(0, 500));

//   const parser = new xml2js.Parser({
//     explicitArray: false,
//     mergeAttrs: true,
//     explicitCharkey: false,
//     trim: true,
//     normalize: true,
//     ignoreAttrs: false,
//     strict: false,
//     ignoreNamespaces: false,
//   });

//   try {
//     const result = await parser.parseStringPromise(responseText);
//     return result;
//   } catch (parseError) {
//     console.error("XML parse error in DoOrderCancel:", parseError);
//     return { rawXml: responseText, parseError: parseError.message };
//   }
// }
async function doOrderCancel(params) {
  const { orderId, action, changeOrder } = params || {};

  // VIEW_ONLY: keep existing DoOrderCancelPreview flow via NDC wrapper
  if (action === "VIEW_ONLY") {
    const partyBlock = buildPartyBlock();

    let changeOrderXml = "";
    if (changeOrder && changeOrder.orderItemRefID) {
      changeOrderXml = `<ChangeOrder>
      <OrderItemRefID>${changeOrder.orderItemRefID}</OrderItemRefID>
    </ChangeOrder>`;
    }

    const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoOrderCancel>
    <Order>
      <OrderID>${orderId}</OrderID>
    </Order>
    ${changeOrderXml}
  </DoOrderCancel>
</CraneNDCService>`;

    const method = "DoOrderCancelPreview";
    return await makeNdcRequest(method, requestBody);
  }

  // COMMIT: use IATA_OrderChangeRQ + CancelOrder, matching working SoapUI sample
  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";
  const agencyId = process.env.HITIT_AGENCY_ID || HITIT?.AGENCY_ID || "HITITADMIN";
  const agencyName = process.env.HITIT_AGENCY_NAME || HITIT?.AGENCY_NAME || "HITIT COMPUTER SERVICES";

  // VERBATIM MATCH TO USER'S WORKING SOAPUI SAMPLE
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_OrderChangeRQ">
   <soapenv:Header>
      <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
         <wsse:UsernameToken>
            <wsse:Username>${username}</wsse:Username>
            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
         </wsse:UsernameToken>
      </wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <IATA_OrderChangeRQ>
         <MessageDoc>
            <Name>NDC GATEWAY</Name>
            <RefVersionNumber>20.1</RefVersionNumber>
         </MessageDoc>
         <Party>
            <Sender>
               <TravelAgency>
                  <AgencyID>${agencyId}</AgencyID>
                  <Name>${agencyName}</Name>
               </TravelAgency>
            </Sender>
         </Party>
         <PayloadAttributes>
            <PrimaryLangID>EN</PrimaryLangID>
         </PayloadAttributes>
         <Request>
            <ChangeOrder>
               <CancelOrder>
                  <OrderRefID>${orderId}</OrderRefID>
               </CancelOrder>
            </ChangeOrder>
            <Order>
               <OrderID>${orderId}</OrderID>
               <OwnerCode>PK</OwnerCode>
            </Order>
            <OrderChangeParameters>
               <CurParameter>
                  <CurCode>PKR</CurCode>
               </CurParameter>
            </OrderChangeParameters>
         </Request>
      </IATA_OrderChangeRQ>
   </soapenv:Body>
</soapenv:Envelope>`;

  let soapUrl = process.env.HITIT_AIRSHOPPING_URL;
  if (!soapUrl) {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
  }

  console.log("[Hitit NDC] DoOrderCancel SOAP URL:", soapUrl);
  console.log("[Hitit NDC] DoOrderCancel SOAP Envelope (Sent):", soapEnvelope);

  const response = await fetch(soapUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "application/xml",
      SOAPAction: "cranendc/doOrderCancelCommit",
      username: username,
      password: password,
    },
    body: soapEnvelope,
  });

  const responseText = await response.text();
  console.log("[Hitit NDC] DoOrderCancel Response Status:", response.status);
  console.log("[Hitit NDC] DoOrderCancel Raw Response:", responseText.substring(0, 1000));

  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitCharkey: false,
    trim: true,
    normalize: true,
    ignoreAttrs: false,
    strict: false,
  });

  const json = await parser.parseStringPromise(responseText);

  return {
    status: response.status,
    ok: response.ok,
    body: json,
    rawXml: responseText,
  };
}
/**
 * DoOrderChange - Complete ticketing for Option PNR or add SSRs to ticketed PNR
 * @param {Object} params - Order change parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {string} params.ownerCode - Owner code (default: PK)
 * @param {Object} params.paymentFunctions - Payment information
 * @param {string} params.currency - Currency code (default: PKR)
 * @returns {Promise<Object>} Order change response
 */
async function doOrderChange(params) {
  const { orderId, ownerCode = "PK", paymentFunctions, currency = "PKR", agencyId: paramAgencyId } = params || {};
  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";
  const agencyId = paramAgencyId || process.env.HITIT_AGENCY_ID || HITIT?.AGENCY_ID || "HITITADMIN";
  const agencyName = process.env.HITIT_AGENCY_NAME || HITIT?.AGENCY_NAME || "HITIT COMPUTER SERVICES";

  // Build PaymentFunctions XML
  let paymentFunctionsXml = "";
  if (paymentFunctions) {
    paymentFunctionsXml = "<PaymentFunctions>";

    // Handle both array and single object
    const payments = Array.isArray(paymentFunctions) ? paymentFunctions :
      (paymentFunctions.paymentProcessingDetails ? [paymentFunctions.paymentProcessingDetails] : [paymentFunctions]);

    payments.forEach((payment, index) => {
      let paymentMethodXml = "";
      const typeCode = payment.typeCode || payment.paymentMethod?.typeCode || "MCO";

      if (payment.paymentMethod?.accountableDoc) {
        const doc = payment.paymentMethod.accountableDoc;
        paymentMethodXml = `
            <PaymentMethod>
              <AccountableDoc>
                <DocType>${doc.docType || "MCO"}</DocType>
                <TicketID>${doc.ticketId}</TicketID>
              </AccountableDoc>
            </PaymentMethod>`;
      } else if (payment.paymentMethod?.paymentCard) {
        const card = payment.paymentMethod.paymentCard;
        paymentMethodXml = `
            <PaymentMethod>
              <PaymentCard>
                <CardHolderName>${card.cardHolderName}</CardHolderName>
                <CardNumber>${card.cardNumber}</CardNumber>
                <CardSecurityCode>${card.cardSecurityCode}</CardSecurityCode>
                <ExpirationDate>${card.expirationDate}</ExpirationDate>
              </PaymentCard>
            </PaymentMethod>`;
      } else if (typeCode === "INV") {
        paymentMethodXml = `
            <PaymentMethod>
              <OtherMethod>
                <Name>INVOICE</Name>
              </OtherMethod>
            </PaymentMethod>`;
      }

      const formattedAmount = payment.amount ? Number(payment.amount).toFixed(2) : "0.00";

      paymentFunctionsXml += `
          <PaymentProcessingDetails>
            <Amount CurCode="${payment.currency || currency}">${formattedAmount}</Amount>
            ${paymentMethodXml.trim()}
            <PaymentRefID>${payment.paymentRefID || `PaymentInfo${index + 1}`}</PaymentRefID>
            <TypeCode>${typeCode}</TypeCode>
          </PaymentProcessingDetails>`;
    });

    paymentFunctionsXml += "\n        </PaymentFunctions>";
  }

  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_OrderChangeRQ">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <IATA_OrderChangeRQ>
      <MessageDoc>
        <Name>NDC GATEWAY</Name>
        <RefVersionNumber>20.1</RefVersionNumber>
      </MessageDoc>
      <Party>
        <Sender>
          <TravelAgency>
            <AgencyID>${agencyId}</AgencyID>
            <Name>${agencyName}</Name>
          </TravelAgency>
        </Sender>
      </Party>
      <PayloadAttributes>
        <PrimaryLangID>EN</PrimaryLangID>
      </PayloadAttributes>
      <Request>
        <Order>
          <OrderID>${orderId}</OrderID>
          <OwnerCode>${ownerCode}</OwnerCode>
        </Order>
        <OrderChangeParameters>
          <CurParameter>
            <CurCode>${currency}</CurCode>
          </CurParameter>
        </OrderChangeParameters>
        ${paymentFunctionsXml}
      </Request>
    </IATA_OrderChangeRQ>
  </soapenv:Body>
</soapenv:Envelope>`;

  let soapUrl = process.env.HITIT_AIRSHOPPING_URL;
  if (!soapUrl) {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
  }

  console.log("[Hitit NDC] DoOrderChange SOAP URL:", soapUrl);
  console.log("[Hitit NDC] DoOrderChange SOAP Envelope:", soapEnvelope);

  const response = await fetch(soapUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Accept": "application/xml",
      "SOAPAction": "cranendc/doOrderChange",
      "username": username,
      "password": password,
    },
    body: soapEnvelope,
  });

  const responseText = await response.text();

  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitCharkey: false,
    trim: true,
    normalize: true,
    ignoreAttrs: false,
    strict: false,
  });

  try {
    const parsed = await parser.parseStringPromise(responseText);

    if (!response.ok) {
      // Find fault in common locations (case-insensitive)
      const envelope = parsed?.["S:ENVELOPE"] || parsed?.["S:Envelope"] || parsed?.["SOAPENV:ENVELOPE"] || parsed?.["soapenv:Envelope"] || parsed;
      const body = envelope?.["S:BODY"] || envelope?.["S:Body"] || envelope?.["SOAPENV:BODY"] || envelope?.["soapenv:Body"] || envelope;
      const fault = body?.["S:FAULT"] || body?.["S:Fault"] || body?.["SOAPENV:FAULT"] || body?.["soapenv:Fault"] || body?.["Fault"];

      return {
        status: "error",
        code: response.status,
        message: fault?.["FAULTSTRING"] || fault?.["faultstring"] || "SOAP Server Error (NPE)",
        details: fault || null,
        rawXml: responseText
      };
    }

    return parsed;
  } catch (parseError) {
    console.error("Error processing DoOrderChange response:", parseError);
    return {
      status: "error",
      code: response.status,
      message: "Failed to parse API response",
      error: parseError.message,
      rawXml: responseText
    };
  }
}

/**
 * DoTicketPreview - Preview ticket pricing before ticketing
 * @param {Object} params - Ticket preview parameters
 * @param {string} params.orderId - PNR/Order ID
 * @returns {Promise<Object>} Ticket preview response
 */
async function doTicketPreview(params) {
  const partyBlock = buildPartyBlock();

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoTicketPreview>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
  </DoTicketPreview>
</CraneNDCService>`;

  return await makeNdcRequest("DoTicketPreview", requestBody);
}

/**
 * DoVoidTicket - Void a ticket via IATA_OrderChangeRQ
 * @param {Object} params - Void ticket parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {string} params.ticketDocNbr - Ticket document number to void
 * @returns {Promise<Object>} Void ticket response
 */
async function doVoidTicket(params) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("!!! RUNNING NEW VOID TICKET CODE FROM hititNdcService.js !!!");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  const { orderId, ticketDocNbr } = params || {};
  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";
  const agencyId = process.env.HITIT_AGENCY_ID || HITIT?.AGENCY_ID || "HITITADMIN";
  const agencyName = process.env.HITIT_AGENCY_NAME || HITIT?.AGENCY_NAME || "HITIT COMPUTER SERVICES";

  // VERBATIM MATCH TO USER'S WORKING SOAPUI SAMPLE
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_OrderChangeRQ">
   <soapenv:Header>
      <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
         <wsse:UsernameToken>
            <wsse:Username>${username}</wsse:Username>
            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
         </wsse:UsernameToken>
      </wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <IATA_OrderChangeRQ>
         <Party>
            <Sender>
               <TravelAgency>
                  <AgencyID>${agencyId}</AgencyID>
                  <Name>${agencyName}</Name>
               </TravelAgency>
            </Sender>
         </Party>
         <PayloadAttributes>
            <PrimaryLangID>EN</PrimaryLangID>
         </PayloadAttributes>
         <Request>
            <Order>
               <OrderID>${orderId}</OrderID>
               <OwnerCode>PK</OwnerCode>
            </Order>
            <OrderChangeParameters>
               <CurParameter>
                  <CurCode>PKR</CurCode>
               </CurParameter>
            </OrderChangeParameters>
            <PaymentFunctions>
               <PaymentProcessingDetails>
                  <PaymentMethod>
                     <AccountableDoc>
                        <DocType>TICKET</DocType>
                        <TicketID>${ticketDocNbr}</TicketID>
                     </AccountableDoc>
                  </PaymentMethod>
                  <TypeCode>VOID</TypeCode>
               </PaymentProcessingDetails>
            </PaymentFunctions>
         </Request>
      </IATA_OrderChangeRQ>
   </soapenv:Body>
</soapenv:Envelope>`;

  let soapUrl = process.env.HITIT_AIRSHOPPING_URL;
  if (!soapUrl) {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
  }

  console.log("[Hitit NDC] DoVoidTicket SOAP URL:", soapUrl);
  console.log("[Hitit NDC] DoVoidTicket SOAP Envelope:", soapEnvelope);

  try {
    const response = await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        Accept: "application/xml",
        SOAPAction: "cranendc/doVoidTicket",
        username: username,
        password: password,
      },
      body: soapEnvelope,
    });

    const responseText = await response.text();

    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitCharkey: false,
      trim: true,
      normalize: true,
      ignoreAttrs: false,
      strict: false,
    });

    const result = await parser.parseStringPromise(responseText);

    // Return the parsed result even if it's a SOAP Fault or error
    return {
      status: response.status,
      ok: response.ok,
      body: result,
      rawXml: responseText
    };
  } catch (error) {
    console.error("Error in doVoidTicket:", error);
    throw error;
  }
}

/**
 * DoOrderFare - Get fare rules (IATA_OrderRulesRQ)
 * @param {Object} params - Fare rules parameters
 * @returns {Promise<Object>} Fare rules response
 */
async function doOrderFare(params) {
  const { airlineCode = "PK", origin, destination, departureDate, fareBasisCode, currency = "PKR" } = params || {};
  const username = process.env.HITIT_USERNAME || HITIT?.USERNAME || "";
  const password = process.env.HITIT_PASSWORD || HITIT?.PASSWORD || "";
  const agencyId = process.env.HITIT_AGENCY_ID || HITIT?.AGENCY_ID || "HITITADMIN";
  const agencyName = process.env.HITIT_AGENCY_NAME || HITIT?.AGENCY_NAME || "HITIT COMPUTER SERVICES";

  // VERBATIM MATCH TO USER'S WORKING SOAPUI SAMPLE (Step 904)
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:iata="http://www.iata.org/IATA/2015/00/2020.1/IATA_OrderRulesRQ">
	<soapenv:Header>
	   <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
	      <wsse:UsernameToken>
	         <wsse:Username>${username}</wsse:Username>
	         <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
	      </wsse:UsernameToken>
	   </wsse:Security>
	</soapenv:Header>
	<soapenv:Body>
	<iata:IATA_OrderRulesRQ>
	<iata:Party>
	<iata:Sender>
	<iata:TravelAgency>
 	<iata:AgencyID>${agencyId}</iata:AgencyID>
	<iata:Name>${agencyName}</iata:Name>
	</iata:TravelAgency>
	</iata:Sender>
	</iata:Party>
	<iata:PayloadAttributes>
	<iata:PrimaryLangID>EN</iata:PrimaryLangID>
	<iata:Timestamp>${new Date().toISOString().split('.')[0]}</iata:Timestamp>
	</iata:PayloadAttributes>
	<iata:Request>
	<iata:CoreRequest>
	<iata:FareRef>
	<iata:AirlineDesigCode>${airlineCode}</iata:AirlineDesigCode>
	<iata:Arrival>
	<iata:IATA_LocationCode>${destination}</iata:IATA_LocationCode>
	</iata:Arrival>
	<iata:Dep>
	<iata:IATA_LocationCode>${origin}</iata:IATA_LocationCode>
	<iata:AircraftScheduledDateTime>${departureDate}</iata:AircraftScheduledDateTime>
	</iata:Dep>
	<iata:FareBasisCode>${fareBasisCode}</iata:FareBasisCode>
	</iata:FareRef>
	</iata:CoreRequest>
	<iata:ResponseParameters>
	<iata:CurParameter>
	<iata:CurCode>${currency}</iata:CurCode>
	</iata:CurParameter>
	<iata:Device>
	<iata:DeviceOwnerTypeCode>SL</iata:DeviceOwnerTypeCode>
	</iata:Device>
	<iata:LangUsage>
	<iata:LangCode>EN</iata:LangCode>
	</iata:LangUsage>
	</iata:ResponseParameters>
	</iata:Request>
	</iata:IATA_OrderRulesRQ>
	</soapenv:Body>
</soapenv:Envelope>`;

  let soapUrl = process.env.HITIT_AIRSHOPPING_URL;
  if (!soapUrl) {
    const baseUrl = process.env.HITIT_BASE_URL || HITIT?.BASE_URL || "";
    soapUrl = baseUrl.endsWith("/") ? `${baseUrl}CraneNDCService` : `${baseUrl}/CraneNDCService`;
  }

  console.log("[Hitit NDC] DoOrderFare SOAP URL:", soapUrl);

  try {
    const response = await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        Accept: "application/xml",
        SOAPAction: "IATA_OrderRulesRQ",
        username: username,
        password: password,
      },
      body: soapEnvelope,
    });

    const responseText = await response.text();

    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitCharkey: false,
      trim: true,
      normalize: true,
      ignoreAttrs: false,
      strict: false,
    });

    const result = await parser.parseStringPromise(responseText);

    return {
      status: response.status,
      ok: response.ok,
      body: result,
      rawXml: responseText
    };
  } catch (error) {
    console.error("Error in doOrderFare:", error);
    throw error;
  }
}

/**
 * DoServiceList - Get available ancillary services for a PNR
 * @param {Object} params - Service list parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {string} params.offerId - Offer ID
 * @returns {Promise<Object>} Service list response
 */
async function doServiceList(params) {
  const partyBlock = buildPartyBlock();

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoServiceList>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
    ${params.offerId ? `<OfferID>${params.offerId}</OfferID>` : ""}
  </DoServiceList>
</CraneNDCService>`;

  return await makeNdcRequest("DoServiceList", requestBody);
}

/**
 * DoSeatAvailability - Get seat availability for a flight
 * @param {Object} params - Seat availability parameters
 * @param {string} params.airlineCode - Airline code
 * @param {string} params.ownerCode - Owner code
 * @param {string} params.bookingId - Booking ID (PNR)
 * @param {Object} params.originDest - Origin/destination flight details
 * @returns {Promise<Object>} Seat availability response
 */
async function doSeatAvailability(params) {
  const partyBlock = buildPartyBlock();

  let originDestXml = "";
  if (params.originDest) {
    originDestXml = `<OriginDest>
      <Dep>
        <IATA_LocationCode>${params.originDest.departureCode}</IATA_LocationCode>
        <AircraftScheduledDateTime>${params.originDest.departureDateTime}</AircraftScheduledDateTime>
      </Dep>
      <Arrival>
        <IATA_LocationCode>${params.originDest.arrivalCode}</IATA_LocationCode>
        <AircraftScheduledDateTime>${params.originDest.arrivalDateTime}</AircraftScheduledDateTime>
      </Arrival>
      <MarketingCarrierInfo>
        <CarrierDesigCode>${params.originDest.carrierCode}</CarrierDesigCode>
        <MarketingCarrierFlightNumberText>${params.originDest.flightNumber}</MarketingCarrierFlightNumberText>
      </MarketingCarrierInfo>
    </OriginDest>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoSeatAvailability>
    <CoreRequest>
      <AirlineDesigCode>${params.airlineCode}</AirlineDesigCode>
      <OwnerCode>${params.ownerCode}</OwnerCode>
      <BookingID>${params.bookingId}</BookingID>
    </CoreRequest>
    ${originDestXml}
  </DoSeatAvailability>
</CraneNDCService>`;

  return await makeNdcRequest("DoSeatAvailability", requestBody);
}

/**
 * DoBaggageServiceList - Get baggage service options
 * @param {Object} params - Baggage service list parameters
 * @param {string} params.orderId - PNR/Order ID
 * @returns {Promise<Object>} Baggage service list response
 */
async function doBaggageServiceList(params) {
  const partyBlock = buildPartyBlock();

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoBaggageServiceList>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
  </DoBaggageServiceList>
</CraneNDCService>`;

  return await makeNdcRequest("DoBaggageServiceList", requestBody);
}

/**
 * DoAddAncillary - Add SSR (Special Service Request) to PNR
 * @param {Object} params - Add ancillary parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {Object} params.changeOrder - Change order with selected services
 * @param {Object} params.dataLists - Data lists (segments, passengers, services)
 * @returns {Promise<Object>} Add ancillary response
 */
async function doAddAncillary(params) {
  const partyBlock = buildPartyBlock();

  // Build ChangeOrder with SelectedALaCarteOfferItem
  let changeOrderXml = "";
  if (params.changeOrder) {
    changeOrderXml = `<ChangeOrder>`;

    if (params.changeOrder.selectedALaCarteOfferItems) {
      changeOrderXml += `<SelectedALaCarteOfferItem>`;
      params.changeOrder.selectedALaCarteOfferItems.forEach((item) => {
        changeOrderXml += `
          <OfferItemID>${item.offerItemId}</OfferItemID>
          ${item.paxRefID ? `<PaxRefID>${item.paxRefID}</PaxRefID>` : ""}
          ${item.paxSegmentRefID
            ? `<PaxSegmentRefID>${item.paxSegmentRefID}</PaxSegmentRefID>`
            : ""
          }
          ${item.serviceCode
            ? `<ServiceCode>${item.serviceCode}</ServiceCode>`
            : ""
          }
          ${item.columnId ? `<ColumnID>${item.columnId}</ColumnID>` : ""}
          ${item.seatRowNumber
            ? `<SeatRowNumber>${item.seatRowNumber}</SeatRowNumber>`
            : ""
          }
          ${item.selectedServiceDefinitionRefID
            ? `<SelectedServiceDefinitionRefID>${item.selectedServiceDefinitionRefID}</SelectedServiceDefinitionRefID>`
            : ""
          }`;
      });
      changeOrderXml += `</SelectedALaCarteOfferItem>`;
    }

    changeOrderXml += `</ChangeOrder>`;
  }

  // Build DataLists
  let dataListsXml = "";
  if (params.dataLists) {
    dataListsXml = `<DataLists>`;

    // OriginDestList
    if (params.dataLists.originDestList) {
      dataListsXml += `<OriginDestList>`;
      params.dataLists.originDestList.forEach((od) => {
        dataListsXml += `
          <OriginDest>
            <OriginDestID>${od.originDestID}</OriginDestID>
            <OriginCode>${od.originCode}</OriginCode>
            <DestCode>${od.destCode}</DestCode>
          </OriginDest>`;
      });
      dataListsXml += `</OriginDestList>`;
    }

    // PaxJourneyList
    if (params.dataLists.paxJourneyList) {
      dataListsXml += `<PaxJourneyList>`;
      params.dataLists.paxJourneyList.forEach((journey) => {
        dataListsXml += `
          <PaxJourney>
            <PaxJourneyID>${journey.paxJourneyID}</PaxJourneyID>
            ${journey.paxSegmentRefIDs
            ? journey.paxSegmentRefIDs
              .map((ref) => `<PaxSegmentRefID>${ref}</PaxSegmentRefID>`)
              .join("")
            : ""
          }
          </PaxJourney>`;
      });
      dataListsXml += `</PaxJourneyList>`;
    }

    // PaxList
    if (params.dataLists.paxList) {
      dataListsXml += `<PaxList>`;
      params.dataLists.paxList.forEach((pax) => {
        dataListsXml += `
          <Pax>
            <PaxID>${pax.paxID}</PaxID>
            <PTC>${pax.ptc}</PTC>
          </Pax>`;
      });
      dataListsXml += `</PaxList>`;
    }

    // PaxSegmentList
    if (params.dataLists.paxSegmentList) {
      dataListsXml += `<PaxSegmentList>`;
      params.dataLists.paxSegmentList.forEach((segment) => {
        dataListsXml += `
          <PaxSegment>
            <PaxSegmentID>${segment.paxSegmentID}</PaxSegmentID>
            <Dep>
              <IATA_LocationCode>${segment.departureCode}</IATA_LocationCode>
              <AircraftScheduledDateTime>${segment.departureDateTime}</AircraftScheduledDateTime>
            </Dep>
            <Arrival>
              <IATA_LocationCode>${segment.arrivalCode}</IATA_LocationCode>
              <AircraftScheduledDateTime>${segment.arrivalDateTime}</AircraftScheduledDateTime>
            </Arrival>
            <MarketingCarrierInfo>
              <CarrierDesigCode>${segment.carrierCode}</CarrierDesigCode>
              <MarketingCarrierFlightNumberText>${segment.flightNumber}</MarketingCarrierFlightNumberText>
            </MarketingCarrierInfo>
          </PaxSegment>`;
      });
      dataListsXml += `</PaxSegmentList>`;
    }

    // ServiceDefinitionList
    if (params.dataLists.serviceDefinitionList) {
      dataListsXml += `<ServiceDefinitionList>`;
      params.dataLists.serviceDefinitionList.forEach((service) => {
        dataListsXml += `
          <ServiceDefinition>
            <ServiceDefinitionID>${service.serviceDefinitionID
          }</ServiceDefinitionID>
            <ServiceCode>${service.serviceCode}</ServiceCode>
            ${service.name ? `<Name>${service.name}</Name>` : ""}
          </ServiceDefinition>`;
      });
      dataListsXml += `</ServiceDefinitionList>`;
    }

    dataListsXml += `</DataLists>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoAddAncillary>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
    ${changeOrderXml}
    ${dataListsXml}
  </DoAddAncillary>
</CraneNDCService>`;

  return await makeNdcRequest("DoAddAncillary", requestBody);
}

/**
 * DoDeleteAncillary - Delete SSR from PNR
 * @param {Object} params - Delete ancillary parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {Object} params.changeOrder - Change order with services to delete
 * @param {Object} params.dataLists - Data lists
 * @returns {Promise<Object>} Delete ancillary response
 */
async function doDeleteAncillary(params) {
  const partyBlock = buildPartyBlock();

  // Build ChangeOrder with services to delete (similar structure to DoAddAncillary)
  let changeOrderXml = "";
  if (params.changeOrder) {
    changeOrderXml = `<ChangeOrder>`;

    if (params.changeOrder.selectedALaCarteOfferItems) {
      changeOrderXml += `<SelectedALaCarteOfferItem>`;
      params.changeOrder.selectedALaCarteOfferItems.forEach((item) => {
        changeOrderXml += `
          <OfferItemID>${item.offerItemId}</OfferItemID>
          ${item.paxRefID ? `<PaxRefID>${item.paxRefID}</PaxRefID>` : ""}
          ${item.paxSegmentRefID
            ? `<PaxSegmentRefID>${item.paxSegmentRefID}</PaxSegmentRefID>`
            : ""
          }`;
      });
      changeOrderXml += `</SelectedALaCarteOfferItem>`;
    }

    changeOrderXml += `</ChangeOrder>`;
  }

  // Build DataLists (same structure as DoAddAncillary)
  let dataListsXml = "";
  if (params.dataLists) {
    dataListsXml = `<DataLists>`;

    if (params.dataLists.originDestList) {
      dataListsXml += `<OriginDestList>`;
      params.dataLists.originDestList.forEach((od) => {
        dataListsXml += `
          <OriginDest>
            <OriginDestID>${od.originDestID}</OriginDestID>
            <OriginCode>${od.originCode}</OriginCode>
            <DestCode>${od.destCode}</DestCode>
          </OriginDest>`;
      });
      dataListsXml += `</OriginDestList>`;
    }

    if (params.dataLists.paxJourneyList) {
      dataListsXml += `<PaxJourneyList>`;
      params.dataLists.paxJourneyList.forEach((journey) => {
        dataListsXml += `
          <PaxJourney>
            <PaxJourneyID>${journey.paxJourneyID}</PaxJourneyID>
            ${journey.paxSegmentRefIDs
            ? journey.paxSegmentRefIDs
              .map((ref) => `<PaxSegmentRefID>${ref}</PaxSegmentRefID>`)
              .join("")
            : ""
          }
          </PaxJourney>`;
      });
      dataListsXml += `</PaxJourneyList>`;
    }

    if (params.dataLists.paxList) {
      dataListsXml += `<PaxList>`;
      params.dataLists.paxList.forEach((pax) => {
        dataListsXml += `
          <Pax>
            <PaxID>${pax.paxID}</PaxID>
            <PTC>${pax.ptc}</PTC>
          </Pax>`;
      });
      dataListsXml += `</PaxList>`;
    }

    if (params.dataLists.paxSegmentList) {
      dataListsXml += `<PaxSegmentList>`;
      params.dataLists.paxSegmentList.forEach((segment) => {
        dataListsXml += `
          <PaxSegment>
            <PaxSegmentID>${segment.paxSegmentID}</PaxSegmentID>
            <Dep>
              <IATA_LocationCode>${segment.departureCode}</IATA_LocationCode>
              <AircraftScheduledDateTime>${segment.departureDateTime}</AircraftScheduledDateTime>
            </Dep>
            <Arrival>
              <IATA_LocationCode>${segment.arrivalCode}</IATA_LocationCode>
              <AircraftScheduledDateTime>${segment.arrivalDateTime}</AircraftScheduledDateTime>
            </Arrival>
            <MarketingCarrierInfo>
              <CarrierDesigCode>${segment.carrierCode}</CarrierDesigCode>
              <MarketingCarrierFlightNumberText>${segment.flightNumber}</MarketingCarrierFlightNumberText>
            </MarketingCarrierInfo>
          </PaxSegment>`;
      });
      dataListsXml += `</PaxSegmentList>`;
    }

    if (params.dataLists.serviceDefinitionList) {
      dataListsXml += `<ServiceDefinitionList>`;
      params.dataLists.serviceDefinitionList.forEach((service) => {
        dataListsXml += `
          <ServiceDefinition>
            <ServiceDefinitionID>${service.serviceDefinitionID
          }</ServiceDefinitionID>
            <ServiceCode>${service.serviceCode}</ServiceCode>
            ${service.name ? `<Name>${service.name}</Name>` : ""}
          </ServiceDefinition>`;
      });
      dataListsXml += `</ServiceDefinitionList>`;
    }

    dataListsXml += `</DataLists>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoDeleteAncillary>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
    ${changeOrderXml}
    ${dataListsXml}
  </DoDeleteAncillary>
</CraneNDCService>`;

  return await makeNdcRequest("DoDeleteAncillary", requestBody);
}

/**
 * DoSellAncillary - Purchase/ticket SSR
 * @param {Object} params - Sell ancillary parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {Object} params.paymentFunctions - Payment information
 * @param {Object} params.changeOrder - Change order with services to sell
 * @param {Object} params.dataLists - Data lists
 * @returns {Promise<Object>} Sell ancillary response
 */
async function doSellAncillary(params) {
  const partyBlock = buildPartyBlock();

  // Build PaymentFunctions
  let paymentFunctionsXml = "";
  if (params.paymentFunctions) {
    const payment = params.paymentFunctions.paymentProcessingDetails;
    paymentFunctionsXml = `<PaymentFunctions>
      <PaymentProcessingDetails>
        <Amount CurCode="${payment.currency || "PKR"}">${payment.amount
      }</Amount>
        <PaymentRefID>${payment.paymentRefID}</PaymentRefID>
        <TypeCode>${payment.typeCode}</TypeCode>
        ${payment.paymentMethod?.paymentCard
        ? `
        <PaymentMethod>
          <PaymentCard>
            <CardHolderName>${payment.paymentMethod.paymentCard.cardHolderName}</CardHolderName>
            <CardNumber>${payment.paymentMethod.paymentCard.cardNumber}</CardNumber>
            <CardSecurityCode>${payment.paymentMethod.paymentCard.cardSecurityCode}</CardSecurityCode>
            <ExpirationDate>${payment.paymentMethod.paymentCard.expirationDate}</ExpirationDate>
          </PaymentCard>
        </PaymentMethod>`
        : ""
      }
      </PaymentProcessingDetails>
    </PaymentFunctions>`;
  }

  // Build ChangeOrder (similar to DoAddAncillary)
  let changeOrderXml = "";
  if (params.changeOrder) {
    changeOrderXml = `<ChangeOrder>`;
    if (params.changeOrder.selectedALaCarteOfferItems) {
      changeOrderXml += `<SelectedALaCarteOfferItem>`;
      params.changeOrder.selectedALaCarteOfferItems.forEach((item) => {
        changeOrderXml += `<OfferItemID>${item.offerItemId}</OfferItemID>`;
      });
      changeOrderXml += `</SelectedALaCarteOfferItem>`;
    }
    changeOrderXml += `</ChangeOrder>`;
  }

  // Build DataLists (similar structure to DoAddAncillary)
  let dataListsXml = "";
  if (params.dataLists) {
    dataListsXml = `<DataLists>`;

    if (params.dataLists.originDestList) {
      dataListsXml += `<OriginDestList>`;
      params.dataLists.originDestList.forEach((od) => {
        dataListsXml += `
          <OriginDest>
            <OriginDestID>${od.originDestID}</OriginDestID>
            <OriginCode>${od.originCode}</OriginCode>
            <DestCode>${od.destCode}</DestCode>
          </OriginDest>`;
      });
      dataListsXml += `</OriginDestList>`;
    }

    if (params.dataLists.paxJourneyList) {
      dataListsXml += `<PaxJourneyList>`;
      params.dataLists.paxJourneyList.forEach((journey) => {
        dataListsXml += `
          <PaxJourney>
            <PaxJourneyID>${journey.paxJourneyID}</PaxJourneyID>
            ${journey.paxSegmentRefIDs
            ? journey.paxSegmentRefIDs
              .map((ref) => `<PaxSegmentRefID>${ref}</PaxSegmentRefID>`)
              .join("")
            : ""
          }
          </PaxJourney>`;
      });
      dataListsXml += `</PaxJourneyList>`;
    }

    if (params.dataLists.paxList) {
      dataListsXml += `<PaxList>`;
      params.dataLists.paxList.forEach((pax) => {
        dataListsXml += `
          <Pax>
            <PaxID>${pax.paxID}</PaxID>
            <PTC>${pax.ptc}</PTC>
          </Pax>`;
      });
      dataListsXml += `</PaxList>`;
    }

    if (params.dataLists.paxSegmentList) {
      dataListsXml += `<PaxSegmentList>`;
      params.dataLists.paxSegmentList.forEach((segment) => {
        dataListsXml += `
          <PaxSegment>
            <PaxSegmentID>${segment.paxSegmentID}</PaxSegmentID>
            <Dep>
              <IATA_LocationCode>${segment.departureCode}</IATA_LocationCode>
              <AircraftScheduledDateTime>${segment.departureDateTime}</AircraftScheduledDateTime>
            </Dep>
            <Arrival>
              <IATA_LocationCode>${segment.arrivalCode}</IATA_LocationCode>
              <AircraftScheduledDateTime>${segment.arrivalDateTime}</AircraftScheduledDateTime>
            </Arrival>
            <MarketingCarrierInfo>
              <CarrierDesigCode>${segment.carrierCode}</CarrierDesigCode>
              <MarketingCarrierFlightNumberText>${segment.flightNumber}</MarketingCarrierFlightNumberText>
            </MarketingCarrierInfo>
          </PaxSegment>`;
      });
      dataListsXml += `</PaxSegmentList>`;
    }

    if (params.dataLists.serviceDefinitionList) {
      dataListsXml += `<ServiceDefinitionList>`;
      params.dataLists.serviceDefinitionList.forEach((service) => {
        dataListsXml += `
          <ServiceDefinition>
            <ServiceDefinitionID>${service.serviceDefinitionID
          }</ServiceDefinitionID>
            <ServiceCode>${service.serviceCode}</ServiceCode>
            ${service.name ? `<Name>${service.name}</Name>` : ""}
          </ServiceDefinition>`;
      });
      dataListsXml += `</ServiceDefinitionList>`;
    }

    dataListsXml += `</DataLists>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoSellAncillary>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
    ${changeOrderXml}
    ${dataListsXml}
    ${paymentFunctionsXml}
  </DoSellAncillary>
</CraneNDCService>`;

  return await makeNdcRequest("DoSellAncillary", requestBody);
}

/**
 * DoOfferPrice - Get pricing for SSRs before adding them
 * @param {Object} params - Offer price parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {Array} params.selectedOfferItems - Selected offer items
 * @returns {Promise<Object>} Offer price response
 */
async function doOfferPrice(params) {
  const partyBlock = buildPartyBlock();

  let selectedOfferItemsXml = "";
  if (params.selectedOfferItems) {
    selectedOfferItemsXml = `<SelectedOfferItem>`;
    params.selectedOfferItems.forEach((item) => {
      selectedOfferItemsXml += `<OfferItemID>${item.offerItemId}</OfferItemID>`;
    });
    selectedOfferItemsXml += `</SelectedOfferItem>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoOfferPrice>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
    ${selectedOfferItemsXml}
  </DoOfferPrice>
</CraneNDCService>`;

  return await makeNdcRequest("DoOfferPrice", requestBody);
}

/**
 * DoReissuePreview - Preview reissue transaction
 * @param {Object} params - Reissue preview parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {Object} params.existingOrderCriteria - Existing order criteria
 * @param {Object} params.deleteOrderItem - Items to delete
 * @param {Object} params.specificOriginDestCriteria - New segments to add
 * @returns {Promise<Object>} Reissue preview response
 */
async function doReissuePreview(params) {
  const partyBlock = buildPartyBlock();

  let existingOrderCriteriaXml = "";
  if (params.existingOrderCriteria) {
    existingOrderCriteriaXml = `<ExistingOrderCriteria>
      <OrderID>${params.existingOrderCriteria.orderId}</OrderID>
      ${params.existingOrderCriteria.orderItemId
        ? `<OrderItemID>${params.existingOrderCriteria.orderItemId}</OrderItemID>`
        : ""
      }
      ${params.existingOrderCriteria.paxRefID
        ? `<PaxRefID>${params.existingOrderCriteria.paxRefID}</PaxRefID>`
        : ""
      }
    </ExistingOrderCriteria>`;
  }

  let deleteOrderItemXml = "";
  if (params.deleteOrderItem) {
    deleteOrderItemXml = `<DeleteOrderItem>
      <OrderItemRefID>${params.deleteOrderItem.orderItemRefID}</OrderItemRefID>
    </DeleteOrderItem>`;
  }

  let specificOriginDestCriteriaXml = "";
  if (params.specificOriginDestCriteria) {
    specificOriginDestCriteriaXml = `<SpecificOriginDestCriteria>
      <OriginCode>${params.specificOriginDestCriteria.originCode}</OriginCode>
      <DestCode>${params.specificOriginDestCriteria.destCode}</DestCode>
      <DepartureDate>${params.specificOriginDestCriteria.departureDate}</DepartureDate>
    </SpecificOriginDestCriteria>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoReissuePreview>
    ${existingOrderCriteriaXml}
    ${deleteOrderItemXml}
    ${specificOriginDestCriteriaXml}
  </DoReissuePreview>
</CraneNDCService>`;

  return await makeNdcRequest("DoReissuePreview", requestBody);
}

/**
 * DoReissueCommit - Commit reissue transaction
 * @param {Object} params - Reissue commit parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {Object} params.paymentFunctions - Payment information
 * @param {Object} params.existingOrderCriteria - Existing order criteria
 * @param {Object} params.deleteOrderItem - Items to delete
 * @param {Object} params.specificOriginDestCriteria - New segments to add
 * @returns {Promise<Object>} Reissue commit response
 */
async function doReissueCommit(params) {
  const partyBlock = buildPartyBlock();

  // Build PaymentFunctions
  let paymentFunctionsXml = "";
  if (params.paymentFunctions) {
    const payment = params.paymentFunctions.paymentProcessingDetails;
    paymentFunctionsXml = `<PaymentFunctions>
      <PaymentProcessingDetails>
        <Amount CurCode="${payment.currency || "PKR"}">${payment.amount
      }</Amount>
        <PaymentRefID>${payment.paymentRefID}</PaymentRefID>
        <TypeCode>${payment.typeCode}</TypeCode>
        ${payment.paymentMethod?.paymentCard
        ? `
        <PaymentMethod>
          <PaymentCard>
            <CardHolderName>${payment.paymentMethod.paymentCard.cardHolderName}</CardHolderName>
            <CardNumber>${payment.paymentMethod.paymentCard.cardNumber}</CardNumber>
            <CardSecurityCode>${payment.paymentMethod.paymentCard.cardSecurityCode}</CardSecurityCode>
            <ExpirationDate>${payment.paymentMethod.paymentCard.expirationDate}</ExpirationDate>
          </PaymentCard>
        </PaymentMethod>`
        : ""
      }
      </PaymentProcessingDetails>
    </PaymentFunctions>`;
  }

  // Similar structure to DoReissuePreview but with payment
  let existingOrderCriteriaXml = "";
  if (params.existingOrderCriteria) {
    existingOrderCriteriaXml = `<ExistingOrderCriteria>
      <OrderID>${params.existingOrderCriteria.orderId}</OrderID>
      ${params.existingOrderCriteria.orderItemId
        ? `<OrderItemID>${params.existingOrderCriteria.orderItemId}</OrderItemID>`
        : ""
      }
      ${params.existingOrderCriteria.paxRefID
        ? `<PaxRefID>${params.existingOrderCriteria.paxRefID}</PaxRefID>`
        : ""
      }
    </ExistingOrderCriteria>`;
  }

  let deleteOrderItemXml = "";
  if (params.deleteOrderItem) {
    deleteOrderItemXml = `<DeleteOrderItem>
      <OrderItemRefID>${params.deleteOrderItem.orderItemRefID}</OrderItemRefID>
    </DeleteOrderItem>`;
  }

  let specificOriginDestCriteriaXml = "";
  if (params.specificOriginDestCriteria) {
    specificOriginDestCriteriaXml = `<SpecificOriginDestCriteria>
      <OriginCode>${params.specificOriginDestCriteria.originCode}</OriginCode>
      <DestCode>${params.specificOriginDestCriteria.destCode}</DestCode>
      <DepartureDate>${params.specificOriginDestCriteria.departureDate}</DepartureDate>
    </SpecificOriginDestCriteria>`;
  }

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoReissueCommit>
    ${existingOrderCriteriaXml}
    ${deleteOrderItemXml}
    ${specificOriginDestCriteriaXml}
    ${paymentFunctionsXml}
  </DoReissueCommit>
</CraneNDCService>`;

  return await makeNdcRequest("DoReissueCommit", requestBody);
}

/**
 * DoSplit - Split/divide a passenger from PNR
 * @param {Object} params - Split parameters
 * @param {string} params.orderId - PNR/Order ID
 * @param {string} params.paxId - Passenger ID to split
 * @returns {Promise<Object>} Split response
 */
async function doSplit(params) {
  const partyBlock = buildPartyBlock();

  const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  ${partyBlock}
  <DoSplit>
    <Order>
      <OrderID>${params.orderId}</OrderID>
    </Order>
    <Pax>
      <PaxID>${params.paxId}</PaxID>
    </Pax>
  </DoSplit>
</CraneNDCService>`;

  return await makeNdcRequest("DoSplit", requestBody);
}

module.exports = {
  doGeneralParams,
  doAirlineProfile,
  doAirShopping,
  doOrderCreate,
  doOrderRetrieve,
  doOrderCancel,
  doOrderChange,
  doTicketPreview,
  doVoidTicket,
  doOrderFare,
  doServiceList,
  doSeatAvailability,
  doBaggageServiceList,
  doAddAncillary,
  doDeleteAncillary,
  doSellAncillary,
  doOfferPrice,
  doReissuePreview,
  doReissueCommit,
  doSplit,
  buildPartyBlock,
  makeNdcRequest,
};
