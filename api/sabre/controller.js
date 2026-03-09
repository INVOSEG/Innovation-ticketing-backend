require("dotenv").config();
const { v4 } = require("uuid");
const fetch = require("node-fetch");
const { SABRE } = require("../../config/config");
const { getAccessToken } = require("./sabreAuth");
const User = require("../../lib/schema/users.schema");
const Markup = require("../../lib/schema/markup.schema");
const Agency = require("../../lib/schema/agency.schema");
const Pax = require("../../lib/schema/traveller.schema");
const airlineLogo = require("../airlineLogo/airlineLogo");
const airlineLogos = require("../airlineLogo/airlineLogo");
const Booking = require("../../lib/schema/booking.schema");
const { errorResponse } = require("../../lib/utils/error");
const { postFlightData, ensureToken } = require("./sabreAuth");
const { successResponse } = require("../../lib/utils/success");
const CustomerLedger = require("../../lib/schema/customerLedger.schema");
const SupplierLedger = require("../../lib/schema/supplierLedger.schema");
const IncomeStatement = require("../../lib/schema/incomeStatement.schema");
const moment = require("moment");
const axios = require("axios");
const https = require("https");
const http = require("http");
const {
  EUserRole,
  ETicketStatus,
  travelClassMap,
} = require("../../lib/utils/enum");
const MEAL_CODES = ["B", "L", "D", "K", "S", "M", "F", "G"];

async function getBookingWithLogos(req, res) {
  try {
    const { pnr } = req.query;
    if (!pnr) {
      return errorResponse(res, "PNR is required", 400);
    }

    const booking = await Booking.findOne({ id: pnr }).lean();
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    const agency = await Agency.findById(booking.agencyId).lean();
    const issuedBy = await User.findById(booking.userId).lean();

    const agencyLogoUrl = agency?.logoUrl || process.env.LOGO_URL || null;

    const normalizeFlightNumber = (num) => {
      if (!num) return "";
      return String(parseInt(num, 10) || num);
    };

    const itineraries = booking.flightOffers?.[0]?.itineraries || [];
    const airlineDetails = [];
    const segmentMap = new Map();

    for (const itinerary of itineraries) {
      for (const segment of itinerary.segments || []) {
        // Prefer operating carrier
        const airlineCode = segment.marketing?.carrierCode;
        const marketedBy = segment.marketing?.Banner || "";
        const operatedBy = segment.operating?.Banner || "";

        const found = airlineLogos.find((a) => a.arCode === airlineCode);

        const flightNum = segment.number || "";
        const depCode = segment.departure?.iataCode || "";
        const arrCode = segment.arrival?.iataCode || "";

        const segmentDetails = {
          airlineCode,
          marketedBy,
          operatedBy,
          airlineName: found?.ar || airlineCode,
          logo: found?.logo || null,
          flightNumber: flightNum,
          duration: segment.duration || "",
          aircraft: segment.aircraft?.code || segment.boeing || "",
          class: segment.className || segment.classCode || "",
          stops: segment.numberOfStops || 0,
          meals:
            segment.meals === "true" || airlineCode === "EY"
              ? "true"
              : segment.meals || "false",
          distance: segment.AirMilesFlown || 0,
        };

        const normalizedFlight = normalizeFlightNumber(flightNum);
        const keys = [
          `${flightNum}_${depCode}_${arrCode}`,
          `${normalizedFlight}_${depCode}_${arrCode}`,
          `${flightNum.padStart(4, "0")}_${depCode}_${arrCode}`,
        ];

        for (const key of keys) {
          if (key && !key.includes("__")) {
            segmentMap.set(key, segmentDetails);
          }
        }

        const fromCode = segment.departure?.iataCode;
        const toCode = segment.arrival?.iataCode;

        console.log(`✈️ Segment From: ${fromCode}, To: ${toCode}`);

        // NOW await works
        const fromAirport = await getCachedAirport(fromCode);
        const toAirport = await getCachedAirport(toCode);

        airlineDetails.push({
          fromAirport,
          toAirport,
          from: fromCode || "N/A",
          to: toCode || "N/A",
          departureTime: segment.departure?.at || "",
          arrivalTime: segment.arrival?.at || "",
          airlineCode,
          marketedBy,
          operatedBy,
          airlineName: found?.ar || airlineCode,
          logo: found?.logo || null,
          flightNumber: segment.number || "",
          duration: segment.duration || "",
          aircraft: segment.aircraft?.code || segment.boeing || "",
          class: segment.className || segment.classCode || "",
          stops: segment.numberOfStops || 0,
          meals:
            segment.meals === "true" || airlineCode === "EY"
              ? "true"
              : segment.meals || "false",
          distance: segment.AirMilesFlown || 0,
        });
      }
    }

    const findSegmentDetails = (flightNumber, depAirport, arrAirport) => {
      const normalizedFlight = normalizeFlightNumber(flightNumber);
      const keys = [
        `${flightNumber}_${depAirport}_${arrAirport}`,
        `${normalizedFlight}_${depAirport}_${arrAirport}`,
        `${flightNumber.padStart(4, "0")}_${depAirport}_${arrAirport}`,
      ];

      for (const key of keys) {
        const details = segmentMap.get(key);
        if (details) return details;
      }

      for (const [key, value] of segmentMap.entries()) {
        if (key.includes(depAirport) && key.includes(arrAirport)) {
          return value;
        }
      }

      return null;
    };

    if (booking.flightType === "multi-city") {
      const itineraries = booking.flightOffers?.[0]?.itineraries || [];
      // ADD fromAirport + toAirport in every segment (flightOffers)
      for (const itinerary of itineraries) {
        if (Array.isArray(itinerary.segments)) {
          itinerary.segments = await Promise.all(
            itinerary.segments.map(async (segment) => {
              const fromCode = segment.departure?.iataCode;
              const toCode = segment.arrival?.iataCode;

              console.log(`✈️ Segment From: ${fromCode}, To: ${toCode}`);

              const fromAirport = await getCachedAirport(fromCode);
              const toAirport = await getCachedAirport(toCode);

              return {
                ...segment,
                fromAirport,
                toAirport,
              };
            }),
          );
          booking.flightOffers[0].itineraries = itineraries;
        }
      }
    } else {
      if (booking.departure && Array.isArray(booking.departure)) {
        booking.departure = await Promise.all(
          booking.departure.map(async (dep) => {
            const flightNumber =
              dep.FlightNumber ||
              dep.marketingFlightNumber ||
              dep.flightNumber ||
              dep.MarketingAirline?.FlightNumber ||
              "";

            const depAirport =
              dep.OriginLocation?.LocationCode ||
              dep.departureLocation ||
              dep.departure?.airport ||
              dep.departure?.iataCode ||
              "";

            const arrAirport =
              dep.DestinationLocation?.LocationCode ||
              dep.arrivalLocation ||
              dep.arrival?.airport ||
              dep.arrival?.iataCode ||
              "";

            // NEW — marketing & operating info
            const airlineCode =
              dep.MarketingAirline?.AirlineCode ||
              dep.marketing?.carrierCode ||
              dep.operating?.carrierCode ||
              "";

            const marketedBy =
              dep.marketing?.Banner || dep.MarketingAirline?.Banner || "";

            const operatedBy =
              dep.operating?.Banner || dep.OperatingAirline?.Banner || "";

            const fromCode = dep.OriginLocation?.LocationCode;
            const toCode = dep.DestinationLocation?.LocationCode;

            const fromAirport = await getCachedAirport(fromCode);
            const toAirport = await getCachedAirport(toCode);

            const segmentDetails = findSegmentDetails(
              flightNumber,
              depAirport,
              arrAirport,
            );

            if (segmentDetails) {
              return {
                ...dep,
                fromAirport,
                toAirport,
                airlineCode,
                marketedBy,
                operatedBy,

                airlineName: segmentDetails.airlineName,
                logo: segmentDetails.logo,
                flightNumber: segmentDetails.flightNumber,
                duration: segmentDetails.duration,
                aircraft: segmentDetails.aircraft,
                class: segmentDetails.class,
                stops: segmentDetails.stops,
                meals: segmentDetails.meals,
                distance: segmentDetails.distance,
                airlineFullName: segmentDetails.marketingBanner,
              };
            }

            return dep;
          }),
        );
      }

      if (booking.return && Array.isArray(booking.return)) {
        booking.return = await Promise.all(
          booking.return.map(async (ret) => {
            const flightNumber =
              ret.FlightNumber ||
              ret.marketingFlightNumber ||
              ret.flightNumber ||
              ret.MarketingAirline?.FlightNumber ||
              "";
            const depAirport =
              ret.OriginLocation?.LocationCode ||
              ret.departureLocation ||
              ret.departure?.airport ||
              ret.departure?.iataCode ||
              "";
            const arrAirport =
              ret.DestinationLocation?.LocationCode ||
              ret.arrivalLocation ||
              ret.arrival?.airport ||
              ret.arrival?.iataCode ||
              "";
            const fromCode = ret.OriginLocation?.LocationCode;
            const toCode = ret.DestinationLocation?.LocationCode;
            const marketedBy =
              ret.marketing?.Banner || ret.MarketingAirline?.Banner || "";

            const operatedBy =
              ret.operating?.Banner || ret.OperatingAirline?.Banner || "";
            const fromAirport = await getCachedAirport(fromCode);
            const toAirport = await getCachedAirport(toCode);
            const segmentDetails = findSegmentDetails(
              flightNumber,
              depAirport,
              arrAirport,
            );

            if (segmentDetails) {
              return {
                ...ret,
                toAirport,
                fromAirport,
                marketedBy,
                operatedBy,

                airlineName: segmentDetails.airlineName,
                logo: segmentDetails.logo,
                flightNumber: segmentDetails.flightNumber,
                duration: segmentDetails.duration,
                aircraft: segmentDetails.aircraft,
                class: segmentDetails.class,
                stops: segmentDetails.stops,
                meals: segmentDetails.meals,
                distance: segmentDetails.distance,
                airlineFullName: segmentDetails.marketingBanner,
              };
            }
            return ret;
          }),
        );
      }
    }

    // Prepare response
    const responseData = {
      booking,
      agency: {
        name: agency?.agencyName || "Saboor Travels",
        email: agency?.agencyEmail || "",
        phone: agency?.phoneNumber || "",
        logoUrl: agencyLogoUrl,
      },
      issuedBy: {
        name: `${issuedBy?.firstName || ""} ${issuedBy?.lastName || ""}`.trim(),
        email: issuedBy?.email || "",
      },
      airlineDetails,
    };

    console.log(
      `✅ Booking data ready for frontend PDF generation (PNR: ${pnr})`,
    );

    return successResponse(res, responseData, 200);
  } catch (error) {
    console.error("❌ Error fetching booking data:", error);
    return errorResponse(res, "Failed to retrieve booking data", 500);
  }
}

function getMonthStartAndEndDates(month, year, setTimeToUTC = true) {
  // Ensure valid month and year
  if (month < 1 || month > 12 || year < 1) {
    throw new Error("Invalid month or year.");
  }

  // Create the start date: First day of the month at midnight UTC
  const startDate = new Date(Date.UTC(year, month - 1, 1));

  // Create the end date: Last day of the month at 23:59 UTC
  const endDate = new Date(Date.UTC(year, month, 0)); // 0 is the last day of the month

  // Optionally, set time to 00:00 UTC if required
  if (setTimeToUTC) {
    startDate.setUTCHours(0, 0, 0, 0); // Set start time to 00:00 UTC
    endDate.setUTCHours(0, 0, 0, 0); // Set end time to 00:00 UTC
  }

  // Return both dates
  return {
    startDate,
    endDate,
  };
}
function transformBaggageInfo(data) {
  const result = [];

  data?.forEach((item) => {
    const allowance = item.allowanceDetail;

    // Determine if it’s piece-based or weight-based
    const weight = allowance.pieceCount
      ? allowance.pieceCount
      : allowance.weight;
    const unit = allowance.pieceCount ? "piece" : allowance.unit;

    // If multiple segments, create separate entries for each segment
    item.segment?.forEach((seg) => {
      result.push({
        segment: [seg],
        allowanceDetail: {
          id: allowance.id,
          weight: weight,
          unit: unit,
        },
      });
    });
  });

  return result;
}
function calculateAgeInYears(dobString) {
  const dob = new Date(dobString);
  const today = new Date();

  let ageYears = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    ageYears--;
  }
  return ageYears;
}

function calculateAgeInMonths(dobString) {
  const dob = new Date(dobString);
  const today = new Date();

  let ageMonths =
    (today.getFullYear() - dob.getFullYear()) * 12 +
    (today.getMonth() - dob.getMonth());
  if (today.getDate() < dob.getDate()) {
    ageMonths--;
  }
  return ageMonths;
}
async function getCode(firstName, lastName) {
  const firstNameInitial = firstName.charAt(0).toLowerCase();
  const lastNameInitial = lastName.charAt(0).toLowerCase();
  const prefix = `${firstNameInitial}${lastNameInitial}`; // e.g. dh

  // Find ALL travellers matching prefix + digits only
  const travellers = await Pax.find({
    code: { $regex: `^${prefix}[0-9]+$`, $options: "i" },
  }).lean();

  // If none exist → return first one
  if (!travellers.length) {
    return `${prefix}01`;
  }

  // Extract NUMERIC suffix from each code
  const numbers = travellers.map((t) =>
    parseInt(t.code.replace(prefix, ""), 10),
  );

  const maxNumber = Math.max(...numbers);
  const nextNumber = (maxNumber + 1).toString().padStart(2, "0");

  return `${prefix}${nextNumber}`;
}

function formatDate(dateString) {
  /**
   * Converts a date from YYYY-MM-DD format to DDMONYY format.
   *
   * @param {string} dateString - The input date as a string in YYYY-MM-DD format.
   * @returns {string} - The formatted date in DDMONYY format, or an error message if invalid.
   */
  try {
    // Check if dateString is valid
    if (!dateString || typeof dateString !== "string") {
      throw new Error(
        "Invalid input. Please provide a valid date string in YYYY-MM-DD format.",
      );
    }

    // Split the input into components
    const [year, month, day] = dateString.split("-");

    // Validate input components
    if (
      !year ||
      !month ||
      !day ||
      year.length !== 4 ||
      month.length !== 2 ||
      day.length !== 2
    ) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD.");
    }

    // Array of month abbreviations
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

    // Convert month to name and ensure it's valid
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex < 0 || monthIndex > 11) {
      throw new Error("Invalid month.");
    }
    const monthName = months[monthIndex];

    // Shorten the year to two digits
    const shortYear = year.slice(-2);

    // Return formatted string
    return `${day}${monthName}${shortYear}`;
  } catch (error) {
    return error.message;
  }
}
function getGenderCode(gender) {
  // Convert the input to lowercase to make the exports.case-insensitive
  const lowerGender = gender.toLowerCase();
  // Check for different cases and return the corresponding code
  if (lowerGender === "adult") {
    return "ADT";
  } else if (lowerGender === "child") {
    return "CNN";
  } else if (lowerGender === "infant") {
    return "INF";
  }
}
function getBaggageInfo(baggageInformation, baggageAllowanceDescs) {
  return baggageInformation?.map((baggage) => {
    const segment = baggage?.segments;
    const allowanceRef = baggage?.allowance?.ref;
    const allowanceDetail = allowanceRef
      ? baggageAllowanceDescs.find((desc) => desc.id === allowanceRef)
      : null;

    return { segment, allowanceDetail };
  });
}
function getbrandNameInfo(baggageInformation, baggageAllowanceDescs) {
  return baggageInformation.map((baggage, index) => {
    // console.log(`\n➡️ Processing baggage index ${index}:`, baggage);

    const allowanceRef = baggage?.ref;
    // console.log("   • allowanceRef:", allowanceRef);

    const allowanceDetail = allowanceRef
      ? baggageAllowanceDescs.find((desc) => desc.id === allowanceRef)
      : null;

    // console.log("   • allowanceDetail found:", allowanceDetail);

    const brand = allowanceDetail?.brand;
    // console.log("   • brand object:", brand);

    const result = {
      brandName: brand?.brandName || null,
      brandCode: brand?.code || null,
      fareBasisCode: allowanceDetail.fareBasisCode || null,
      programSystemCode: brand?.programSystemCode || null,
    };

    // console.log("   ✓ Final mapped result:", result);

    return result;
  });
}

function getbrandFeatures(baggageInformation, baggageAllowanceDescs) {
  return baggageInformation.map((baggage) => {
    const allowanceRef = baggage?.ref;
    const allowanceDetail = allowanceRef
      ? baggageAllowanceDescs?.find((desc) => desc.id === allowanceRef)
      : null;
    // console.log("brand", allowanceDetail?.brand);

    return allowanceDetail?.commercialName;
  });
}
function convertToISODateTimeWithRollOver(
  timeStr,
  baseDateStr,
  previousDateTime = null,
) {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  const baseDate = new Date(baseDateStr);
  baseDate.setHours(hours, minutes, seconds || 0, 0);

  // If there's a previous segment, check if this time is earlier and needs to roll to the next day
  if (previousDateTime) {
    const nextDate = new Date(baseDate);
    while (nextDate <= previousDateTime) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate.toISOString();
  }

  return baseDate.toISOString();
}
function addDaysToDateString(dateStr, daysToAdd = 0) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}
function stripTimezoneFromTime(timeStr) {
  return timeStr.replace(/([+-]\d{2}:\d{2}|Z)$/, "");
}
function convertToISODateTimeWithRollOverf(
  timeStr,
  baseDateStr,
  previousDateTime = null,
) {
  try {
    // Strip timezone if present, but don't convert the time itself
    const cleanTime = stripTimezoneFromTime(timeStr);

    // Parse time components
    const [hours, minutes, seconds] = cleanTime.split(":").map(Number);

    // Determine the starting date
    // If previousDateTime is provided and is a valid date, use its date as the base
    // Otherwise, use the provided baseDateStr
    let workingDateStr = baseDateStr;
    if (previousDateTime instanceof Date && !isNaN(previousDateTime)) {
      // Extract date from previousDateTime (YYYY-MM-DD format)
      const prevDateStr = previousDateTime.toISOString().split("T")[0];
      workingDateStr = prevDateStr;
    }

    // Create a date object with the working date and the time
    const candidateDate = new Date(`${workingDateStr}T${cleanTime}`);

    let rollOverDays = 0;
    if (previousDateTime instanceof Date && !isNaN(previousDateTime)) {
      // If this time is earlier than or equal to previous time, roll to next day
      // This handles cases like:
      // - Previous arrival at 20:50, next departure at 01:35 -> next day (01:35 < 20:50)
      // - Departure at 23:00, arrival at 02:30 -> arrival next day (02:30 < 23:00)
      while (candidateDate <= previousDateTime) {
        candidateDate.setDate(candidateDate.getDate() + 1);
        rollOverDays += 1;
      }
    }

    const adjustedDate = addDaysToDateString(workingDateStr, rollOverDays);
    return `${adjustedDate}T${cleanTime}`;
  } catch (err) {
    console.error("convertToISODateTimeWithRollOver error:", err.message);
    return null;
  }
}

function convertToISODateTime(timeString, dateString) {
  try {
    // Basic validation
    if (!timeString || !dateString) throw new Error("Missing time or date");

    // Remove any timezone info (+04:00, Z, etc.)
    const cleanTime = timeString.replace(/([+-]\d{2}:\d{2}|Z)$/, "");

    // ✅ Return in fixed ISO-like format, but without converting time
    return `${dateString}T${cleanTime}.000Z`;
  } catch (err) {
    console.error("convertToISODateTime error:", err.message);
    return null;
  }
}

const cabinTypeMap = {
  P: "Premium First",
  PremiumFirst: "Premium First",
  F: "First",
  First: "First",
  J: "Premium Business",
  PremiumBusiness: "Premium Business",
  C: "Business",
  Business: "Business",
  S: "Premium Economy",
  PremiumEconomy: "Premium Economy",
  Y: "Economy",
  Economy: "Economy",
};

function convertMinutesToISODuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60); // Calculate full hours
  const minutes = totalMinutes % 60; // Calculate remaining minutes

  let isoDuration = "PT";

  if (hours > 0) {
    isoDuration += `${hours}H`;
  }

  if (minutes > 0) {
    isoDuration += `${minutes}M`;
  }

  return isoDuration;
}
function calculateLayoverTime(arrivalISO, nextDepartureISO) {
  const arrival = new Date(arrivalISO);
  const nextDeparture = new Date(nextDepartureISO);
  const diffMs = nextDeparture - arrival;

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}
function calculateAdjustedPrice(
  price,
  markups,
  staffMarkupValue,
  staffMarkupType,
  carrierCode,
) {
  let adjustedPrice = price;

  markups.forEach((markup) => {
    if (markup.airlines.includes(carrierCode)) {
      // Convert markupValue from string to number (remove "+" sign if present)
      const markupValue = parseFloat(markup.markupValue);

      if (markup.markupType === "percentage") {
        // Calculate percentage-based markup/discount
        const percentageValue = (adjustedPrice * Math.abs(markupValue)) / 100;

        if (markupValue > 0) {
          adjustedPrice += percentageValue; // Apply markup
          console.log(`🟢 Markup applied (Percentage): ${markupValue}%`);
        } else {
          adjustedPrice -= percentageValue; // Apply discount
          console.log(`🔴 Discount applied (Percentage): ${markupValue}%`);
        }
      } else if (markup.markupType === "whole") {
        // Whole value markup/discount
        adjustedPrice += markupValue;

        if (markupValue > 0) {
          console.log(`🟢 Markup applied (Fixed): ${markupValue}`);
        } else {
          console.log(`🔴 Discount applied (Fixed): ${markupValue}`);
        }
      }
    }
    console.log(`🟢 Markup  ${adjustedPrice}`);
  });

  // Apply staff markup if applicable
  if (staffMarkupValue) {
    const staffMarkup =
      staffMarkupType === "percentage"
        ? (adjustedPrice * Number(staffMarkupValue)) / 100
        : Number(staffMarkupValue);
    adjustedPrice += staffMarkup;
  }

  return adjustedPrice;
}

async function postSabreFlightData(req, res) {
  await ensureToken();
  let netFare = 0;
  const {
    start_date,
    end_date,
    adult,
    children,
    infants,
    dept,
    arrival,
    includedAirlineCodes,
    staffMarkupValue,
    staffMarkupType,
    travelClass,
    returnTravelClass,
    max,
    maxPrice,
    nonStop,
    type,
    tripType,
  } = req.query;
  console.log("includedAirlineCodes", includedAirlineCodes);
  let airlineLogoMap = {};
  let operatingSirlineLogoMap = {};
  try {
    airlineLogo.forEach(({ arCode, logo, ar }) => {
      airlineLogoMap[arCode] = { ar, logo, arCode };
    });
  } catch (error) {
    console.error("Error processing airline logo data:", error);
  }
  try {
    airlineLogo.forEach(({ arCode, logo, ar }) => {
      operatingSirlineLogoMap[arCode] = { ar, logo, arCode };
    });
  } catch (error) {
    console.error("Error processing airline logo data:", error);
  }

  const findMakrup = await Markup.find({
    api: { $in: ["sabre", "all"] },
    status: "ACTIVE",
  });
  const findagency = await Agency.findById(req.user.agencyId);
  let label = findagency ? findagency.showLabel : null;
  if (findMakrup) {
    let markupType = findMakrup.markupType;
  }

  let data = {
    OTA_AirLowFareSearchRQ: {
      ResponseType: "OTA",
      ResponseVersion: "4.3.0",
      Version: "4.3.0",
      AvailableFlightsOnly: true,

      OriginDestinationInformation: [
        {
          RPH: "1",
          DepartureDateTime: `${start_date}T00:00:01`,
          OriginLocation: { LocationCode: `${dept}` },
          DestinationLocation: { LocationCode: `${arrival}` },
        },
      ],
      POS: {
        Source: [
          {
            PseudoCityCode: `${SABRE.SABRE_PCC}`,
            RequestorID: {
              Type: "1",
              ID: "1",
              CompanyName: { Code: "TN" },
            },
          },
        ],
      },
      TPA_Extensions: {
        IntelliSellTransaction: {
          RequestType: { Name: "200ITINS" },
        },
        MultiTicket: {
          DisplayPolicy: "SOW",
        },
      },
      TravelPreferences: {
        ValidInterlineTicket: true,
        VendorPref: includedAirlineCodes
          ? [
            { Code: includedAirlineCodes, PreferLevel: "Only" },
            { Code: "PK", PreferLevel: "Unacceptable" },
          ]
          : [{ Code: "PK", PreferLevel: "Unacceptable" }],
        TPA_Extensions: {
          DiversityParameters: {
            AdditionalNonStopsNumber: 10,
          },
          DataSources: { ATPCO: "Enable", LCC: "Enable", NDC: "Enable" },
          NumTrips: { Number: 50 },
          KeepSameCabin: { Enabled: true },
          OnlineIndicator: { Ind: true },
          PreferNDCSourceOnTie: { Value: false },
          NDCIndicators: {
            MultipleBrandedFares: { Value: true },
            MaxNumberOfUpsells: { Value: 6 },
          },
          TripType: { Value: tripType || "OneWay" },
        },
        MaxStopsQuantity: nonStop
          ? Number(nonStop) >= 0
            ? Number(nonStop)
            : 5
          : 5,
      },
      TravelerInfoSummary: {
        PriceRequestInformation: {
          TPA_Extensions: {
            BrandedFareIndicators: {
              MultipleBrandedFares: true,
              ReturnBrandAncillaries: true,
              UpsellLimit: 4,
              ParityMode: "Leg",
              ParityModeForLowest: "Leg",
              ItinParityFallbackMode: "LegParity",
              ItinParityBrandlessLeg: true,
            },
          },
        },
        SeatsRequested: [Number(adult)],
        AirTravelerAvail: [
          {
            PassengerTypeQuantity: [{ Code: "ADT", Quantity: Number(adult) }],
          },
        ],
      },
      // searchCriteria: {
      //   pricingOptions: {
      //     fareType: ["PUBLISHED"],
      //     includedCheckedBagsOnly: false,
      //   },
      //   additionalInformation: {
      //     chargeableCheckedBags: false,
      //     brandedFares: true,
      //   },
      //   flightFilters: {
      //     carrierRestrictions: {
      //       excludedCarrierCodes: ["PK"],
      //     },
      //   },
      // },
    },
  };

  if (Number(children) > 0) {
    data.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.push(
      {
        Code: "CNN",
        Quantity: Number(children),
      },
    );
  }
  if (Number(infants) > 0) {
    data.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.push(
      {
        Code: "INF",
        Quantity: Number(infants),
      },
    );
  }
  if (end_date) {
    data.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
      RPH: "2",
      DepartureDateTime: `${end_date}T00:00:00`,
      OriginLocation: { LocationCode: arrival },
      DestinationLocation: { LocationCode: dept },
    });
    //  if (returnTravelClass) {
    //   const sabreCabinClass = travelClassMap[returnTravelClass.toUpperCase()];
    //   if (sabreCabinClass) {
    //     const originInfo =
    //       data.OTA_AirLowFareSearchRQ.OriginDestinationInformation[1];

    //     // Ensure TPA_Extensions exists
    //     if (!originInfo.TPA_Extensions) {
    //       originInfo.TPA_Extensions = {};
    //     }

    //     // Set CabinPref
    //     originInfo.TPA_Extensions.CabinPref = {
    //       Cabin: sabreCabinClass,
    //       PreferLevel: "Preferred",
    //     };
    //   } else {
    //     console.warn("Invalid travelClass provided:", travelClass);
    //   }
    // }
  }

  if (travelClass) {
    const sabreCabinClass = travelClassMap[travelClass.toUpperCase()];
    if (sabreCabinClass) {
      data.OTA_AirLowFareSearchRQ.TravelPreferences.CabinPref = [
        { Cabin: sabreCabinClass, PreferLevel: "Preferred" },
      ];
    } else {
      console.warn("Invalid travelClass provided:", travelClass);
    }
  }
  /**
  *  if (end_date) {
    data.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
      RPH: "2",
      DepartureDateTime: `${end_date}T00:00:00`,
      OriginLocation: { LocationCode: arrival },
      DestinationLocation: { LocationCode: dept },
    });
    if (returnTravelClass) {
      const sabreCabinClass = travelClassMap[returnTravelClass.toUpperCase()];
      if (sabreCabinClass) {
        const originInfo =
          data.OTA_AirLowFareSearchRQ.OriginDestinationInformation[1];

        // Ensure TPA_Extensions exists
        if (!originInfo.TPA_Extensions) {
          originInfo.TPA_Extensions = {};
        }

        // Set CabinPref
        originInfo.TPA_Extensions.CabinPref = {
          Cabin: sabreCabinClass,
          PreferLevel: "Preferred",
        };
      } else {
        console.warn("Invalid travelClass provided:", travelClass);
      }
    }
  }
  console.log(
    "okkk",
    data.OTA_AirLowFareSearchRQ.OriginDestinationInformation[0]
  );
  if (travelClass) {
    const sabreCabinClass = travelClassMap[travelClass.toUpperCase()];
    if (sabreCabinClass) {
      const originInfo =
        data.OTA_AirLowFareSearchRQ.OriginDestinationInformation[0];

      // Ensure TPA_Extensions exists
      if (!originInfo.TPA_Extensions) {
        originInfo.TPA_Extensions = {};
      }

      // Set CabinPref
      originInfo.TPA_Extensions.CabinPref = {
        Cabin: sabreCabinClass,
        PreferLevel: "Preferred",
      };
  */
  // return errorResponse(res, data, 200);
  try {
    const flightData = await postFlightData(
      `${SABRE.BASE_URL}/v4/offers/shop`,
      data,
    );
    if (flightData.groupedItineraryResponse.statistics.itineraryCount <= 0) {
      return errorResponse(res, "No ticket found", 200);
    }

    const legsDesc = flightData.groupedItineraryResponse.legDescs;
    const scheduleDescs =
      flightData.groupedItineraryResponse.scheduleDescs ?? [];
    const itineraries =
      flightData.groupedItineraryResponse.itineraryGroups[0].itineraries ?? [];
    const taxDescriptions =
      flightData.groupedItineraryResponse.taxSummaryDescs ?? [];
    const groupDescription =
      flightData.groupedItineraryResponse.itineraryGroups[0].groupDescription
        .legDescriptions ?? [];
    const baggageAllowanceDesc =
      flightData?.groupedItineraryResponse.baggageAllowanceDescs;
    const fareComponentDescs =
      flightData?.groupedItineraryResponse.fareComponentDescs;
    const brandFeatureDescs =
      flightData?.groupedItineraryResponse.brandFeatureDescs;
    const processedItineraries = itineraries.map((itinerary) => {
      const uniqueId = v4();
      // const totalTimeforFlight=formatElapsedTime()
      const departureLeg = legsDesc.find(
        (leg) => leg.id === itinerary.legs[0].ref,
      );
      const returnLeg =
        itinerary.legs.length > 1
          ? legsDesc.find((leg) => leg.id === itinerary.legs[1].ref)
          : null;
      let adultb1, adultb2;

      const brandedFare = itinerary?.pricingInformation
        ?.map((data) => {
          if (data.fare) {
            let a, b, c, d, e;
            let airlineCode = data.fare.validatingCarrierCode;
            return {
              data: data.fare.passengerInfoList.map((passengerInfo) => {
                const passengerDetails = passengerInfo.passengerInfo;
                const fareComponents = passengerDetails.fareComponents.map(
                  (fareComponent) => {
                    const segments = fareComponent.segments.map(
                      (segmentData) => {
                        return {
                          bookingCode: segmentData.segment?.bookingCode,
                          seatsAvailable: segmentData.segment.seatsAvailable,
                          meal: segmentData.segment?.mealCode,
                        };
                      },
                    );

                    return {
                      ref: fareComponent.ref,
                      beginAirport: fareComponent.beginAirport,
                      endAirport: fareComponent.endAirport,
                      segments,
                    };
                  },
                );
                const brandInfo = passengerDetails.fareComponents.map(
                  (component) => {
                    // Find the matching fareComponentDesc using the "ref"
                    const matchedDesc = fareComponentDescs.find(
                      (desc) => desc.id === component.ref,
                    );

                    console.log("🔍 fareComponent.ref:", component.ref);
                    console.log("🔍 matched fareComponentDesc:", matchedDesc);

                    return matchedDesc ? matchedDesc.fareBasisCode : null;
                  },
                );

                // Fetch the marketing flight details
                const marketingFlightDetails = data.soldOut?.soldOutLegs?.map(
                  (soldOutLeg) => {
                    return soldOutLeg.soldOutSchedules.map((schedule) => ({
                      brandName: schedule.brandName,
                      programId: schedule.programId,
                      programCode: schedule.programCode,
                      programDescription: schedule.programDescription,
                      programSystemCode: schedule.programSystemCode,
                    }));
                  },
                );

                // Additional required details
                ((a =
                  passengerDetails.fareComponents[0].segments[0].segment
                    .seatsAvailable), // Total available seats
                  (b = getBaggageInfo(
                    passengerDetails.baggageInformation,
                    baggageAllowanceDesc,
                  )), // Total available seats
                  (adultb1 = passengerDetails.baggageInformation));
                adultb2 = baggageAllowanceDesc;
                c =
                  passengerDetails.fareComponents[0].segments[0].segment
                    .mealCode;
                d = passengerDetails.nonRefundable; // Total available seats
                e = getbrandNameInfo(
                  passengerDetails.fareComponents,
                  fareComponentDescs,
                );
                let z = getbrandNameInfo(
                  passengerDetails.fareComponents,
                  fareComponentDescs,
                );
                return {
                  brandInfo,
                  fareComponents,
                  brandInfo: brandInfo,
                  passengerType: passengerDetails.passengerType,
                  passengerNumber: passengerDetails.passengerNumber,
                  nonRefundable: passengerDetails.nonRefundable,
                  brandName: [z[0].brandName],
                  brandCode: z[0].brandCode,
                  baggageInformation: getBaggageInfo(
                    passengerDetails.baggageInformation,
                    baggageAllowanceDesc,
                  ),
                  brandFeatures: getbrandFeatures(
                    passengerDetails.fareComponents,
                    brandFeatureDescs,
                  ),
                  fare: passengerDetails.passengerTotalFare.totalFare, // Total fare
                  taxAmount: passengerDetails.passengerTotalFare.totalTaxAmount, // Total fare
                  totalSeats:
                    passengerDetails.fareComponents[0].segments[0].segment
                      .seatsAvailable, // Total available seats
                  bookingCode:
                    passengerDetails.fareComponents[0].segments[0].segment
                      .bookingCode, // Total available seats
                  meal: passengerDetails.fareComponents[0].segments[0].segment
                    .mealCode, // Total available seats
                };
              }),
              nada: data.fare.totalFare.totalPrice,
              totalFare: calculateAdjustedPrice(
                data.fare.totalFare.totalPrice,
                findMakrup,
                staffMarkupValue,
                staffMarkupType,
                airlineCode,
              ),

              refundable: d,
              meal: c,
              baggage: b,
              seats: a,
              brandName: [e[0].brandName],
              brandCode: e[0].brandCode,
              fareBasisCode: e[0].fareBasisCode,
              fareWithMarkup: data.fare.totalFare.totalPrice,
              adjustedPrice: calculateAdjustedPrice(
                data.fare.totalFare.totalPrice,
                findMakrup,
                staffMarkupValue,
                staffMarkupType,
                airlineCode,
              ),
              netFare: data.fare.totalFare.totalPrice,
            };
          }
          return null;
        })
        .filter(Boolean);

      const pricingInfo = itinerary?.pricingInformation?.[0]?.fare;
      const adults = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "ADT",
      );
      const children = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "CNN",
      );
      const infants = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "INF",
      );

      let adultTotalSeatsAvailable = 0;
      let adultMealInfo = [];
      let adultIsRefundable = true;
      let adultCabin = [];
      let adultBookingCode = [];
      let adultBaggage = getBaggageInfo(
        adults.passengerInfo.baggageInformation,
        baggageAllowanceDesc,
      );

      // Check if passenger information has refundable status
      adultIsRefundable = !adults?.passengerInfo.nonRefundable;

      // Extract segment details from fareComponents
      adults?.passengerInfo.fareComponents.forEach((fareComponent) => {
        fareComponent.segments.forEach((segmentData) => {
          const segment = segmentData.segment;
          adultTotalSeatsAvailable += segment?.seatsAvailable || 0;
          // Collect meal codes if available
          if (segment?.mealCode) {
            adultMealInfo.push(segment.mealCode);
          }
          if (segment.cabinCode) adultCabin.push(segment.cabinCode);
          if (segment.bookingCode) adultBookingCode.push(segment.bookingCode);
        });
      });
      adults.passengerInfo.passengerInfo;
      ////////////////////////////////////////////////////////////////////////////////////////////////////
      let childTotalSeatsAvailable = 0;
      let childMealInfo = [];
      let childIsRefundable = true;
      let childCabin = [];
      let childBaggage;

      if (children) {
        childBaggage = getBaggageInfo(
          children.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        );
        // Check if passenger information has refundable status
        childIsRefundable = !adults?.passengerInfo.nonRefundable;

        // Extract segment details from fareComponents
        children?.passengerInfo.fareComponents.forEach((fareComponent) => {
          fareComponent.segments.forEach((segmentData) => {
            const segment = segmentData.segment;
            childTotalSeatsAvailable += segment?.seatsAvailable || 0;

            // Collect meal codes if available
            if (segment?.mealCode) {
              childMealInfo.push(segment.mealCode);
            }
            if (segment.cabinCode)
              childCabin.push(
                cabinTypeMap[segment.cabinCode] || segment.cabinCode,
              ); // Map cabin code to full name
          });
        });
      }
      let infantTotalSeatsAvailable = 0;
      let infantMealInfo = [];
      let infantIsRefundable = true;
      let infantCabin = [];
      let infantBaggage;
      if (infants) {
        infantBaggage = getBaggageInfo(
          infants.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        );
        // Check if passenger information has refundable status
        infantIsRefundable = !adults?.passengerInfo.nonRefundable;

        // Extract segment details from fareComponents
        infants?.passengerInfo.fareComponents.forEach((fareComponent) => {
          fareComponent.segments.forEach((segmentData) => {
            const segment = segmentData.segment;
            infantTotalSeatsAvailable += segment?.seatsAvailable || 0;

            // Collect meal codes if available
            if (segment?.mealCode) {
              infantMealInfo.push(segment.mealCode);
            }
            if (segment.cabinCode)
              infantCabin.push(
                cabinTypeMap[segment.cabinCode] || segment.cabinCode,
              ); // Map cabin code to full name
          });
        });
      }

      const departureFlightDetails = departureLeg.schedules.map((schedule) => {
        return scheduleDescs.find((desc) => desc.id === schedule.ref);
      });
      const returnFlightDetails = returnLeg
        ? returnLeg.schedules.map((schedule) => {
          return scheduleDescs.find((desc) => desc.id === schedule.ref);
        })
        : null;
      let marketingCarrier;
      let first = false;
      let operatingCarrier;
      departureFlightDetails.map((detail) => {
        if (!first) {
          marketingCarrier = detail.carrier.marketing;
          operatingCarrier = detail.carrier.operating;
          first = true;
        }
      });

      const airlineData = airlineLogoMap[marketingCarrier] || {
        arCode: "marketingCarrier code",
        logo: "default_logo_url",
        arAbbreviation: "AA",
      };
      const operatingairlineData = airlineLogoMap[operatingCarrier] || {
        arCode: "marketingCarrier code",
        logo: "default_logo_url",
        arAbbreviation: "AA",
      };
      let carrierCode;
      let previousArrivalTime = null;
      const departure = departureFlightDetails.map((detail, index) => {
        const lastArrivalTime = previousArrivalTime;
        carrierCode = detail.carrier.marketing;

        // Calculate departure time first
        const departureTimeStr = convertToISODateTimeWithRollOverf(
          detail.departure.time,
          start_date,
          lastArrivalTime,
        );
        const departureTime = new Date(departureTimeStr);

        // Calculate arrival time based on departure time
        // If arrival time is earlier than departure time, it's next day
        const arrivalTimeStr = convertToISODateTimeWithRollOverf(
          detail.arrival.time,
          start_date,
          departureTime,
        );
        const arrivalTime = new Date(arrivalTimeStr);

        let layoverTime = null;
        if (index > 0 && lastArrivalTime) {
          layoverTime = calculateLayoverTime(lastArrivalTime, departureTime);
        }

        previousArrivalTime = arrivalTime; // Store for next iteration
        return {
          marketingCarrier: carrierCode,
          departureTime: departureTimeStr,
          arrivalTime: arrivalTimeStr,
          departureLocation: detail.departure.airport,
          arrivalLocation: detail.arrival.airport,
          marketingFlightNumber: detail.carrier.marketingFlightNumber,
          marketing: detail.carrier.marketing,
          operating: detail.carrier.operating,
          operatingFlightNumber: detail.carrier.operatingFlightNumber,
          elapsedTime: convertMinutesToISODuration(detail.elapsedTime),
          stopCount: detail.stopCount,
          logo: airlineLogoMap[detail.carrier.marketing],
          operatinglogo: airlineLogoMap[detail.carrier.operating],
          layoverTime,
          terminal: detail.arrival.terminal,
        };
      });
      let previousReturnArrivalTime = null;
      const returnFlight = returnFlightDetails
        ? returnFlightDetails.map((detail, index) => {
          const lastReturnArrival = previousReturnArrivalTime;

          // Calculate departure time first
          const departureTimeStr = convertToISODateTimeWithRollOverf(
            detail.departure.time,
            end_date,
            lastReturnArrival,
          );
          const departureTime = new Date(departureTimeStr);

          // Calculate arrival time based on departure time
          // If arrival time is earlier than departure time, it's next day
          const arrivalTimeStr = convertToISODateTimeWithRollOverf(
            detail.arrival.time,
            end_date,
            departureTime,
          );
          const arrivalTime = new Date(arrivalTimeStr);

          let layoverTime = null;
          if (index > 0 && lastReturnArrival) {
            layoverTime = calculateLayoverTime(
              lastReturnArrival,
              departureTime,
            );
          }

          previousReturnArrivalTime = arrivalTime;
          return {
            departureTime: departureTimeStr,
            arrivalTime: arrivalTimeStr,
            departureLocation: detail.departure.airport,
            arrivalLocation: detail.arrival.airport,
            marketingFlightNumber: detail.carrier.marketingFlightNumber,
            marketing: detail.carrier.marketing,
            operating: detail.carrier.operating,
            operatingFlightNumber: detail.carrier.operatingFlightNumber,
            elapsedTime: convertMinutesToISODuration(detail.elapsedTime),
            stopCount: detail.stopCount,
            logo: airlineLogoMap[detail.carrier.marketing],
            operatinglogo: airlineLogoMap[detail.carrier.operating],
            layoverTime: layoverTime ? layoverTime : null,
            terminal: detail.arrival.terminal,
          };
        })
        : null;
      const adjustedPrice = calculateAdjustedPrice(
        pricingInfo.totalFare.totalPrice,
        findMakrup,
        staffMarkupValue,
        staffMarkupType,
        carrierCode,
      );
      netFare = pricingInfo.totalFare.totalPrice;
      const ticketTaxes = pricingInfo.passengerInfoList
        .flatMap((p) => p.passengerInfo?.taxes || []) // Use optional chaining and fallback to an empty array
        .map((tax) => {
          const taxDetail = taxDescriptions.find((desc) => desc.id === tax.ref);
          return {
            amount: taxDetail ? taxDetail.amount : 0,
            code: taxDetail ? taxDetail.code : "N/A",
            description: taxDetail ? taxDetail.description : "N/A",
            currency: taxDetail ? taxDetail.currency : "N/A",
            publishedAmount: taxDetail ? taxDetail.publishedAmount : "N/A",
            publishedCurrency: taxDetail ? taxDetail.publishedCurrency : "N/A",
            station: taxDetail ? taxDetail.station : "N/A",
            country: taxDetail ? taxDetail.country : "N/A",
          };
        });
      return {
        api: "sabre",
        uuid: uniqueId,
        brandedFare,
        arCode: airlineData.ar,
        logo: airlineData.logo,
        operatingLogo: operatingairlineData.logo,
        operatingArCode: operatingairlineData.ars,
        arAbbreviation: airlineData.arCode,
        departure,
        return: returnFlight,
        totalFare: pricingInfo.totalFare.totalPrice,
        netFare,
        passengerTotalFare: adjustedPrice,
        baseFare: pricingInfo.totalFare.equivalentAmount,
        totalTax: pricingInfo.totalFare.totalTaxAmount,
        taxSummaries: ticketTaxes,

        extra: {
          adult: {
            count: adults ? adults.passengerInfo.passengerNumber : 0,
            Price: adults
              ? adults.passengerInfo.passengerTotalFare.totalFare
              : 0,
            isRefundable: adultIsRefundable,
            meal: adultMealInfo.length
              ? adultMealInfo
              : ["No meal info available"],
            cabin: adultCabin,
            totalSeat: adultTotalSeatsAvailable,
            baggage: getBaggageInfo(adultb1, adultb2),
          },
          child: {
            count: children ? children.passengerInfo.passengerNumber : 0,
            Price: children
              ? children.passengerInfo.passengerTotalFare.totalFare
              : null,
            isRefundable: children ? childIsRefundable : null,
            meal: children
              ? childMealInfo.length
                ? childMealInfo
                : ["No meal info available"]
              : null,
            cabin: children ? childCabin : null,
            totalSeat: children ? childTotalSeatsAvailable : null,
            baggage: children ? childBaggage : null,
          },
          infants: {
            count: infants ? infants.passengerInfo.passengerNumber : null,
            Price: infants
              ? infants.passengerInfo.passengerTotalFare.totalFare
              : null,
            isRefundable: infants ? infantIsRefundable : null,
            meal: infants
              ? infantMealInfo.length
                ? infantMealInfo
                : ["No meal info available"]
              : null,
            cabin: infants ? infantCabin : null,
            totalSeat: infants ? infantTotalSeatsAvailable : null,
            baggage: infants ? infantBaggage : null,
          },
        },

        itineraries: [
          {
            departure: departure,
            cabin: adultCabin,
            bookingCode: adultBookingCode,
            return: returnFlight,
            totalFare: pricingInfo.totalFare.totalPrice,
            adjustedPrice,
          },
        ],
      };
    });
    return successResponse(res, "Flight data fetched successfully", {
      ticket: processedItineraries,
    });
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return errorResponse(res, error);
  }
}

async function postSabreFlightDataM(req, res) {
  await ensureToken();
  let code,
    logo,
    arAbbreviation,
    operatingCode,
    operatingLogo,
    operatingArAbbreviation;
  let marketingCarrier;
  const {
    pcc,
    adultsCount,
    childrenCount,
    infantsCount,
    dept,
    arrival,
    multicityFlights,
    includedAirlineCodes,
    staffMarkupValue,
    staffMarkupType,
    ticketClass,
    max,
    maxPrice,
    nonStop,
    type,
    airLinePreference,
    TripType,
    travelClass,
    returnTravelClass,
  } = req.body;

  let adjustedPrice = 0;

  // Retrieve markup details

  const findMarkup = await Markup.find({
    api: { $in: ["sabre", "all"] },
    status: "ACTIVE",
  });
  const findagency = await Agency.findById(req.user.agencyId);

  let markupType;
  if (findMarkup) {
    markupType = findMarkup.markupType;
  }

  // Prepare airline logo mapping
  let airlineLogoMap = {};
  try {
    airlineLogo.forEach(({ arCode, logo, ar }) => {
      airlineLogoMap[arCode] = { ar, logo, arCode };
    });
  } catch (error) {
    console.error("Error processing airline logo data:", error);
  }
  const OriginDestinationInformation = multicityFlights.map(
    (flight, index) => ({
      RPH: flight.RPH || String(index + 1), // optional RPH if not present
      DepartureDateTime: flight.DepartureDateTime,
      OriginLocation: {
        LocationCode: flight.OriginLocation.LocationCode,
        // PreferLevel: "Only", // enforce only this origin
      },
      DestinationLocation: {
        LocationCode: flight.DestinationLocation.LocationCode,
      },
      // Fixed: true, // destination fixed
    }),
  );

  console.log(airLinePreference);
  // Set up the data payload for the Sabre API request
  let data = {
    OTA_AirLowFareSearchRQ: {
      ResponseVersion: "v5",
      ResponseType: "GIR",
      Version: "5",
      POS: {
        Source: [
          {
            PseudoCityCode: `${SABRE.SABRE_PCC}`,
            RequestorID: {
              Type: "1",
              ID: "1",
              CompanyName: { Code: "TN" },
            },
          },
        ],
      },
      AvailableFlightsOnly: true,
      OriginDestinationInformation: multicityFlights, // This supports multiple legs
      TravelPreferences: {
        VendorPref: [
          ...(airLinePreference
            ? (Array.isArray(airLinePreference)
              ? airLinePreference
              : String(airLinePreference).split(",")
            )
              .map((code) => code.trim())
              .filter((code) => code && code !== "PK") // remove empty and PK
              .map((code) => ({ Code: code, Type: "Operating" })) // added Type
            : []),
          { Code: "PK", PreferLevel: "Unacceptable", Type: "Operating" }, // always included
        ],
        ETicketDesired: true,
        TPA_Extensions: {
          // NumTrips: { Number: 1 },
          DiversityParameters: {
            AdditionalNonStopsNumber: 10,
          },
          DataSources: { ATPCO: "Enable", LCC: "Enable", NDC: "Enable" },
          // NumTrips: { Number: 50 },
          KeepSameCabin: { Enabled: true },
          OnlineIndicator: { Ind: true },
          PreferNDCSourceOnTie: { Value: false },
          TripType: { Value: TripType ? TripType : "Other" },
          // LongConnectTime: { Enable: false, NumberOfSolutions: "2" },

          NDCIndicators: {
            MultipleBrandedFares: { Value: true },
            MaxNumberOfUpsells: { Value: 6 },
          },
        },
        Baggage: { CarryOnInfo: true },
        ETicketDesired: true,
        MaxStopsQuantity: nonStop
          ? Number(nonStop) >= 0
            ? Number(nonStop)
            : 5
          : 5,
      },
      TravelerInfoSummary: {
        PriceRequestInformation: {
          TPA_Extensions: {
            BrandedFareIndicators: {
              SingleBrandedFare: true,
              MultipleBrandedFares: true,
              ReturnBrandAncillaries: true,
            },
          },
        },
        AirTravelerAvail: [
          {
            PassengerTypeQuantity: [
              { Code: "ADT", Quantity: Number(adultsCount) },
            ],
          },
        ],
      },
      TPA_Extensions: {
        IntelliSellTransaction: {
          RequestType: { Name: "50ITINS" },
        },
        MultiTicket: {
          DisplayPolicy: "SOW",
        },
      },
    },
  };

  // Add children and infants if provided
  if (Number(childrenCount) > 0) {
    data.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.push(
      {
        Code: "CNN",
        Quantity: Number(childrenCount),
      },
    );
  }
  if (Number(infantsCount) > 0) {
    data.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.push(
      {
        Code: "INF",
        Quantity: Number(infantsCount),
      },
    );
  }
  if (travelClass) {
    const sabreCabinClass = travelClassMap[travelClass.toUpperCase()];
    if (sabreCabinClass) {
      data.OTA_AirLowFareSearchRQ.TravelPreferences.CabinPref = [
        { Cabin: sabreCabinClass, PreferLevel: "Preferred" },
      ];
    } else {
      console.warn("Invalid travelClass provided:", travelClass);
    }
  }
  // return errorResponse(res, data, 404);
  try {
    const flightData = await postFlightData(
      `${SABRE.BASE_URL}/v5/offers/shop`,
      data,
    );
    // return errorResponse(res, flightData, 404);

    // Extract relevant data for processing
    const { groupedItineraryResponse } = flightData || {};
    const baggageAllowanceDesc =
      groupedItineraryResponse?.baggageAllowanceDescs || [];
    const scheduleDescs = groupedItineraryResponse?.scheduleDescs || [];
    const fareComponentDescs =
      flightData?.groupedItineraryResponse.fareComponentDescs;
    const brandFeatureDescs =
      flightData?.groupedItineraryResponse.brandFeatureDescs;
    const itineraries =
      groupedItineraryResponse?.itineraryGroups?.[0]?.itineraries || [];
    const groupDescription =
      groupedItineraryResponse?.itineraryGroups?.[0]?.groupDescription
        ?.legDescriptions || [];
    const legDescs = groupedItineraryResponse?.legDescs || [];
    // Process each itinerary
    const processedItineraries = itineraries.map((itinerary) => {
      const legs = itinerary?.legs?.map((leg) => leg?.ref) ?? [];
      const uniqueId = v4();

      // First, find the first available (not sold out) pricing
      const availablePricing = itinerary?.pricingInformation?.find(
        (p) => !p.soldOut,
      );

      if (!availablePricing) {
        // If all sold out, skip this itinerary
        return; // or continue, depending if you are inside a loop
      }

      // Now safely get the fare
      const pricingInfo = availablePricing.fare;

      const adults = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "ADT",
      );
      const children = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "CNN",
      );
      const infants = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "INF",
      );
      const brandedFare = itinerary?.pricingInformation
        ?.map((data) => {
          if (data.fare) {
            let a, b, c, d, e;
            let airlineCode = data.fare.validatingCarrierCode;
            return {
              data: data.fare.passengerInfoList.map((passengerInfo) => {
                const passengerDetails = passengerInfo.passengerInfo;
                const fareComponents = passengerDetails.fareComponents.map(
                  (fareComponent) => {
                    const segments = fareComponent.segments.map(
                      (segmentData) => {
                        return {
                          bookingCode: segmentData.segment?.bookingCode,
                          seatsAvailable: segmentData?.segment?.seatsAvailable,
                        };
                      },
                    );

                    return {
                      ref: fareComponent.ref,
                      beginAirport: fareComponent?.beginAirport,
                      endAirport: fareComponent?.endAirport,
                      segments,
                    };
                  },
                );
                const brandInfo = passengerDetails.fareComponents.map(
                  (component) => {
                    // Find the matching fareComponentDesc using the "ref"
                    const matchedDesc = fareComponentDescs.find(
                      (desc) => desc.id === component.ref,
                    );

                    console.log("🔍 fareComponent.ref:", component.ref);
                    console.log("🔍 matched fareComponentDesc:", matchedDesc);

                    return matchedDesc ? matchedDesc.fareBasisCode : null;
                  },
                );

                // Fetch the marketing flight details
                const marketingFlightDetails = data.soldOut?.soldOutLegs?.map(
                  (soldOutLeg) => {
                    return soldOutLeg.soldOutSchedules.map((schedule) => ({
                      brandName: schedule.brandName,
                      programId: schedule.programId,
                      programCode: schedule.programCode,
                      programDescription: schedule.programDescription,
                      programSystemCode: schedule.programSystemCode,
                    }));
                  },
                );

                // Additional required details
                ((a =
                  passengerDetails.fareComponents[0].segments[0].segment
                    .seatsAvailable), // Total available seats
                  (b = getBaggageInfo(
                    passengerDetails.baggageInformation,
                    baggageAllowanceDesc,
                  )), // Total available seats
                  (adultb1 = passengerDetails.baggageInformation));
                adultb2 = baggageAllowanceDesc;
                c =
                  passengerDetails.fareComponents[0].segments[0].segment
                    .mealCode;
                d = passengerDetails.nonRefundable; // Total available seats
                e = getbrandNameInfo(
                  passengerDetails.fareComponents,
                  fareComponentDescs,
                );
                let z = getbrandNameInfo(
                  passengerDetails.fareComponents,
                  fareComponentDescs,
                );
                return {
                  brandInfo,
                  fareComponents,
                  brandInfo: brandInfo,
                  passengerType: passengerDetails.passengerType,
                  passengerNumber: passengerDetails.passengerNumber,
                  nonRefundable: passengerDetails.nonRefundable,
                  brandName: [z[0].brandName],
                  brandCode: z[0].brandCode,
                  fareBasisCode: z[0].fareBasisCode,
                  baggageInformation: getBaggageInfo(
                    passengerDetails.baggageInformation,
                    baggageAllowanceDesc,
                  ),
                  brandFeatures: getbrandFeatures(
                    passengerDetails.fareComponents,
                    brandFeatureDescs,
                  ),
                  fare: passengerDetails.passengerTotalFare.totalFare, // Total fare
                  taxAmount: passengerDetails.passengerTotalFare.totalTaxAmount, // Total fare
                  totalSeats:
                    passengerDetails.fareComponents[0].segments[0].segment
                      .seatsAvailable, // Total available seats
                  bookingCode:
                    passengerDetails.fareComponents[0].segments[0].segment
                      .bookingCode, // Total available seats
                  meal: passengerDetails.fareComponents[0].segments[0].segment
                    .mealCode, // Total available seats
                };
              }),
              nada: data.fare.totalFare.totalPrice,
              totalFare: calculateAdjustedPrice(
                data.fare.totalFare.totalPrice,
                findMarkup,
                staffMarkupValue,
                staffMarkupType,
                airlineCode,
              ),

              refundable: d,
              meal: c,
              baggage: b,
              seats: a,
              brandName: [e[0].brandName],
              brandCode: e[0].brandCode,
              fareWithMarkup: data.fare.totalFare.totalPrice,
              adjustedPrice: calculateAdjustedPrice(
                data.fare.totalFare.totalPrice,
                findMarkup,
                staffMarkupValue,
                staffMarkupType,
                airlineCode,
              ),
              netFare: data.fare.totalFare.totalPrice,
            };
          }
          return null;
        })
        .filter(Boolean);

      // Extract total available seats, meal info, and refundability
      let adultTotalSeatsAvailable = 0;
      let adultMealInfo = [];
      let adultIsRefundable = true;
      let adultBookingCode = [];

      let adultCabin = [];
      let adultBaggage = adults?.passengerInfo
        ? getBaggageInfo(
          adults?.passengerInfo?.baggageInformation,
          baggageAllowanceDesc,
        )
        : null;

      // Check if passenger information has refundable status
      adultIsRefundable = !adults?.passengerInfo.nonRefundable;

      // Extract segment details from fareComponents
      adults?.passengerInfo.fareComponents.forEach((fareComponent) => {
        fareComponent.segments.forEach((segmentData) => {
          const segment = segmentData.segment;
          adultTotalSeatsAvailable += segment?.seatsAvailable || 0;

          // Collect meal codes if available
          if (segment?.mealCode) {
            adultMealInfo.push(segment.mealCode);
          }
          if (segment?.bookingCode) adultBookingCode.push(segment.bookingCode);

          if (segment?.cabinCode)
            adultCabin.push(
              cabinTypeMap[segment.cabinCode] || segment.cabinCode,
            );
        });
      });
      adults.passengerInfo.passengerInfo;
      let childTotalSeatsAvailable = 0;
      let childMealInfo = [];
      let childIsRefundable = true;
      let childCabin = [];
      let childBaggage;

      if (children) {
        childBaggage = getBaggageInfo(
          children.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        );
        // Check if passenger information has refundable status
        childIsRefundable = !adults?.passengerInfo.nonRefundable;

        // Extract segment details from fareComponents
        children?.passengerInfo.fareComponents.forEach((fareComponent) => {
          fareComponent.segments.forEach((segmentData) => {
            const segment = segmentData.segment;
            childTotalSeatsAvailable += segment?.seatsAvailable || 0;

            // Collect meal codes if available
            if (segment?.mealCode) {
              childMealInfo.push(segment.mealCode);
            }
            if (segment?.cabinCode) childCabin.push(segment.cabinCode); // Map cabin code to full name
          });
        });
      }
      let infantTotalSeatsAvailable = 0;
      let infantMealInfo = [];
      let infantIsRefundable = true;
      let infantCabin = [];
      let infantBaggage;
      if (infants) {
        infantBaggage = getBaggageInfo(
          infants.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        );
        // Check if passenger information has refundable status
        infantIsRefundable = !adults?.passengerInfo.nonRefundable;

        // Extract segment details from fareComponents
        infants?.passengerInfo.fareComponents.forEach((fareComponent) => {
          fareComponent.segments.forEach((segmentData) => {
            const segment = segmentData.segment;
            infantTotalSeatsAvailable += segment?.seatsAvailable || 0;

            // Collect meal codes if available
            if (segment?.mealCode) {
              infantMealInfo.push(segment.mealCode);
            }
            if (segment?.cabinCode) infantCabin.push(segment.cabinCode); // Map cabin code to full name
          });
        });
      }
      // Map flight details for each leg in the itinerary
      // Track previous arrival time per leg (reset for each new leg)
      const flights = legs.flatMap((legRef, legIndex) => {
        const legdesc = legDescs.find((leg) => leg.id === legRef);
        const baseDate = groupDescription[legIndex]?.departureDate;
        let previousArrivalTime = null; // Reset for each leg

        // Process all schedules for each leg
        return legdesc.schedules.map((scheduleItem, scheduleIndex) => {
          const departureScheduleInfo = scheduleDescs.find(
            (schedule) => schedule.id === scheduleItem.ref,
          );
          const marketingCarrier = departureScheduleInfo?.carrier?.marketing;
          const operatingCarrier = departureScheduleInfo?.carrier?.operating;
          const airlineData = airlineLogoMap[marketingCarrier] || {
            arCode: marketingCarrier,
            logo: "default_logo_url",
            arAbbreviation: "AA",
          };
          const operatingairlineData = airlineLogoMap[operatingCarrier] || {
            arCode: operatingCarrier,
            logo: "default_logo_url",
            arAbbreviation: "AA",
          };
          if (legIndex === 0 && scheduleIndex === 0) {
            code = airlineData.ar;
            logo = airlineData.logo;
            arAbbreviation = airlineData.ar;
            operatingCode = operatingairlineData.ar;
            operatingLogo = operatingairlineData.logo;
            operatingArAbbreviation = operatingairlineData.ar;
          }

          // Calculate departure time with rollover within the leg
          const departureTimeStr = convertToISODateTimeWithRollOverf(
            departureScheduleInfo?.departure?.time,
            baseDate,
            previousArrivalTime,
          );
          const departureTime = new Date(departureTimeStr);
          const departureDate = departureTimeStr.split("T")[0]; // Extract date part

          // Calculate arrival time based on departure time
          const arrivalTimeStr = convertToISODateTimeWithRollOverf(
            departureScheduleInfo?.arrival?.time,
            baseDate,
            departureTime,
          );
          const arrivalTime = new Date(arrivalTimeStr);
          const arrivalDate = arrivalTimeStr.split("T")[0]; // Extract date part

          // Update previous arrival time for next segment in this leg
          previousArrivalTime = arrivalTime;

          return {
            departure: {
              time: extractTime(departureScheduleInfo?.departure?.time),
              airport: departureScheduleInfo?.departure?.airport || "N/A",
              terminal: departureScheduleInfo?.departure?.terminal || "N/A",
              date: departureDate,
            },
            logo: {
              code: airlineData.ar,
              logo: airlineData.logo,
            },
            operatingLogo: {
              code: operatingairlineData.ar,
              logo: operatingairlineData.logo,
            },
            arrival: {
              time: extractTime(departureScheduleInfo?.arrival?.time),
              date: arrivalDate,
              airport: departureScheduleInfo?.arrival?.airport || "N/A",
              terminal: departureScheduleInfo?.arrival?.terminal || "N/A",
            },
            marketingFlightNumber:
              departureScheduleInfo?.carrier?.marketingFlightNumber || "N/A",
            operatingCarrier: departureScheduleInfo?.carrier?.operating,
            operatingFlightNumber:
              departureScheduleInfo?.carrier?.operatingFlightNumber,
            marketing: marketingCarrier || "N/A",
            elapsedTime: convertMinutesToISODuration(
              departureScheduleInfo?.elapsedTime || 0,
            ),
            stopCount: departureScheduleInfo?.stopCount || 0,
          };
        });
      });

      // Calculate adjusted price based on markup type
      const basePrice = Number(pricingInfo?.totalFare?.totalPrice || 0);
      const baseFare = Number(pricingInfo.totalFare?.baseFareAmount || 0);
      adjustedPrice = Number(pricingInfo.totalPrice || 0);
      // if (findMarkup) {
      //   adjustedPrice =
      //     markupType === EMarkupType.percentage
      //       ? basePrice + (basePrice * findMarkup.markupValue) / 100
      //       : basePrice + findMarkup.markupValue;
      // }

      adjustedPrice = calculateAdjustedPrice(
        pricingInfo.totalFare.totalPrice,
        findMarkup,
        staffMarkupValue,
        staffMarkupType,
      );

      // Fetch airline logo and details
      const airlineData = airlineLogoMap[marketingCarrier] || {
        arCode: marketingCarrier,
        logo: "default_logo_url",
        arAbbreviation: "AA",
      };
      // const operatingairlineData = airlineLogoMap[operatingCarrier] || {
      //   arCode: operatingCarrier,
      //   logo: "default_logo_url",
      //   arAbbreviation: "AA",
      // };
      return {
        api: "sabre",
        flights,
        uuid: uniqueId,
        arCode: code,
        logo: logo,
        operatingLogo,
        operatingCode,
        operatingArAbbreviation,
        arAbbreviation: arAbbreviation,
        passengerTotalFare: adjustedPrice ? adjustedPrice : 0,
        totalFare: basePrice,
        baseFare: baseFare,
        brandedFare,
        itineraries: flights.map((itinerary) => {
          return {
            departure: itinerary,
            cabin: adultCabin,
            bookingCode: adultBookingCode,
            totalFare: basePrice,
            adjustedPrice: basePrice,
          };
        }),
        extra: {
          adult: {
            count: adults ? adults.passengerInfo.passengerNumber : 0,
            Price: adults
              ? adults.passengerInfo.passengerTotalFare.totalFare
              : 0,
            isRefundable: adultIsRefundable,
            meal: adultMealInfo.length
              ? adultMealInfo
              : ["No meal info available"],
            cabin: adultCabin,
            totalSeat: adultTotalSeatsAvailable,
            baggage: adultBaggage,
          },
          child: {
            count: children ? children.passengerInfo.passengerNumber : 0,
            Price: children
              ? children.passengerInfo.passengerTotalFare.totalFare
              : null,
            isRefundable: children ? childIsRefundable : null,
            meal: children
              ? childMealInfo.length
                ? childMealInfo
                : ["No meal info available"]
              : null,
            cabin: children ? childCabin : null,
            totalSeat: children ? childTotalSeatsAvailable : null,
            baggage: children ? childBaggage : null,
          },
          infants: {
            count: infants ? infants.passengerInfo.passengerNumber : null,
            Price: infants
              ? infants.passengerInfo.passengerTotalFare.totalFare
              : null,
            isRefundable: infants ? infantIsRefundable : null,
            meal: infants
              ? infantMealInfo.length
                ? infantMealInfo
                : ["No meal info available"]
              : null,
            cabin: infants ? infantCabin : null,
            totalSeat: infants ? infantTotalSeatsAvailable : null,
            baggage: infants ? infantBaggage : null,
          },
        },
        passengerTotalFare: adjustedPrice,
        taxSummaries:
          groupedItineraryResponse.taxSummaryDescs?.map((tax) => ({
            amount: tax?.amount || 0,
            description: tax?.description || "N/A",
          })) || [],
      };
    });

    return successResponse(res, "Flight data fetched successfully", {
      ticket: processedItineraries,
    });
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return errorResponse(res, error);
  }
}

function extractTime(timeStr) {
  // Remove timezone part (+04:00, +05:00, Z)
  return timeStr.replace(/([+-]\d{2}:\d{2}|Z)$/, "");
}
function formatDateTime(datetime) {
  return datetime.replace(/\.\d{3}Z$/, ""); // removes .000Z
}
async function revalidateItinerary(req, res) {
  let code,
    logo,
    arAbbreviation,
    operatingArAbbreviation,
    operatingCode,
    operatingLogo,
    netFare = 0;
  const { staffMarkupValue, staffMarkupType } = req.body;
  const findMakrup = await Markup.find({
    api: { $in: ["sabre", "all"] },
    status: "ACTIVE",
  });

  const findagency = await Agency.findById(req.user.agencyId);
  let label = findagency ? findagency.showLabel : null;

  if (findMakrup) {
    let markupType = findMakrup.markupType;
  }
  // return errorResponse(res, req.body, 404);
  try {
    const findMarkup = await Markup.find({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });
    let markupType;
    if (findMarkup) {
      markupType = findMarkup.markupType;
    }
    let airlineLogoMap = {};
    try {
      airlineLogo.forEach(({ arCode, logo, ar }) => {
        airlineLogoMap[arCode] = { ar, logo, arCode };
      });
    } catch (error) {
      console.error("Error processing airline logo data:", error);
    }
    await ensureToken();
    const {
      adult,
      children,
      infants,
      OriginDestinationInformation,
      selectedBrandedFare,
      connectingFlights,
      type,
    } = req.body;
    console.log("selectedBrandedFare", selectedBrandedFare);
    const FareBasis = selectedBrandedFare.data[0].brandInfo.map((code) => ({
      Code: code,
      PreferLevel: "Preferred",
    }));
    const brnadCode = selectedBrandedFare.data[0].brandCode;

    const fareBasisList = selectedBrandedFare.data[0].brandInfo; // One per segment

    // NDC brand codes can be >10 chars (e.g. "CLASSIC-PCID") which OTA v4 schema rejects.
    // Detect NDC: brand code longer than 10 chars OR contains a hyphen
    const isNDCFlight = brnadCode && (brnadCode.length > 10 || brnadCode.includes("-"));
    console.log(`[Revalidate] brandCode="${brnadCode}", isNDC=${isNDCFlight}`);

    let brandFilters = {};
    if (brnadCode && !isNDCFlight) {
      // ATPCO branded fare — safe to send brand code to OTA revalidate (max 10 chars)
      brandFilters = {
        Brand: [
          {
            Code: brnadCode,
            PreferLevel: "Preferred",
          },
        ],
        NonBrandedFares: { PreferLevel: "Unacceptable" },
      };
    } else {
      // NDC fare OR no brand — OTA schema does not support NDC brand codes, skip Brand filter
      brandFilters = {
        NonBrandedFares: { PreferLevel: "Preferred" },
      };
    }

    const SeatsRequested = Number(adult) + Number(children) + Number(infants);
    let formattedOriginDestinationInformation;
    if (type == "Multi City") {
      formattedOriginDestinationInformation = connectingFlights.map(
        (item, index) => {
          const fareBasisCode =
            fareBasisList[index] || fareBasisList[fareBasisList.length - 1];

          const flights = item.connectingFlights.map((cFlight) => ({
            Number: cFlight.marketingFlightNumber,
            Airline: { Marketing: cFlight.marketing },
            DepartureDateTime: formatDateTime(
              `${cFlight.departure.date}T${cFlight.departure.time}`,
            ),
            ArrivalDateTime: formatDateTime(
              `${cFlight.arrival.date}T${cFlight.arrival.time}`,
            ),
            ClassOfService: cFlight.bookingCode || "Y",
            OriginLocation: { LocationCode: cFlight.departure.airport },
            DestinationLocation: { LocationCode: cFlight.arrival.airport },
            Type: "A",
          }));

          return {
            RPH: `${index + 1}`,
            DepartureDateTime: formatDateTime(item.depart),
            OriginLocation: { LocationCode: item.from },
            DestinationLocation: { LocationCode: item.to },
            TPA_Extensions: {
              Flight: flights,
              BrandFilters: brandFilters,
              FareBasis: fareBasisList?.map((item) => ({
                Code: item,
                PreferLevel: "Preferred",
              })),
            },
          };
        },
      );
    } else {
      // formattedOriginDestinationInformation = OriginDestinationInformation.map(
      //   (item, idx) => {
      //     const fareBasisCode =
      //       fareBasisList[idx] || fareBasisList[fareBasisList.length - 1];

      //     const fareComponents = selectedBrandedFare.data[0].fareComponents;
      //     const segments = fareComponents.flatMap((fc) => fc.segments); // flatten all segments

      //     return {
      //       ...item,
      //       DepartureDateTime: item.DepartureDateTime.replace(/\.\d+$/, ""),
      //       TPA_Extensions: {
      //         Flight: item.TPA_Extensions.Flight.map((flight, fIdx) => ({
      //           ...flight,
      //           DepartureDateTime: flight.DepartureDateTime.replace(
      //             /\.\d+$/,
      //             ""
      //           ),
      //           ArrivalDateTime: flight.ArrivalDateTime.replace(/\.\d+$/, ""),
      //           // Assign ClassOfService from fareComponents segment bookingCode
      //           ClassOfService:
      //             segments[fIdx]?.bookingCode || flight.ClassOfService,
      //         })),
      //         BrandFilters: brandFilters,
      //         FareBasis: [
      //           {
      //             Code: fareBasisCode,
      //             PreferLevel: "Preferred",
      //           },
      //         ],
      //       },
      //     };
      //   }
      // );
      formattedOriginDestinationInformation = OriginDestinationInformation.map(
        (item, idx) => {
          const fareComponents = selectedBrandedFare.data[0].fareComponents;
          const segments = fareComponents.flatMap((fc) => fc.segments); // flatten all segments

          return {
            RPH: item.RPH || String(idx),
            DepartureDateTime: item.DepartureDateTime.replace(/\.\d+$/, ""),
            DestinationLocation: item.DestinationLocation,
            OriginLocation: item.OriginLocation,
            TPA_Extensions: {
              BrandFilters: brandFilters,
              Flight: item.TPA_Extensions.Flight.map((flight, fIdx) => ({
                ...flight,
                DepartureDateTime: flight.DepartureDateTime.replace(
                  /\.\d+$/,
                  "",
                ),
                ArrivalDateTime: flight.ArrivalDateTime.replace(/\.\d+$/, ""),
                ClassOfService:
                  segments[fIdx]?.bookingCode || flight.ClassOfService,
              })),
            },
          };
        },
      );
    }

    // let body = {
    //   OTA_AirLowFareSearchRQ: {
    //     Version: "4",
    //     POS: {
    //       Source: [
    //         {
    //           PseudoCityCode: `${SABRE.SABRE_PCC}`,
    //           RequestorID: {
    //             Type: "1",
    //             ID: "1",
    //             CompanyName: {
    //               Code: "TN",
    //               content: "TN",
    //             },
    //           },
    //         },
    //       ],
    //     },
    //     OriginDestinationInformation: formattedOriginDestinationInformation,
    //     TravelPreferences: {
    //       TPA_Extensions: {
    //         DataSources: {
    //           NDC: "Disable",
    //           ATPCO: "Enable",
    //           LCC: "Enable",
    //         },
    //         PreferNDCSourceOnTie: {
    //           Value: true,
    //         },
    //         VerificationItinCallLogic: {
    //           Value: "B",
    //           AlwaysCheckAvailability: true,
    //         },
    //         // FareBasis: FareBasis,
    //       },
    //       Baggage: { CarryOnInfo: true },
    //       ETicketDesired: true,
    //     },
    //     TravelerInfoSummary: {
    //       SeatsRequested: [SeatsRequested],
    //       AirTravelerAvail: [
    //         {
    //           PassengerTypeQuantity: [
    //             {
    //               Code: "ADT",
    //               Quantity: Number(adult),
    //             },
    //           ],
    //         },
    //       ],
    //       PriceRequestInformation: {
    //         CurrencyCode: "PKR",
    //         NegotiatedFareCode: [
    //           {
    //             Code: "PKK45",
    //             Supplier: [{ Code: "TN" }],
    //           },
    //         ],
    //         TPA_Extensions: {
    //           BrandedFareIndicators: {
    //             MultipleBrandedFares: false,
    //             ReturnBrandAncillaries: true,
    //           },
    //         },
    //       },
    //     },
    //     AvailableFlightsOnly: true,
    //     TPA_Extensions: {
    //       IntelliSellTransaction: {
    //         RequestType: {
    //           Name: "50ITINS",
    //         },
    //       },
    //     },
    //   },
    // };

    let body = {
      OTA_AirLowFareSearchRQ: {
        Version: "4",
        POS: {
          Source: [
            {
              PseudoCityCode: `${SABRE.SABRE_PCC}`,
              RequestorID: {
                Type: "1",
                ID: "1",
                CompanyName: {
                  Code: "TN",
                  content: "TN",
                },
              },
            },
          ],
        },
        OriginDestinationInformation: formattedOriginDestinationInformation,
        TravelPreferences: {
          TPA_Extensions: {
            VerificationItinCallLogic: {
              Value: "B",
            },
          },
        },
        TravelerInfoSummary: {
          SeatsRequested: [SeatsRequested],
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: [
                {
                  Code: "ADT",
                  Quantity: Number(adult),
                },
              ],
            },
          ],
        },
        TPA_Extensions: {
          IntelliSellTransaction: {
            RequestType: {
              Name: "50ITINS",
            },
          },
        },
      },
    };

    // return successResponse(res, "Flight data fetched successfully", body);
    if (Number(children) > 0) {
      body.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.push(
        { Code: "CNN", Quantity: Number(children) },
      );
    }
    if (Number(infants) > 0) {
      body.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.push(
        { Code: "INF", Quantity: Number(infants) },
      );
    }
    // return errorResponse(res, body, 404);
    const flightData = await postFlightData(
      `${SABRE.BASE_URL}/v4/shop/flights/revalidate`,
      body,
    );
    // return errorResponse(res, flightData, 404);
    let totalCount = Number(adult) + Number(children) + Number(infants);
    if (flightData.groupedItineraryResponse.statistics.itineraryCount <= 0) {
      return errorResponse(res, "ticket not found", 200);
    }
    if (req.body.type === "Multi City") {
      console.log("Multi City");
      function getFlightStartTimes(input) {
        const startTimes = input.OriginDestinationInformation.map(
          (info) => info.DepartureDateTime,
        );
        return startTimes;
      }
      let { groupedItineraryResponse } = flightData || {};
      let baggageAllowanceDesc =
        groupedItineraryResponse?.baggageAllowanceDescs || [];
      let scheduleDescs = groupedItineraryResponse?.scheduleDescs || [];
      let fareComponentDescs =
        flightData?.groupedItineraryResponse.fareComponentDescs;

      let itineraries =
        groupedItineraryResponse?.itineraryGroups?.[0]?.itineraries || [];
      let groupDescription =
        groupedItineraryResponse?.itineraryGroups?.[0]?.groupDescription
          ?.legDescriptions || [];
      const legDescs = groupedItineraryResponse?.legDescs || [];
      // Process each itinerary
      const processedItineraries = itineraries.map((itinerary) => {
        const legs = itinerary?.legs?.map((leg) => leg?.ref) ?? [];

        const pricingInfo = itinerary?.pricingInformation?.[0]?.fare;
        const adults = pricingInfo?.passengerInfoList.find(
          (p) => p.passengerInfo.passengerType === "ADT",
        );
        const children = pricingInfo?.passengerInfoList.find(
          (p) => p.passengerInfo.passengerType === "CNN",
        );
        const infants = pricingInfo?.passengerInfoList.find(
          (p) => p.passengerInfo.passengerType === "INF",
        );

        // Extract total available seats, meal info, and refundability
        let adultTotalSeatsAvailable = 0;
        let adultMealInfo = [];
        let adultIsRefundable = false;
        let meal;
        let adultCabin = [];
        let adultBookingCode = [];
        let adultBaggage = getBaggageInfo(
          adults.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        );

        // Check if passenger information has refundable status
        adultIsRefundable = !adults?.passengerInfo.nonRefundable;
        meal =
          adults?.passengerInfo?.fareComponents?.[0]?.segments?.[0]?.segment
            ?.mealCode ?? null;
        // Extract segment details from fareComponents
        adults?.passengerInfo.fareComponents.forEach((fareComponent) => {
          fareComponent.segments.forEach((segmentData) => {
            const segment = segmentData.segment;
            adultTotalSeatsAvailable += segment?.seatsAvailable || 0;

            // Collect meal codes if available
            if (segment?.mealCode) {
              adultMealInfo.push(segment.mealCode);
            }
            if (segment?.bookingCode)
              adultBookingCode.push(segment?.bookingCode);

            if (segment?.cabinCode)
              adultCabin.push(
                cabinTypeMap[segment?.cabinCode] || segment?.cabinCode,
              );
          });
        });
        adults.passengerInfo.passengerInfo;
        let childTotalSeatsAvailable = 0;
        let childMealInfo = [];
        let childIsRefundable = false;
        let childCabin = [];
        let childBaggage;

        if (children) {
          childBaggage = getBaggageInfo(
            children.passengerInfo.baggageInformation,
            baggageAllowanceDesc,
          );
          // Check if passenger information has refundable status
          childIsRefundable = !adults?.passengerInfo.nonRefundable;

          // Extract segment details from fareComponents
          children?.passengerInfo.fareComponents.forEach((fareComponent) => {
            fareComponent.segments.forEach((segmentData) => {
              const segment = segmentData.segment;
              childTotalSeatsAvailable += segment?.seatsAvailable || 0;

              // Collect meal codes if available
              if (segment?.mealCode) {
                childMealInfo.push(segment.mealCode);
              }
              if (segment?.cabinCode) childCabin.push(segment.cabinCode); // Map cabin code to full name
            });
          });
        }
        let infantTotalSeatsAvailable = 0;
        let infantMealInfo = [];
        let infantIsRefundable = false;
        let infantCabin = [];
        let infantBaggage;
        if (infants) {
          infantBaggage = getBaggageInfo(
            infants.passengerInfo.baggageInformation,
            baggageAllowanceDesc,
          );
          // Check if passenger information has refundable status
          infantIsRefundable = !adults?.passengerInfo.nonRefundable;

          // Extract segment details from fareComponents
          infants?.passengerInfo.fareComponents.forEach((fareComponent) => {
            fareComponent.segments.forEach((segmentData) => {
              const segment = segmentData.segment;
              infantTotalSeatsAvailable += segment?.seatsAvailable || 0;

              // Collect meal codes if available
              if (segment?.mealCode) {
                infantMealInfo.push(segment.mealCode);
              }
              if (segment?.cabinCode) infantCabin.push(segment.cabinCode); // Map cabin code to full name
            });
          });
        }
        let airlineName;
        // Map flight details for each leg in the itinerary
        // Track previous arrival time per leg (reset for each new leg)
        const flights = legs.flatMap((legRef, legIndex) => {
          const legdesc = legDescs.find((leg) => leg.id === legRef);
          const baseDate = groupDescription[legIndex]?.departureDate;
          let previousArrivalTime = null; // Reset for each leg

          // Process all schedules for each leg
          return legdesc.schedules.map((scheduleItem, scheduleIndex) => {
            const departureScheduleInfo = scheduleDescs.find((schedule) => {
              return schedule.id === scheduleItem.ref;
            });
            marketingCarrier = departureScheduleInfo?.carrier?.marketing;
            const airlineData = airlineLogoMap[
              departureScheduleInfo?.carrier?.marketing
            ] || {
              arCode: departureScheduleInfo?.carrier?.marketing,
              logo: "default_logo_url",
              arAbbreviation: "AA",
            };
            const operatingairlineData = airlineLogoMap[
              departureScheduleInfo?.carrier?.operating
            ] || {
              arCode: departureScheduleInfo?.carrier?.marketing,
              logo: "default_logo_url",
              arAbbreviation: "AA",
            };
            if (legIndex === 0 && scheduleIndex === 0) {
              // console.log("INDEX IS ", legIndex);
              code = airlineData.arCode;
              logo = airlineData.logo;
              arAbbreviation = airlineData.ar;
              operatingArAbbreviation = operatingairlineData.ar;
              operatingCode = operatingairlineData.arCode;
              operatingLogo = operatingairlineData.logo;
            }
            airlineName = departureScheduleInfo?.carrier?.operating;

            // Calculate departure time with rollover within the leg
            const departureTimeStr = convertToISODateTimeWithRollOverf(
              departureScheduleInfo?.departure?.time,
              baseDate,
              previousArrivalTime,
            );
            const departureTime = new Date(departureTimeStr);
            const departureDate = departureTimeStr.split("T")[0]; // Extract date part

            // Calculate arrival time based on departure time
            const arrivalTimeStr = convertToISODateTimeWithRollOverf(
              departureScheduleInfo?.arrival?.time,
              baseDate,
              departureTime,
            );
            const arrivalTime = new Date(arrivalTimeStr);
            const arrivalDate = arrivalTimeStr.split("T")[0]; // Extract date part

            let layoverTime = null;
            if (scheduleIndex > 0 && previousArrivalTime) {
              layoverTime = calculateLayoverTime(
                previousArrivalTime,
                departureTime,
              );
            }

            // Update previous arrival time for next segment in this leg
            previousArrivalTime = arrivalTime;

            return {
              departure: {
                departureTime: departureTimeStr,
                arrivalTime: arrivalTimeStr,
                departureLocation: departureScheduleInfo?.departure?.airport,
                arrivalLocation: departureScheduleInfo?.arrival?.airport,
                departure: {
                  time: extractTime(departureScheduleInfo?.departure?.time),
                  airport: departureScheduleInfo?.departure?.airport || "N/A",
                  terminal: departureScheduleInfo?.departure?.terminal || "N/A",
                  date: departureDate,
                },
                logo: {
                  code: airlineData.arCode,
                  logo: airlineData.logo,
                  arAbbreviation: airlineData.ar,
                },
                operatingLogo: {
                  code: operatingairlineData.arCode,
                  logo: operatingairlineData.logo,
                  arAbbreviation: operatingairlineData.ar,
                },
                arrival: {
                  time: extractTime(departureScheduleInfo?.arrival?.time),
                  date: arrivalDate,
                  airport: departureScheduleInfo?.arrival?.airport || "N/A",
                  terminal: departureScheduleInfo?.arrival?.terminal || "N/A",
                },
              },
              marketingFlightNumber:
                departureScheduleInfo?.carrier?.marketingFlightNumber || "N/A",
              operatingCarrier: departureScheduleInfo?.carrier?.operating,
              operatingFlightNumber:
                departureScheduleInfo?.carrier?.operatingFlightNumber,
              marketing: departureScheduleInfo?.carrier?.marketing || "N/A",
              elapsedTime: convertMinutesToISODuration(
                departureScheduleInfo?.elapsedTime || 0,
              ),
              layoverTime: layoverTime,
              stopCount: departureScheduleInfo?.stopCount || 0,
            };
          });
        });

        // Calculate adjusted price based on markup type
        const basePrice = Number(
          itinerary?.pricingInformation?.[0]?.fare?.totalFare?.totalPrice || 0,
        );
        const baseFare = Number(
          itinerary?.pricingInformation?.[0]?.fare?.totalFare
            ?.equivalentAmount || 0,
        );
        // adjustedPrice = Number(
        //   itinerary?.pricingInformation?.[0]?.fare?.totalFare?.totalPrice || 0
        // );
        // if (findMarkup) {
        //   adjustedPrice =
        //     markupType === EMarkupType.percentage
        //       ? basePrice + (basePrice * findMarkup.markupValue) / 100
        //       : basePrice + findMarkup.markupValue;
        // }
        adjustedPrice = calculateAdjustedPrice(
          itinerary?.pricingInformation?.[0]?.fare?.totalFare?.totalPrice,
          findMarkup,
          staffMarkupValue,
          staffMarkupType,
          airlineName,
        );
        let netfare =
          itinerary?.pricingInformation?.[0]?.fare?.totalFare?.totalPrice;
        // Fetch airline logo and details
        const airlineData = airlineLogoMap[marketingCarrier] || {
          arCode: marketingCarrier,
          logo: "default_logo_url",
          arAbbreviation: "AA",
        };

        return {
          api: "sabre",
          flights,
          arCode: code,
          logo: logo,
          operatingCode,
          operatingLogo,
          refundable: adultIsRefundable,
          meal: meal,
          abbreviation: logo.abbreviation,
          totalFare: basePrice,
          baseFare: baseFare,
          netfare,
          extra: {
            adult: {
              count: adults ? adults.passengerInfo.passengerNumber : 0,
              Price: adults
                ? adults.passengerInfo.passengerTotalFare.totalFare
                : 0,
              isRefundable: adultIsRefundable,
              meal: adultMealInfo.length
                ? adultMealInfo
                : ["No meal info available"],
              cabin: adultCabin,
              totalSeat: adultTotalSeatsAvailable,
              baggage: adultBaggage,
            },
            child: {
              count: children ? children.passengerInfo.passengerNumber : 0,
              Price: children
                ? children.passengerInfo.passengerTotalFare.totalFare
                : null,
              isRefundable: children ? childIsRefundable : null,
              meal: children
                ? childMealInfo.length
                  ? childMealInfo
                  : ["No meal info available"]
                : null,
              cabin: children ? childCabin : null,
              totalSeat: children ? childTotalSeatsAvailable : null,
              baggage: children ? childBaggage : null,
            },
            infants: {
              count: infants ? infants.passengerInfo.passengerNumber : null,
              Price: infants
                ? infants.passengerInfo.passengerTotalFare.totalFare
                : null,
              isRefundable: infants ? infantIsRefundable : null,
              meal: infants
                ? infantMealInfo.length
                  ? infantMealInfo
                  : ["No meal info available"]
                : null,
              cabin: infants ? infantCabin : null,
              totalSeat: infants ? infantTotalSeatsAvailable : null,
              baggage: infants ? infantBaggage : null,
            },
          },
          departure: flights.map((itinerary) => ({
            ...itinerary.departure,
            cabin: adultCabin,
            bookingCode: adultBookingCode,
            totalFare: basePrice,
            count: totalCount,
            adjustedPrice: basePrice,
          })),

          itineraries: flights.map((itinerary) => {
            return {
              departure: itinerary,
              cabin: adultCabin,
              bookingCode: adultBookingCode,
              totalFare: basePrice,
              count: totalCount,
              adjustedPrice: basePrice,
              meal: meal,
            };
          }),
          passengerTotalFare: adjustedPrice,
          taxSummaries:
            groupedItineraryResponse.taxSummaryDescs?.map((tax) => ({
              amount: tax?.amount || 0,
              description: tax?.description || "N/A",
            })) || [],
        };
      });

      return successResponse(res, "Flight data fetched successfully", {
        ticket: processedItineraries,
        flightData,
      });
    }

    //////////////////////////////////////////////////////////////////
    // return errorResponse(res, flightData, 404);
    const legsDesc = flightData.groupedItineraryResponse.legDescs;
    const scheduleDescs =
      flightData.groupedItineraryResponse.scheduleDescs ?? [];
    const itineraries =
      flightData.groupedItineraryResponse.itineraryGroups[0].itineraries ?? [];
    const taxDescriptions =
      flightData.groupedItineraryResponse.taxSummaryDescs ?? [];
    const groupDescription =
      flightData.groupedItineraryResponse.itineraryGroups[0].groupDescription
        .legDescriptions ?? [];
    const fareComponentDescs =
      flightData?.groupedItineraryResponse.fareComponentDescs;
    const brandFeatureDescs =
      flightData?.groupedItineraryResponse.brandFeatureDescs;
    const baggageAllowanceDesc =
      flightData?.groupedItineraryResponse.baggageAllowanceDescs;
    const processedItineraries = itineraries.map((itinerary) => {
      const uniqueId = v4();
      const departureLeg = legsDesc.find(
        (leg) => leg.id === itinerary.legs[0].ref,
      );
      const returnLeg =
        itinerary.legs.length > 1
          ? legsDesc.find((leg) => leg.id === itinerary.legs[1].ref)
          : null;
      const pricingInfo = itinerary?.pricingInformation?.[0]?.fare;
      const refundable =
        itinerary?.pricingInformation?.[0]?.fare.passengerInfoList[0]
          .passengerInfo.nonRefundable;
      const meal =
        itinerary?.pricingInformation?.[0]?.fare?.passengerInfoList?.[0]
          ?.passengerInfo?.fareComponents?.[0]?.segments?.[0]?.segment
          ?.mealCode;
      console.log("meal", meal);
      const brandedFare = itinerary?.pricingInformation
        ?.map((data) => {
          if (!data.fare) return null;

          return data.fare.passengerInfoList.map((passengerInfo) => {
            const p = passengerInfo.passengerInfo;
            const passengerDetails = passengerInfo.passengerInfo;

            // ---- Brand (brandName + brandCode) ----
            const brandData = getbrandNameInfo(
              p.fareComponents,
              fareComponentDescs,
            );

            const brandFare = brandData?.[0]
              ? {
                brandName: brandData[0].brandName,
                brandCode: brandData[0].brandCode,
                fareBasisCode: brandData[0].fareBasisCode,
                programSystemCode: brandData[0].programSystemCode,
              }
              : {
                brandName: null,
                brandCode: null,
                fareBasisCode: null,
                programSystemCode: null,
              };

            // ---- Booking Code ----
            const bookingCode =
              p.fareComponents?.[0]?.segments?.[0]?.segment?.bookingCode ||
              null;

            // ---- Seats Availability ----
            const seatsAvailable =
              p.fareComponents?.[0]?.segments?.[0]?.segment?.seatsAvailable ||
              null;

            // ---- Fare ----
            const fare = p.passengerTotalFare?.totalFare || null;
            const brandInfo = passengerDetails.fareComponents.map(
              (component) => {
                // Find the matching fareComponentDesc using the "ref"
                const matchedDesc = fareComponentDescs.find(
                  (desc) => desc.id === component.ref,
                );

                console.log("🔍 fareComponent.ref:", component.ref);
                console.log("🔍 matched fareComponentDesc:", matchedDesc);

                return matchedDesc ? matchedDesc.fareBasisCode : null;
              },
            );
            return {
              brandFare, // { brandName, brandCode }
              brandInfo,
              // bookingCode, // e.g. "Y"
              // seatsAvailable, // e.g. 3
              // passengerType: p.passengerType, // ADT / CHD / INF
              // fare, // passenger fare
            };
          });
        })
        .flat()
        .filter(Boolean);

      const adults = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "ADT",
      );
      const children = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "CNN",
      );
      const infants = pricingInfo?.passengerInfoList.find(
        (p) => p.passengerInfo.passengerType === "INF",
      );

      let adultTotalSeatsAvailable = 0;
      let adultMealInfo = [];
      let adultIsRefundable = true;
      let adultCabin = [];
      let adultBookingCode = [];
      let adultBaggage = transformBaggageInfo(
        getBaggageInfo(
          adults.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        ),
      );

      // Check if passenger information has refundable status
      adultIsRefundable = !adults?.passengerInfo.nonRefundable;

      // Extract segment details from fareComponents
      adults?.passengerInfo.fareComponents.forEach((fareComponent) => {
        fareComponent.segments.forEach((segmentData) => {
          const segment = segmentData.segment;
          adultTotalSeatsAvailable += segment?.seatsAvailable || 0;
          // Collect meal codes if available
          if (segment?.mealCode) {
            adultMealInfo.push(segment.mealCode);
          }
          if (segment.cabinCode) adultCabin.push(segment.cabinCode);
          if (segment.bookingCode) adultBookingCode.push(segment.bookingCode);
        });
      });
      adults.passengerInfo.passengerInfo;
      ////////////////////////////////////////////////////////////////////////////////////////////////////
      let childTotalSeatsAvailable = 0;
      let childMealInfo = [];
      let childIsRefundable = true;
      let childCabin = [];
      let childBaggage;

      if (children) {
        childBaggage = getBaggageInfo(
          children.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        );
        // Check if passenger information has refundable status
        childIsRefundable = !adults?.passengerInfo.nonRefundable;

        // Extract segment details from fareComponents
        children?.passengerInfo.fareComponents.forEach((fareComponent) => {
          fareComponent.segments.forEach((segmentData) => {
            const segment = segmentData.segment;
            childTotalSeatsAvailable += segment?.seatsAvailable || 0;

            // Collect meal codes if available
            if (segment?.mealCode) {
              childMealInfo.push(segment.mealCode);
            }
            if (segment.cabinCode)
              childCabin.push(
                cabinTypeMap[segment.cabinCode] || segment.cabinCode,
              ); // Map cabin code to full name
          });
        });
      }
      let infantTotalSeatsAvailable = 0;
      let infantMealInfo = [];
      let infantIsRefundable = true;
      let infantCabin = [];
      let infantBaggage;
      if (infants) {
        infantBaggage = getBaggageInfo(
          infants.passengerInfo.baggageInformation,
          baggageAllowanceDesc,
        );
        // Check if passenger information has refundable status
        infantIsRefundable = !adults?.passengerInfo.nonRefundable;

        // Extract segment details from fareComponents
        infants?.passengerInfo.fareComponents.forEach((fareComponent) => {
          fareComponent.segments.forEach((segmentData) => {
            const segment = segmentData.segment;
            infantTotalSeatsAvailable += segment?.seatsAvailable || 0;

            // Collect meal codes if available
            if (segment?.mealCode) {
              infantMealInfo.push(segment.mealCode);
            }
            if (segment.cabinCode)
              infantCabin.push(
                cabinTypeMap[segment.cabinCode] || segment.cabinCode,
              ); // Map cabin code to full name
          });
        });
      }

      const departureFlightDetails = departureLeg.schedules.map((schedule) => {
        return scheduleDescs.find((desc) => desc.id === schedule.ref);
      });
      const returnFlightDetails = returnLeg
        ? returnLeg.schedules.map((schedule) => {
          return scheduleDescs.find((desc) => desc.id === schedule.ref);
        })
        : null;
      let marketingCarrier;
      let operatingCarrier;

      departureFlightDetails.map((detail) => {
        marketingCarrier = detail.carrier.marketing;
        operatingCarrier = detail.carrier.operating;
      });

      const airlineData = airlineLogoMap[marketingCarrier] || {
        arCode: marketingCarrier,
        logo: "default_logo_url",
        arAbbreviation: "AA",
      };
      const operatingairlineData = airlineLogoMap[operatingCarrier] || {
        arCode: operatingCarrier,
        logo: "default_logo_url",
        arAbbreviation: "AA",
      };
      let carrierCode;
      let previousArrivalTime = null;

      const departure = departureFlightDetails.map((detail, index) => {
        carrierCode = detail.carrier.marketing; // Correctly declare carrierCode

        // Calculate departure time first
        const departureTimeStr = convertToISODateTimeWithRollOverf(
          detail.departure.time,
          groupDescription[0]?.departureDate,
          previousArrivalTime,
        );
        const departureTime = new Date(departureTimeStr);

        // Calculate arrival time based on departure time
        // If arrival time is earlier than departure time, it's next day
        const arrivalTimeStr = convertToISODateTimeWithRollOverf(
          detail.arrival.time,
          groupDescription[0]?.departureDate,
          departureTime,
        );
        const arrivalTime = new Date(arrivalTimeStr);

        let layoverTime = null;
        if (index > 0 && previousArrivalTime) {
          layoverTime = calculateLayoverTime(
            previousArrivalTime,
            departureTime,
          );
        }

        previousArrivalTime = arrivalTime; // Store for next iteration
        return {
          marketingCarrier: detail.carrier.marketing,
          operatingCarrier,
          departureTime: departureTimeStr,
          arrivalTime: arrivalTimeStr,
          departureLocation: detail.departure.airport,
          arrivalLocation: detail.arrival.airport,
          marketingFlightNumber: detail.carrier.marketingFlightNumber,
          operating: detail.carrier.operating,
          operatingFlightNumber: detail.carrier.operatingFlightNumber,
          marketing: detail.carrier.marketing,
          elapsedTime: convertMinutesToISODuration(detail.elapsedTime),
          stopCount: detail.stopCount,
          layoverTime,
          logo: airlineLogoMap[detail.carrier.marketing],
          operatingLogo: airlineLogoMap[detail.carrier.operating],
        };
      });

      let previousReturnArrivalTime = null;
      const returnFlight = returnFlightDetails
        ? returnFlightDetails.map((detail, index) => {
          carrierCode = detail.carrier.marketing; // Correctly declare carrierCode

          // Calculate departure time first
          const departureTimeStr = convertToISODateTimeWithRollOverf(
            detail.departure.time,
            groupDescription[1].departureDate,
            previousReturnArrivalTime,
          );
          const departureTime = new Date(departureTimeStr);

          // Calculate arrival time based on departure time
          // If arrival time is earlier than departure time, it's next day
          const arrivalTimeStr = convertToISODateTimeWithRollOverf(
            detail.arrival.time,
            groupDescription[1].departureDate,
            departureTime,
          );
          const arrivalTime = new Date(arrivalTimeStr);

          let layoverTime = null;
          if (index > 0 && previousReturnArrivalTime) {
            layoverTime = calculateLayoverTime(
              previousReturnArrivalTime,
              departureTime,
            );
          }

          previousReturnArrivalTime = arrivalTime; // Store for next iteration
          return {
            departureTime: departureTimeStr,
            arrivalTime: arrivalTimeStr,
            marketingCarrier: detail.carrier.marketing,
            departureLocation: detail.departure.airport,
            arrivalLocation: detail.arrival.airport,
            marketingFlightNumber: detail.carrier.marketingFlightNumber,
            marketing: detail.carrier.marketing,
            operating: detail.carrier.operating,
            operatingFlightNumber: detail.carrier.operatingFlightNumber,
            elapsedTime: convertMinutesToISODuration(detail.elapsedTime),
            stopCount: detail.stopCount,
            layoverTime,
            logo: airlineLogoMap[detail.carrier.marketing],
            operatingLogo: airlineLogoMap[detail.carrier.operating],
          };
        })
        : null;

      const adjustedPrice = calculateAdjustedPrice(
        pricingInfo.totalFare.totalPrice,
        findMakrup,
        staffMarkupValue,
        staffMarkupType,
        carrierCode,
      );
      netFare = pricingInfo.totalFare.totalPrice;
      const ticketTaxes = pricingInfo.passengerInfoList
        .flatMap((p) => p.passengerInfo.taxes)
        .map((tax) => {
          const taxDetail = taxDescriptions.find(
            (desc) => desc?.id === tax?.ref,
          );
          return {
            amount: taxDetail ? taxDetail.amount : 0,
            code: taxDetail ? taxDetail.code : "N/A",
            description: taxDetail ? taxDetail.description : "N/A",
            currency: taxDetail ? taxDetail.currency : "N/A",
            publishedAmount: taxDetail ? taxDetail.publishedAmount : "N/A",
            publishedCurrency: taxDetail ? taxDetail.publishedCurrency : "N/A",
            station: taxDetail ? taxDetail.station : "N/A",
            country: taxDetail ? taxDetail.country : "N/A",
          };
        });
      return {
        api: "sabre",
        uuid: uniqueId,
        // arCode: airlineData.ar,
        // logo: airlineData.logo,
        brandedFare,
        arCode: airlineData.ar,
        logo: airlineData.logo,
        arAbbreviation: airlineData.arCode,

        operatingLogo: operatingairlineData.logo,
        operatingArAbbreviation: operatingairlineData.arCode,
        operatingarCode: operatingairlineData.ar,
        departure,
        refundable: refundable,
        meal: meal,
        return: returnFlight,
        totalFare: pricingInfo.totalFare.totalPrice,
        passengerTotalFare: adjustedPrice,
        netFare,
        baseFare: pricingInfo.totalFare.equivalentAmount,
        totalTax: pricingInfo.totalFare.totalTaxAmount,
        taxSummaries: ticketTaxes,

        extra: {
          adult: {
            count: adults ? adults.passengerInfo.passengerNumber : 0,
            Price: adults
              ? adults.passengerInfo.passengerTotalFare.totalFare
              : 0,
            isRefundable: adultIsRefundable,
            meal: adultMealInfo.length
              ? adultMealInfo
              : ["No meal info available"],
            cabin: adultCabin,
            totalSeat: adultTotalSeatsAvailable,
            baggage: adultBaggage,
          },
          child: {
            count: children ? children.passengerInfo.passengerNumber : 0,
            Price: children
              ? children.passengerInfo.passengerTotalFare.totalFare
              : null,
            isRefundable: children ? childIsRefundable : null,
            meal: children
              ? childMealInfo.length
                ? childMealInfo
                : ["No meal info available"]
              : null,
            cabin: children ? childCabin : null,
            totalSeat: children ? childTotalSeatsAvailable : null,
            baggage: children ? childBaggage : null,
          },
          infants: {
            count: infants ? infants.passengerInfo.passengerNumber : null,
            Price: infants
              ? infants.passengerInfo.passengerTotalFare.totalFare
              : null,
            isRefundable: infants ? infantIsRefundable : null,
            meal: infants
              ? infantMealInfo.length
                ? infantMealInfo
                : ["No meal info available"]
              : null,
            cabin: infants ? infantCabin : null,
            totalSeat: infants ? infantTotalSeatsAvailable : null,
            baggage: infants ? infantBaggage : null,
          },
        },

        itineraries: [
          {
            departure: departure,
            cabin: adultCabin,
            refundable: refundable,
            meal: meal,
            bookingCode: adultBookingCode,
            return: returnFlight,
            totalFare: pricingInfo.totalFare.totalPrice,
            adjustedPrice,
            totalTax: pricingInfo.totalFare.totalTaxAmount,
          },
        ],
      };
    });

    return successResponse(res, "Flight data fetched successfully", {
      ticket: processedItineraries,
      body: body,
      flightData,
    });
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return errorResponse(res, error);
  }
}

async function postSabreCityData(req, res) {
  const { city } = req.query;
  await ensureToken(); // Ensure token is valid
  try {
    const response = await fetch(
      `${SABRE.BASE_URL}/v2/geo/autocomplete?query=${city}&category=AIR&limit=10&clientId=704295`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error("ERROR", data);
    }
    const data = await response.json();
    const formattedData = data.grouped["category:AIR"].doclist.docs;

    return successResponse(
      res,
      "City data fetched successfully",
      formattedData,
    );
  } catch (error) {
    console.log(error);
    return errorResponse(res, error);
  }
}

async function createBooking(req, res) {
  try {
    await ensureToken();
    let infant_firstName, infant_lastname, infant_DOB, child_DOB, child_index;

    const { data } = req.body;

    // Extract key data
    const flightOffers = data.flightOffers;
    const travelers = data.travelers;
    let count = 0;
    data.travelers.map((data) => {
      if (data.travelerType !== "INFANT") {
        count = count + 1;
      }
    });
    const contact = data.travelers[0].contact;
    let nada = [];
    let returnFlight = [];
    console.log("flightOffers", flightOffers);
    flightOffers.forEach((offer, index) => {
      if (offer.return) {
        offer.return.forEach((segment, segmentIndex) => {
          const arr1 = {
            DepartureDateTime: segment.departureTime.split(/[.+]/)[0],
            ArrivalDateTime: segment.arrivalTime.split(/[.+]/)[0],
            FlightNumber: String(segment.marketingFlightNumber),
            NumberInParty: count.toString(),
            // ResBookDesigCode: "Y",

            ResBookDesigCode: offer.bookingCode[0],
            // FareBrandName: "NSEMIFLEXB",
            MarriageGrp: "O",
            Status: "NN",
            DestinationLocation: {
              LocationCode: segment.arrivalLocation,
            },
            MarketingAirline: {
              Code: segment.marketingCarrier,
              FlightNumber: String(segment.marketingFlightNumber),
            },
            OriginLocation: {
              LocationCode: segment.departureLocation,
            },
          };

          returnFlight.push(arr1);
        });
      }
    });
    flightOffers.forEach((offer, index) => {
      offer.departure.forEach((segment, segmentIndex) => {
        const arr1 = {
          DepartureDateTime: segment.departureTime.split(/[.+]/)[0],
          ArrivalDateTime: segment.arrivalTime.split(/[.+]/)[0],
          FlightNumber: String(segment.marketingFlightNumber),
          NumberInParty: count.toString(),
          // ResBookDesigCode: "Y",
          // FareBrandName: "NSEMIFLEXB",

          ResBookDesigCode: offer.bookingCode[0],
          Status: "NN",
          DestinationLocation: {
            LocationCode: segment.arrivalLocation,
          },
          MarketingAirline: {
            Code: segment.marketingCarrier,
            FlightNumber: String(segment.marketingFlightNumber),
          },
          OriginLocation: {
            LocationCode: segment.departureLocation,
          },
        };

        nada.push(arr1);
      });
    });
    // Fetch agency and markup details
    const agency = await Agency.findById(req.user.agencyId);
    const findMarkup = await Markup.findOne({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });
    const markupType = findMarkup?.markupType || "none";

    // Booking price calculations
    const price = flightOffers[0]?.totalFare || 0;

    let adjustedPrice = flightOffers[0]?.adjustedPrice || price;
    if (findMarkup?.airlines?.includes(flightOffers[0]?.marketing)) {
      adjustedPrice =
        markupType === "percentage"
          ? adjustedPrice + (adjustedPrice * findMarkup.markupValue) / 100
          : adjustedPrice + findMarkup.markupValue;
    }

    // Prepare passenger details
    const passengerNames = travelers.map((passenger, index) => {
      infant_firstName =
        getGenderCode(passenger.travelerType) === "INF"
          ? passenger.name.firstName.replace(" Mstr", "")
          : null;

      infant_lastname =
        getGenderCode(passenger.travelerType) === "INF"
          ? passenger.name.lastName
          : null;
      {
        passenger.travelerType === "INFANT"
          ? (infant_DOB = formatDate(passenger.dateOfBirth))
          : null;
      }
      {
        passenger.travelerType === "CHILD"
          ? (child_DOB = formatDate(passenger.dateOfBirth))
          : null;
      }
      {
        passenger.travelerType === "CHILD"
          ? (child_index = `${index + 1}.1`)
          : null;
      }
      return {
        NameNumber: `${index + 1}.1`,
        GivenName:
          getGenderCode(passenger.travelerType) === "INF"
            ? "INF"
            : passenger.name.firstName?.toUpperCase(),

        Surname: passenger.name.lastName?.toUpperCase(),
        // NameReference: `${passenger.name.firstName}${[index + 1]}`,
        PassengerType: getGenderCode(passenger.travelerType),
        NameReference:
          // getGenderCode(passenger.travelerType) === "CNN"
          //   ? `C${calculateAgeInYears(passenger.dateOfBirth)}`
          //   : getGenderCode(passenger.travelerType) === "INF"
          //     ? `I${calculateAgeInMonths(passenger.dateOfBirth)}`
          //     : `A${calculateAgeInYears(passenger.dateOfBirth)}`
          "",
        // Gender: passenger.gender || "M",
        Infant: getGenderCode(passenger.travelerType) === "INF" ? true : false,
      };
    });

    const specialReqDetails = {
      SpecialService: {
        SpecialServiceInfo: {
          SecureFlight: travelers.map((passenger, index) => ({
            SegmentNumber: "A",
            PersonName: {
              NameNumber:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "1.1"
                  : `${index + 1}.1`,
              GivenName:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "INF"
                  : passenger.name.firstName?.toUpperCase(),
              DateOfBirth: passenger.dateOfBirth,
              Surname: passenger.name.lastName?.toUpperCase(),
              // NameReference: `${passenger.name.firstName}${[index + 1]}`,
              Gender:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "FI"
                  : passenger.gender?.charAt(0)?.toUpperCase(),
            },
          })),
          Service: [
            // {
            //   SSR_Code: "OTHS",
            //   Text: "CC Nada MANZOOR",
            //   PersonName: {
            //     NameNumber: "1.1",
            //   },
            //   SegmentNumber: "1",
            // },

            ...(infant_firstName
              ? [
                {
                  SSR_Code: "INFT",
                  Text: `${infant_lastname}/${infant_firstName}/${infant_DOB}`,
                  PersonName: {
                    NameNumber: "1.1",
                  },
                },
              ]
              : []),
            ...(child_DOB
              ? [
                {
                  SSR_Code: "CHLD",
                  Text: `${child_DOB}`,
                  PersonName: { NameNumber: child_index },
                },
              ]
              : []),
            // {
            //   SSR_Code: "OTHS",
            //   Text: "CC Ali MANZOOR",
            //   PersonName: {
            //     NameNumber: "1.1",
            //   },
            //   SegmentNumber: "1",
            // },
            {
              SSR_Code: "CTCM",
              // Text: `${contact.phones?.[0].number}`,
              Text: `3003790375`,
              PersonName: {
                NameNumber: "1.1",
              },
            },

            {
              SSR_Code: "CTCE",
              Text: `${data.emailAddress}`,
              PersonName: {
                NameNumber: "1.1",
              },
            },
          ],
          AdvancePassenger: travelers.map((passenger, index) => ({
            Document: {
              IssueCountry: passenger.documents?.[0]?.issuanceCountry,
              NationalityCountry: passenger.documents?.[0]?.nationality,
              ExpirationDate: passenger.documents?.[0]?.expiryDate,
              Number: passenger.documents?.[0]?.number,
              Type: passenger.documents?.[0]?.documentType,
            },
            PersonName: {
              NameNumber: `${index + 1}.1`,
              GivenName:
                getGenderCode(passenger.travelerType) === "INF"
                  ? passenger.name.firstName.replace("Mstr", "INF")
                  : passenger.name.firstName?.toUpperCase(),
              Surname: passenger.name.lastName?.toUpperCase(),
              LapChild:
                getGenderCode(passenger.travelerType) === "INF" ? true : false,
              Gender:
                getGenderCode(passenger.travelerType) === "INF"
                  ? `${passenger.gender?.charAt(0)?.toUpperCase()}I`
                  : passenger.gender?.charAt(0)?.toUpperCase(),
              DateOfBirth: passenger.dateOfBirth,
            },
            SegmentNumber: "A",
          })),
        },
      },
      // AddRemark: {
      //   RemarkInfo: {
      //     FOP_Remark: [
      //       {
      //         Type: "CASH",
      //       },
      //     ],
      //   },
      // },
    };
    // Booking request payload
    const bookingRequest = {
      CreatePassengerNameRecordRQ: {
        version: "2.4.0",
        targetCity: `${SABRE.SABRE_PCC}`,
        haltOnAirPriceError: true,
        haltOnInvalidMCT: true,
        TravelItineraryAddInfo: {
          AgencyInfo: {
            Ticketing: { TicketType: "7TAW" },
            Address: {
              AddressLine: agency.address,
              CityName: agency.city,
              PostalCode: agency.poBoxNumber,
              VendorPrefs: {
                Airline: {
                  Hosted: true,
                },
              },
            },
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber: [
                {
                  NameNumber: "1.1",
                  Phone: agency.phoneNumber,
                  PhoneUseType: "A",
                },
              ],
            },
            PersonName: passengerNames,
            Email: [
              {
                Address: data.emailAddress,
                NameNumber: "1.1",
              },
            ],
          },
        },
        SpecialReqDetails: specialReqDetails,
        AirBook: {
          HaltOnStatus: [
            { Code: "HL" },
            { Code: "HN" },
            { Code: "HX" },
            { Code: "LL" },
            { Code: "NN" },
            { Code: "NO" },
            { Code: "PN" },
            { Code: "UC" },
            { Code: "UN" },
            { Code: "US" },
            { Code: "UU" },
          ],
          RetryRebook: {
            Option: true,
          },
          OriginDestinationInformation: {
            FlightSegment: [...nada, ...returnFlight],
          },
          RedisplayReservation: {
            NumAttempts: 10,
            WaitInterval: 500,
          },
        },
        AirPrice: [
          {
            PriceRequestInformation: {
              Retain: true,
              OptionalQualifiers: {
                FOP_Qualifiers: {
                  BasicFOP: {
                    Type: "CA",
                  },
                },
                PricingQualifiers: {
                  PassengerType: travelers.map((data) => ({
                    Code: getGenderCode(data.travelerType),
                    Quantity: "1",
                  })),

                  SpecificPenalty: {
                    EitherOr: {
                      Any: true,
                    },
                  },
                },
              },
            },
          },
        ],
        PostProcessing: {
          ARUNK: {
            keepSegments: true,
            priorPricing: true,
          },

          EndTransaction: {
            Source: { ReceivedFrom: agency.agencyName || "API" },
            // Email: {
            //   Ind: true,
            // },
            // Email: {
            //   Itinerary: {
            //     PDF: {
            //       Ind: true,
            //     },
            //     Ind: true,
            //   },
            //   PersonName: {
            //     NameNumber: "1.1",
            //   },
            //   Ind: true,
            // },
          },
          RedisplayReservation: {
            waitInterval: 1000,
          },
          PostBookingHKValidation: {
            waitInterval: 200,
            numAttempts: 4,
          },
          PricingInterval: {
            waitInterval: 100,
          },
          WaitForAirlineRecLoc: {
            waitInterval: 200,
            numAttempts: 4,
          },
        },
      },
    };

    // return errorResponse(res, bookingRequest, 404);

    // Send booking request to Sabre API
    const response = await fetch(
      `${SABRE.BASE_URL}/v2.4.0/passenger/records?mode=create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      },
    );
    const bookingData = await response.json();
    // return errorResponse(res, bookingData, 404);
    const segment =
      bookingData?.CreatePassengerNameRecordRS?.AirBook?.OriginDestinationOption
        ?.FlightSegment?.[0];
    // if (segment?.Status === "NN") {
    //  return errorResponse(res,`Flight ${segment.MarketingAirline.Code}${segment.FlightNumber} not confirmed. Please select another flight.`,404);
    // }
    if (
      !response.ok ||
      bookingData.CreatePassengerNameRecordRS.ApplicationResults.status !==
      "Complete"
    ) {
      return errorResponse(res, bookingData, 404);
      return errorResponse(res, bookingRequest, 404);
    }

    const bookingId = bookingData.CreatePassengerNameRecordRS.ItineraryRef.ID;
    console.log("booking id", bookingId);

    let saveTraveller;
    try {
      console.log("traveller", data);

      for (const traveller of data.travelers) {
        console.log("traveller", traveller);
        const fullName = traveller.name.firstName.trim().split(" ");
        let title = null;
        let firstName = traveller.name.firstName;

        // Check if last part looks like a title
        if (fullName.length > 1) {
          title = fullName[fullName.length - 1]; // assume last word is title
          firstName = fullName.slice(0, -1).join(" "); // remaining is first name
        }
        const code = (
          await getCode(traveller.name.firstName, traveller.name.lastName)
        ).toUpperCase();
        console.log("code", code);
        if (traveller.dateOfBirth)
          traveller.dateOfBirth = new Date(traveller.dateOfBirth)
            .toISOString()
            .split("T")[0];
        if (traveller.documents[0].expiryDate)
          traveller.documents[0].expiryDate = new Date(
            traveller.documents[0].expiryDate,
          )
            .toISOString()
            .split("T")[0];

        const query = {
          firstname: firstName,
          lastname: traveller.name.lastName,
          $or: [],
        };

        const document = traveller.documents?.[0];
        if (document?.documentType === "I") {
          query.$or.push({ cnic: document.number });
        }
        if (document?.documentType === "P") {
          query.$or.push({ passportNumber: document.number });
        }
        console.log("query", query);

        const existingTraveller = await Pax.findOne(query);
        console.log("existingTraveller", existingTraveller);

        if (!existingTraveller) {
          const pax = new Pax({
            code: code,
            firstname: firstName,
            title,
            lastname: traveller.name.lastName,
            cnic:
              traveller.documents?.[0].documentType === "I"
                ? traveller.documents?.[0].number
                : null,
            cnicExpiry:
              traveller.documents?.[0].documentType === "I"
                ? traveller.documents?.[0].expiryDate
                : null,
            passportNumber:
              traveller.documents?.[0].documentType === "P"
                ? traveller.documents?.[0].number
                : null,
            passportExpiry:
              traveller.documents?.[0].documentType === "P"
                ? traveller.documents?.[0].expiryDate
                : null,
            paxType: traveller.travelerType,
            dob: traveller.dateOfBirth,
            nationality: traveller.documents?.[0].nationality,
          });

          saveTraveller = await pax.save();
          console.log(
            `Traveller saved: ${traveller.name.firstName} ${traveller.name.lastName}`,
          );
        } else {
          console.log(
            `Traveller already exists: ${traveller.name.firstName} ${traveller.name.lastName}`,
          );
        }
      }
    } catch (error) {
      console.log("Error saving travellers:", error);
    }
    let flightType = returnFlight.length > 0 ? "round-trip" : "one-way";
    const flightInfo =
      bookingData.CreatePassengerNameRecordRS.TravelItineraryRead
        .TravelItinerary.ItineraryInfo.ReservationItems.Item;
    // console.log("flightInfo id", nada);
    // console.log("return id", returnFlight);
    const nadaLength = nada?.length || 0;
    const newBooking = new Booking({
      type: "flight",
      api: "Sabre",
      flightType,
      userId: req.user._id,
      id: bookingId,
      departure: nada, // full array of departure objects
      return: returnFlight, // full array of return objects
      status: ETicketStatus.HOLD,
      agencyId: req.user.agencyId || null,
      createdBy: req.user.role || null,
      orignalPrice: price,
      totalTax: flightOffers[0]?.totalTax,
      finalPrice: adjustedPrice,
      markupType: markupType,
      markupAmount: findMarkup ? findMarkup.markupValue : 0,
      deptTime: flightOffers[0]?.departureTime || "",
      arrivalTime: flightOffers[0]?.arrivalTime || "",
      travelers: travelers.map((passenger, index) => ({
        id: `${index + 1}.1`,
        dateOfBirth: passenger.dateOfBirth,
        gender: passenger.gender,
        name: passenger.name,

        documents: [
          {
            number: passenger.documents?.[index]?.number || "",
            issuanceCountry:
              passenger.documents?.[index]?.issuanceLocation || "",
            nationality: passenger.documents?.[index]?.nationality || "",
            expiryDate: passenger.documents?.[index]?.expiryDate || "",
            issuanceDate: passenger.documents?.[index]?.issuanceDate,
            birthPlace: passenger.documents?.[index]?.birthPlace,
            documentType: "P",
          },
        ],
        contact: {
          phones: [
            { number: contact?.phones[0]?.number, deviceType: "MOBILE" },
          ],
          email: agency?.agencyEmail,
        },
      })),
      departure: nada, // full array of departure objects
      return: returnFlight, // full array of return objects
      flightOffers: [
        {
          itineraries: flightInfo.map((data, index) => {
            const nadaIndex = nadaLength > 0 ? index % nadaLength : null;

            const segments = data.FlightSegment.map((val) => ({
              departure: {
                iataCode: val.OriginLocation.LocationCode,
                at: val.DepartureDateTime,
              },
              arrival: {
                iataCode: val.DestinationLocation.LocationCode,
                at:
                  nadaIndex !== null ? nada[nadaIndex]?.ArrivalDateTime : null,
                terminal: val.DestinationLocation.Terminal,
              },
              number: val.FlightNumber,
              AirMilesFlown: val.AirMilesFlown,
              SmokingAllowed: val.SmokingAllowed,
              duration: val.ElapsedTime,
              meals: flightOffers[index]?.meal
                ? MEAL_CODES.includes(
                  flightOffers[index]?.meal.trim().toUpperCase(),
                )
                : false,
              className: val.Cabin.Name,
              classCode: val.Cabin.Code,
              carrierCode: val.MarketingAirline.Code,
              boeing: val.Equipment.AirEquipType,
              numberOfStops: val.StopQuantity,

              operating: {
                carrierCode: val.OperatingAirline[0]?.Code || null,
                Banner: val.OperatingAirline[0]?.Banner || null,
                FlightNumber: val.OperatingAirline[0]?.FlightNumber || null,
              },

              marketing: {
                carrierCode: val.MarketingAirline.Code,
                Banner: val.MarketingAirline.Banner,
                FlightNumber: val.MarketingAirline.FlightNumber,
              },
            }));

            return {
              duration: data.FlightSegment?.[0]?.ElapsedTime || "",
              segments,
            };
          }),
        },
      ],
      contacts: [
        {
          addresseeName: { firstName: contact?.firstName || "N/A" },
          phones: contact?.phones || [],
        },
      ],
    });

    await newBooking.save();

    // Update agency cash limit
    // await Agency.findByIdAndUpdate(
    //   agency._id,
    //   { $inc: { cashLimit: -adjustedPrice } },
    //   { new: true, runValidators: true }
    // );

    return successResponse(res, "traveller saved successfully", bookingData);
  } catch (error) {
    console.error("Error in createBooking:", error);
    return errorResponse(res, error);
  }
}

async function createBookingg(Nada, user, res) {
  try {
    await ensureToken();
    let infant_firstName, infant_lastname, infant_DOB, child_DOB, child_index;

    const { data } = Nada;
    // if (
    //   !data ||
    //   !Array.isArray(data.flightOffers) ||
    //   data.flightOffers.length === 0
    // ) {
    //   return errorResponse(
    //     res,
    //     "Invalid or missing flight offers in the request.",
    //     400
    //   );
    // }

    // if (!Array.isArray(data.travelers) || data.travelers.length === 0) {
    //   return errorResponse(
    //     res,
    //     "Invalid or missing travelers in the request.",
    //     400
    //   );
    // }

    // Extract key data
    const flightOffers = data.flightOffers;
    const travelers = data.travelers;
    let count = 0;
    data.travelers.map((data) => {
      if (data.travelerType !== "INFANT") {
        count = count + 1;
      }
    });
    const contact = data.travelers[0].contact;
    let nada = [];
    let returnFlight = [];
    flightOffers.forEach((offer, index) => {
      if (offer.return) {
        offer.return.forEach((segment, segmentIndex) => {
          const arr1 = {
            DepartureDateTime: segment.departureTime.split(/[.+]/)[0],
            ArrivalDateTime: segment.arrivalTime.split(/[.+]/)[0],
            FlightNumber: String(segment.marketingFlightNumber),
            NumberInParty: count.toString(),
            // ResBookDesigCode: "Y",

            ResBookDesigCode: offer.bookingCode[0],
            MarriageGrp: "O",
            Status: "NN",
            DestinationLocation: {
              LocationCode: segment.arrivalLocation,
            },
            MarketingAirline: {
              Code: segment.marketingCarrier,
              FlightNumber: String(segment.marketingFlightNumber),
            },
            OriginLocation: {
              LocationCode: segment.departureLocation,
            },
          };

          returnFlight.push(arr1);
        });
      }
    });
    flightOffers.forEach((offer, index) => {
      offer.departure.forEach((segment, segmentIndex) => {
        const arr1 = {
          DepartureDateTime: segment.departureTime.split(/[.+]/)[0],
          ArrivalDateTime: segment.arrivalTime.split(/[.+]/)[0],
          FlightNumber: String(segment.marketingFlightNumber),
          NumberInParty: count.toString(),
          // ResBookDesigCode: "Y",

          ResBookDesigCode: offer.bookingCode[0],
          Status: "NN",
          DestinationLocation: {
            LocationCode: segment.arrivalLocation,
          },
          MarketingAirline: {
            Code: segment.marketingCarrier,
            FlightNumber: String(segment.marketingFlightNumber),
          },
          OriginLocation: {
            LocationCode: segment.departureLocation,
          },
        };

        nada.push(arr1);
      });
    });
    // Fetch agency and markup details
    const agency = await Agency.findById(user.agencyId);
    const findMarkup = await Markup.findOne({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });
    const markupType = findMarkup?.markupType || "none";

    // Booking price calculations
    const price = flightOffers[0]?.totalFare || 0;
    let adjustedPrice = flightOffers[0]?.adjustedPrice || price;
    if (findMarkup?.airlines?.includes(flightOffers[0]?.marketing)) {
      adjustedPrice =
        markupType === "percentage"
          ? adjustedPrice + (adjustedPrice * findMarkup.markupValue) / 100
          : adjustedPrice + findMarkup.markupValue;
    }

    //  if (Number(agency.cashLimit) < adjustedPrice) {
    //     return {
    //       status: 500,
    //       data: "Insufficient balance. Please recharge your account.",
    //     };

    //     return errorResponse(
    //       res,
    //       "Insufficient balance. Please recharge your account.",
    //       404
    //     );
    //   }

    // Prepare passenger details
    const passengerNames = travelers.map((passenger, index) => {
      infant_firstName =
        getGenderCode(passenger.travelerType) === "INF"
          ? passenger.name.firstName.replace(" Mstr", "")
          : null;

      infant_lastname =
        getGenderCode(passenger.travelerType) === "INF"
          ? passenger.name.lastName
          : null;
      {
        passenger.travelerType === "INFANT"
          ? (infant_DOB = formatDate(passenger.dateOfBirth))
          : null;
      }
      {
        passenger.travelerType === "CHILD"
          ? (child_DOB = formatDate(passenger.dateOfBirth))
          : null;
      }
      {
        passenger.travelerType === "CHILD"
          ? (child_index = `${index + 1}.1`)
          : null;
      }
      return {
        NameNumber: `${index + 1}.1`,
        GivenName:
          getGenderCode(passenger.travelerType) === "INF"
            ? "INF"
            : passenger.name.firstName?.toUpperCase(),

        Surname: passenger.name.lastName?.toUpperCase(),
        // NameReference: `${passenger.name.firstName}${[index + 1]}`,
        PassengerType: getGenderCode(passenger.travelerType),
        NameReference:
          // getGenderCode(passenger.travelerType) === "CNN"
          //   ? `C${calculateAgeInYears(passenger.dateOfBirth)}`
          //   : getGenderCode(passenger.travelerType) === "INF"
          //     ? `I${calculateAgeInMonths(passenger.dateOfBirth)}`
          //     : `A${calculateAgeInYears(passenger.dateOfBirth)}`
          "",
        // Gender: passenger.gender || "M",
        Infant: getGenderCode(passenger.travelerType) === "INF" ? true : false,
      };
    });

    const specialReqDetails = {
      SpecialService: {
        SpecialServiceInfo: {
          SecureFlight: travelers.map((passenger, index) => ({
            SegmentNumber: "A",
            PersonName: {
              NameNumber:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "1.1"
                  : `${index + 1}.1`,
              GivenName:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "INF"
                  : passenger.name.firstName?.toUpperCase(),
              DateOfBirth: passenger.dateOfBirth,
              Surname: passenger.name.lastName?.toUpperCase(),
              // NameReference: `${passenger.name.firstName}${[index + 1]}`,
              Gender:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "FI"
                  : passenger.gender?.charAt(0)?.toUpperCase(),
            },
          })),
          Service: [
            // {
            //   SSR_Code: "OTHS",
            //   Text: "CC Nada MANZOOR",
            //   PersonName: {
            //     NameNumber: "1.1",
            //   },
            //   SegmentNumber: "1",
            // },

            ...(infant_firstName
              ? [
                {
                  SSR_Code: "INFT",
                  Text: `${infant_lastname}/${infant_firstName}/${infant_DOB}`,
                  PersonName: {
                    NameNumber: "1.1",
                  },
                },
              ]
              : []),
            ...(child_DOB
              ? [
                {
                  SSR_Code: "CHLD",
                  Text: `${child_DOB}`,
                  PersonName: { NameNumber: child_index },
                },
              ]
              : []),
            // {
            //   SSR_Code: "OTHS",
            //   Text: "CC Ali MANZOOR",
            //   PersonName: {
            //     NameNumber: "1.1",
            //   },
            //   SegmentNumber: "1",
            // },
            {
              SSR_Code: "CTCM",
              // Text: `${contact.phones?.[0].number}`,
              Text: `3003790375`,
              PersonName: {
                NameNumber: "1.1",
              },
            },

            {
              SSR_Code: "CTCE",
              Text: `${data.emailAddress}`,
              PersonName: {
                NameNumber: "1.1",
              },
            },
          ],
          AdvancePassenger: travelers.map((passenger, index) => ({
            Document: {
              IssueCountry: passenger.documents?.[0]?.issuanceCountry,
              NationalityCountry: passenger.documents?.[0]?.nationality,
              ExpirationDate: passenger.documents?.[0]?.expiryDate,
              Number: passenger.documents?.[0]?.number,
              Type: passenger.documents?.[0]?.documentType,
            },
            PersonName: {
              NameNumber: `${index + 1}.1`,
              GivenName:
                getGenderCode(passenger.travelerType) === "INF"
                  ? passenger.name.firstName.replace("Mstr", "INF")
                  : passenger.name.firstName?.toUpperCase(),
              Surname: passenger.name.lastName?.toUpperCase(),
              LapChild:
                getGenderCode(passenger.travelerType) === "INF" ? true : false,
              Gender:
                getGenderCode(passenger.travelerType) === "INF"
                  ? `${passenger.gender?.charAt(0)?.toUpperCase()}I`
                  : passenger.gender?.charAt(0)?.toUpperCase(),
              DateOfBirth: passenger.dateOfBirth,
            },
            SegmentNumber: "A",
          })),
        },
      },
      // AddRemark: {
      //   RemarkInfo: {
      //     FOP_Remark: [
      //       {
      //         Type: "CASH",
      //       },
      //     ],
      //   },
      // },
    };
    // Booking request payload
    const bookingRequest = {
      CreatePassengerNameRecordRQ: {
        version: "2.4.0",
        targetCity: `${SABRE.SABRE_PCC}`,
        haltOnAirPriceError: true,
        haltOnInvalidMCT: true,
        TravelItineraryAddInfo: {
          AgencyInfo: {
            Ticketing: { TicketType: "7TAW" },
            Address: {
              AddressLine: agency.address,
              CityName: agency.city,
              PostalCode: agency.poBoxNumber,
              VendorPrefs: {
                Airline: {
                  Hosted: true,
                },
              },
            },
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber: [
                {
                  NameNumber: "1.1",
                  Phone: agency.phoneNumber,
                  PhoneUseType: "A",
                },
              ],
            },
            PersonName: passengerNames,
            Email: [
              {
                Address: data.emailAddress,
                NameNumber: "1.1",
              },
            ],
          },
        },
        SpecialReqDetails: specialReqDetails,
        AirBook: {
          HaltOnStatus: [
            { Code: "HL" },
            { Code: "HN" },
            { Code: "HX" },
            { Code: "LL" },
            { Code: "NN" },
            { Code: "NO" },
            { Code: "PN" },
            { Code: "UC" },
            { Code: "UN" },
            { Code: "US" },
            { Code: "UU" },
          ],
          RetryRebook: {
            Option: true,
          },
          OriginDestinationInformation: {
            FlightSegment: [...nada, ...returnFlight],
          },
          RedisplayReservation: {
            NumAttempts: 10,
            WaitInterval: 500,
          },
        },
        AirPrice: [
          {
            PriceRequestInformation: {
              Retain: true,
              OptionalQualifiers: {
                FOP_Qualifiers: {
                  BasicFOP: {
                    Type: "CA",
                  },
                },
                PricingQualifiers: {
                  PassengerType: travelers.map((data) => ({
                    Code: getGenderCode(data.travelerType),
                    Quantity: "1",
                  })),
                  SpecificPenalty: {
                    EitherOr: {
                      Any: true,
                    },
                  },
                },
              },
            },
          },
        ],
        PostProcessing: {
          ARUNK: {
            keepSegments: true,
            priorPricing: true,
          },

          EndTransaction: {
            Source: { ReceivedFrom: agency.agencyName || "API" },
            // Email: {
            //   Ind: true,
            // },
            // Email: {
            //   Itinerary: {
            //     PDF: {
            //       Ind: true,
            //     },
            //     Ind: true,
            //   },
            //   PersonName: {
            //     NameNumber: "1.1",
            //   },
            //   Ind: true,
            // },
          },
          RedisplayReservation: {
            waitInterval: 1000,
          },
          PostBookingHKValidation: {
            waitInterval: 200,
            numAttempts: 4,
          },
          PricingInterval: {
            waitInterval: 100,
          },
          WaitForAirlineRecLoc: {
            waitInterval: 200,
            numAttempts: 4,
          },
        },
      },
    };
    // return errorResponse(res, bookingRequest, 404);

    // Send booking request to Sabre API
    const response = await fetch(
      `${SABRE.BASE_URL}/v2.4.0/passenger/records?mode=create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      },
    );
    const bookingData = await response.json();
    if (
      !response.ok ||
      bookingData.CreatePassengerNameRecordRS.ApplicationResults.status !==
      "Complete"
    ) {
      return { status: 500, data: bookingData };
    }
    const flightInfo =
      bookingData.CreatePassengerNameRecordRS.TravelItineraryRead
        .TravelItinerary.ItineraryInfo.ReservationItems.Item;
    console.log("flightInfo id", flightInfo);
    const bookingId = bookingData.CreatePassengerNameRecordRS.ItineraryRef.ID;
    let saveTraveller;
    try {
      console.log("traveller", data);

      for (const traveller of data.travelers) {
        console.log("nada", traveller);
        const fullName = traveller.name.firstName.trim().split(" ");
        let title = null;
        let firstName = traveller.name.firstName;

        // Check if last part looks like a title
        if (fullName.length > 1) {
          title = fullName[fullName.length - 1]; // assume last word is title
          firstName = fullName.slice(0, -1).join(" "); // remaining is first name
        }
        const code = (
          await getCode(traveller.name.firstName, traveller.name.lastName)
        ).toUpperCase();
        console.log("code", code);
        if (traveller.dateOfBirth)
          traveller.dateOfBirth = new Date(traveller.dateOfBirth)
            .toISOString()
            .split("T")[0];
        if (traveller.documents[0].expiryDate)
          traveller.documents[0].expiryDate = new Date(
            traveller.documents[0].expiryDate,
          )
            .toISOString()
            .split("T")[0];

        const query = {
          firstname: firstName,
          lastname: traveller.name.lastName,
          $or: [],
        };

        const document = traveller.documents?.[0];
        if (document?.documentType === "I") {
          query.$or.push({ cnic: document.number });
        }
        if (document?.documentType === "P") {
          query.$or.push({ passportNumber: document.number });
        }
        console.log("query", query);

        const existingTraveller = await Pax.findOne(query);
        console.log("existingTraveller", existingTraveller);

        if (!existingTraveller) {
          const pax = new Pax({
            code: code,
            firstname: firstName,
            title,
            lastname: traveller.name.lastName,
            cnic:
              traveller.documents?.[0].documentType === "I"
                ? traveller.documents?.[0].number
                : null,
            cnicExpiry:
              traveller.documents?.[0].documentType === "I"
                ? traveller.documents?.[0].expiryDate
                : null,
            passportNumber:
              traveller.documents?.[0].documentType === "P"
                ? traveller.documents?.[0].number
                : null,
            passportExpiry:
              traveller.documents?.[0].documentType === "P"
                ? traveller.documents?.[0].expiryDate
                : null,
            paxType: traveller.travelerType,
            dob: traveller.dateOfBirth,
            nationality: traveller.documents?.[0].nationality,
          });

          saveTraveller = await pax.save();
          console.log(
            `Traveller saved: ${traveller.name.firstName} ${traveller.name.lastName}`,
          );
        } else {
          console.log(
            `Traveller already exists: ${traveller.name.firstName} ${traveller.name.lastName}`,
          );
        }
      }
    } catch (error) {
      console.log("Error saving travellers:", error);
    }
    let flightType = returnFlight.length > 0 ? "round-trip" : "one-way";
    const nadaLength = nada?.length || 0;

    const newBooking = new Booking({
      type: "flight",
      api: "Sabre",
      flightType,
      userId: user._id,
      id: bookingId,
      status: ETicketStatus.HOLD,
      agencyId: user.agencyId || null,
      createdBy: user.role || null,
      orignalPrice: price,
      totalTax: flightOffers[0]?.totalTax,
      finalPrice: adjustedPrice,
      markupType: markupType,
      markupAmount: findMarkup ? findMarkup.markupValue : 0,
      deptTime: flightOffers[0]?.departureTime || "",
      arrivalTime: flightOffers[0]?.arrivalTime || "",
      travelers: travelers.map((passenger, index) => ({
        id: `${index + 1}.1`,
        dateOfBirth: passenger.dateOfBirth,
        gender: passenger.gender,
        name: passenger.name,

        documents: [
          {
            number: passenger.documents?.[index]?.number || "",
            issuanceCountry:
              passenger.documents?.[index]?.issuanceLocation || "",
            nationality: passenger.documents?.[index]?.nationality || "",
            expiryDate: passenger.documents?.[index]?.expiryDate || "",
            issuanceDate: passenger.documents?.[index]?.issuanceDate,
            birthPlace: passenger.documents?.[index]?.birthPlace,
            documentType: "P",
          },
        ],
        contact: {
          phones: [
            { number: contact?.phones[0]?.number, deviceType: "MOBILE" },
          ],
          email: contact?.emailAddress,
        },
      })),
      flightOffers: [
        {
          itineraries: flightInfo.map((data, index) => {
            const nadaIndex = nadaLength > 0 ? index % nadaLength : null;

            const segments = data.FlightSegment.map((val) => ({
              departure: {
                iataCode: val.OriginLocation.LocationCode,
                at: val.DepartureDateTime,
              },
              arrival: {
                iataCode: val.DestinationLocation.LocationCode,
                at:
                  nadaIndex !== null ? nada[nadaIndex]?.ArrivalDateTime : null,
                terminal: val.DestinationLocation.Terminal,
              },
              number: val.FlightNumber,
              AirMilesFlown: val.AirMilesFlown,
              SmokingAllowed: val.SmokingAllowed,
              duration: val.ElapsedTime,
              meals: flightOffers[index]?.meal
                ? MEAL_CODES.includes(mealCode.trim().toUpperCase())
                : false,
              className: val.Cabin.Name,
              classCode: val.Cabin.Code,
              carrierCode: val.MarketingAirline.Code,
              boeing: val.Equipment.AirEquipType,
              numberOfStops: val.StopQuantity,

              operating: {
                carrierCode: val.OperatingAirline[0]?.Code || null,
                Banner: val.OperatingAirline[0]?.Banner || null,
                FlightNumber: val.OperatingAirline[0]?.FlightNumber || null,
              },

              marketing: {
                carrierCode: val.MarketingAirline.Code,
                Banner: val.MarketingAirline.Banner,
                FlightNumber: val.MarketingAirline.FlightNumber,
              },
            }));

            return {
              duration: data.FlightSegment?.[0]?.ElapsedTime || "",
              segments,
            };
          }),
        },
      ],
      departure: nada, // full array of departure objects
      return: returnFlight, // full array of return objects
      contacts: [
        {
          addresseeName: { firstName: contact?.firstName || "N/A" },
          phones: contact?.phones || [],
        },
      ],
    });

    await newBooking.save();

    // Update agency cash limit
    // await Agency.findByIdAndUpdate(
    //   agency._id,
    //   { $inc: { cashLimit: -adjustedPrice } },
    //   { new: true, runValidators: true }
    // );
    return { status: 200, data: newBooking };

    return successResponse(res, "Flight booked successfully", bookingRequest);
  } catch (error) {
    console.error("Error in createBooking:", error);
    return { status: 500, data: error };

    return errorResponse(res, error);
  }
}
async function createBookingM(req, res) {
  try {
    await ensureToken();

    const { data } = req.body;
    const { flightOffers, travelers } = data;

    let infantDOB = null;
    let infantFN = null;
    let infantLN = null;
    let childDOB = null;
    let childIndex = null;

    // Count non-infant passengers
    let paxCount = travelers.filter((t) => t.travelerType !== "INFANT").length;

    // Contact of main passenger
    const contact = travelers?.[0]?.contact;
    const bookingSegments = [];

    // --------------------------
    // 1. Build Segment Structure
    // --------------------------
    flightOffers.forEach((offer) => {
      const dep = offer.departure.departure.departure;
      const arr = offer.departure.departure.arrival;
      console.log("dep", offer.departure.departure);
      console.log("arr", arr);
      bookingSegments.push({
        DepartureDateTime: offer.departure.departure.departureTime,
        ArrivalDateTime: offer.departure.departure.arrivalTime,
        FlightNumber: String(offer.departure.marketingFlightNumber),
        NumberInParty: offer.count.toString(),
        DestinationLocation: {
          LocationCode: arr.airport,
        },

        OriginLocation: {
          LocationCode: dep.airport,
        },
        ResBookDesigCode: offer.bookingCode[0],

        Status: "NN",
        DestinationLocation: { LocationCode: arr.airport },
        MarketingAirline: {
          Code: offer.departure.marketing,
          FlightNumber: String(offer.departure.marketingFlightNumber),
        },
        OriginLocation: { LocationCode: dep.airport },
      });
    });

    // -------------------------------
    // 2. Fetch Agency & Price Details
    // -------------------------------
    const agency = await Agency.findById(req.user.agencyId);
    const findMarkup = await Markup.findOne({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });
    const markupType = findMarkup?.markupType || "none";

    const price = flightOffers[0].totalFare;
    const adjustedPrice = flightOffers[0].adjustedPrice;

    // --------------------------------
    // 3. Prepare Passenger Name Fields
    // --------------------------------
    const passengerNames = travelers.map((pax, idx) => {
      const typeCode = getGenderCode(pax.travelerType);

      if (pax.travelerType === "INFANT") {
        infantFN = pax.name.firstName.replace(" Mstr", "");
        infantLN = pax.name.lastName;
        infantDOB = formatDate(pax.dateOfBirth);
      }

      if (pax.travelerType === "CHILD") {
        childDOB = formatDate(pax.dateOfBirth);
        childIndex = `${idx + 1}.1`;
      }

      return {
        NameNumber: `${idx + 1}.1`,
        GivenName:
          typeCode === "INF" ? "INF" : pax.name.firstName?.toUpperCase(),
        Surname: pax.name.lastName?.toUpperCase(),
        PassengerType: typeCode,
        NameReference:
          typeCode === "CNN"
            ? `C${calculateAgeInYears(pax.dateOfBirth)}`
            : typeCode === "INF"
              ? `I${calculateAgeInMonths(pax.dateOfBirth)}`
              : `A${calculateAgeInYears(pax.dateOfBirth)}`,
        Infant: typeCode === "INF",
      };
    });

    // -------------------------------
    // 4. Special Service Requirements
    // -------------------------------
    const specialReqDetails = {
      SpecialService: {
        SpecialServiceInfo: {
          SecureFlight: travelers.map((pax, idx) => ({
            SegmentNumber: "A",
            PersonName: {
              NameNumber:
                getGenderCode(pax.travelerType) === "INF"
                  ? "1.1"
                  : `${idx + 1}.1`,
              GivenName:
                getGenderCode(pax.travelerType) === "INF"
                  ? "INF"
                  : pax.name.firstName?.toUpperCase(),
              Surname: pax.name.lastName?.toUpperCase(),
              Gender:
                getGenderCode(pax.travelerType) === "INF"
                  ? "FI"
                  : pax.gender?.charAt(0)?.toUpperCase(),
              DateOfBirth: pax.dateOfBirth,
            },
          })),

          Service: [
            ...(infantFN
              ? [
                {
                  SSR_Code: "INFT",
                  Text: `${infantLN}/${infantFN}/${infantDOB}`,
                  PersonName: { NameNumber: "1.1" },
                },
              ]
              : []),
            ...(childDOB
              ? [
                {
                  SSR_Code: "CHLD",
                  Text: childDOB,
                  PersonName: { NameNumber: childIndex },
                },
              ]
              : []),
            {
              SSR_Code: "CTCM",
              Text: agency.phoneNumber,
              PersonName: { NameNumber: "1.1" },
            },
            {
              SSR_Code: "CTCE",
              Text: agency.agencyEmail,
              PersonName: { NameNumber: "1.1" },
            },
          ],

          AdvancePassenger: travelers.map((pax, idx) => ({
            Document: {
              IssueCountry: pax.documents?.[0]?.issuanceCountry,
              NationalityCountry: pax.documents?.[0]?.nationality,
              ExpirationDate: pax.documents?.[0]?.expiryDate,
              Number: pax.documents?.[0]?.number,
              Type: pax.documents?.[0]?.documentType,
            },
            PersonName: {
              NameNumber: `${idx + 1}.1`,
              GivenName:
                getGenderCode(pax.travelerType) === "INF"
                  ? pax.name.firstName.replace("Mstr", "INF")
                  : pax.name.firstName?.toUpperCase(),
              Surname: pax.name.lastName?.toUpperCase(),
              LapChild: getGenderCode(pax.travelerType) === "INF",
              Gender:
                getGenderCode(pax.travelerType) === "INF"
                  ? `${pax.gender?.charAt(0)?.toUpperCase()}I`
                  : pax.gender?.charAt(0)?.toUpperCase(),
              DateOfBirth: pax.dateOfBirth,
            },
            SegmentNumber: "A",
          })),
        },
      },
    };

    // ---------------------------------
    // 5. Build CreatePNR Sabre Payload
    // ---------------------------------
    const bookingRequest = {
      CreatePassengerNameRecordRQ: {
        version: "2.4.0",
        targetCity: SABRE.SABRE_PCC,
        haltOnAirPriceError: true,
        haltOnInvalidMCT: true,

        TravelItineraryAddInfo: {
          AgencyInfo: {
            Ticketing: { TicketType: "7TAW" },
            Address: {
              AddressLine: agency.address,
              CityName: agency.city,
              PostalCode: agency.poBoxNumber,
              VendorPrefs: { Airline: { Hosted: true } },
            },
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber: [
                {
                  NameNumber: "1.1",
                  Phone: agency.phoneNumber,
                  PhoneUseType: "A",
                },
              ],
            },
            PersonName: passengerNames,
            Email: [{ Address: agency.agencyEmail, NameNumber: "1.1" }],
          },
        },

        SpecialReqDetails: specialReqDetails,

        AirBook: {
          HaltOnStatus: [
            { Code: "HL" },
            { Code: "HN" },
            { Code: "HX" },
            { Code: "LL" },
            { Code: "NN" },
            { Code: "NO" },
            { Code: "PN" },
            { Code: "UC" },
            { Code: "UN" },
            { Code: "US" },
            { Code: "UU" },
          ],
          RetryRebook: { Option: true },
          OriginDestinationInformation: { FlightSegment: bookingSegments },
          RedisplayReservation: { NumAttempts: 10, WaitInterval: 500 },
        },

        AirPrice: [
          {
            PriceRequestInformation: {
              Retain: true,
              OptionalQualifiers: {
                FOP_Qualifiers: { BasicFOP: { Type: "CA" } },
                PricingQualifiers: {
                  PassengerType: travelers.map((p) => ({
                    Code: getGenderCode(p.travelerType),
                    Quantity: "1",
                  })),
                  SpecificPenalty: {
                    EitherOr: {
                      Any: true,
                    },
                  },
                },
              },
            },
          },
        ],

        PostProcessing: {
          EndTransaction: {
            Source: { ReceivedFrom: agency.agencyName || "API" },
            // Email: { Ind: true },
          },
          ARUNK: {
            keepSegments: true,
            priorPricing: true,
          },
          RedisplayReservation: {
            waitInterval: 1000,
          },
          PostBookingHKValidation: {
            waitInterval: 200,
            numAttempts: 4,
          },
          PricingInterval: {
            waitInterval: 100,
          },
          WaitForAirlineRecLoc: {
            waitInterval: 200,
            numAttempts: 4,
          },
        },
      },
    };
    // return errorResponse(res, bookingRequest, 404);

    // Send booking request to Sabre API
    const response = await fetch(
      `${SABRE.BASE_URL}/v2.4.0/passenger/records?mode=create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      },
    );
    const bookingData = await response.json();
    if (
      !response.ok ||
      bookingData.CreatePassengerNameRecordRS.ApplicationResults.status !==
      "Complete"
    ) {
      return errorResponse(res, bookingData, 404);
      return errorResponse(res, bookingRequest, 404);
    }

    let saveTraveller = null;

    try {
      console.log("========== START TRAVELLER SAVE PROCESS ==========");

      for (const traveller of data.travelers) {
        console.log("\n---------------------------------------------");
        console.log(
          "Processing traveller:",
          JSON.stringify(traveller, null, 2),
        );

        // --- Extract Title from firstName ---
        const fullName = traveller.name.firstName.trim().split(" ");
        let title = null;
        let firstName = traveller.name.firstName;

        if (fullName.length > 1) {
          title = fullName[fullName.length - 1];
          firstName = fullName.slice(0, -1).join(" ");
        }

        console.log("Extracted Name:");
        console.log("  First Name:", firstName);
        console.log("  Last Name :", traveller.name.lastName);
        console.log("  Title     :", title);

        // --- Convert DOB + Expiry Dates ---
        if (traveller.dateOfBirth) {
          traveller.dateOfBirth = new Date(traveller.dateOfBirth)
            .toISOString()
            .split("T")[0];

          console.log("Converted DOB:", traveller.dateOfBirth);
        }

        if (traveller.documents[0]?.expiryDate) {
          traveller.documents[0].expiryDate = new Date(
            traveller.documents[0].expiryDate,
          )
            .toISOString()
            .split("T")[0];

          console.log(
            "Converted Document Expiry:",
            traveller.documents[0].expiryDate,
          );
        }

        const document = traveller.documents?.[0];

        console.log("Document Info:");
        console.log("  Type :", document?.documentType);
        console.log("  Number :", document?.number);
        console.log("  Nationality :", document?.nationality);

        // *************************************************************
        // 1️⃣ FIND ANY TRAVELLER WITH SAME FIRSTNAME + LASTNAME
        // *************************************************************
        console.log("\nSearching travellers with same name...");

        const sameNameTravellers = await Pax.find({
          firstname: firstName,
          lastname: traveller.name.lastName,
        });

        console.log(
          "Travellers found with same name:",
          sameNameTravellers.length,
        );

        sameNameTravellers.forEach((t, i) => {
          console.log(
            `  [${i + 1}] Code: ${t.code}, CNIC: ${t.cnic}, Passport: ${t.passportNumber
            }`,
          );
        });

        let existingTraveller = null;

        if (sameNameTravellers.length > 0) {
          // *************************************************************
          // 2️⃣ Check if any have SAME document (same CNIC/passport)
          // *************************************************************
          console.log("Checking for matching document...");

          existingTraveller = sameNameTravellers.find((t) => {
            if (document?.documentType === "I") {
              return t.cnic === document.number;
            }
            if (document?.documentType === "P") {
              return t.passportNumber === document.number;
            }
            return false;
          });

          if (existingTraveller) {
            console.log("MATCH FOUND → Existing traveller identified:");
            console.log("  Code:", existingTraveller.code);
          } else {
            console.log("NO document match. This is a *new* traveller.");
          }
        }

        // If SAME traveller found → do nothing
        if (existingTraveller) {
          console.log(
            `Skipping save → Traveller already exists: ${firstName} ${traveller.name.lastName}`,
          );
          continue;
        }

        // *************************************************************
        // 3️⃣ New traveller → Generate next available code (DH02, DH03…)
        // *************************************************************
        console.log("Generating new traveller code...");
        const code = await getCode(firstName, traveller.name.lastName);
        const finalCode = code.toUpperCase();

        console.log("Assigned Code:", finalCode);

        // *************************************************************
        // 4️⃣ Save new traveller
        // *************************************************************
        const travellerData = {
          code: finalCode,
          firstname: firstName,
          lastname: traveller.name.lastName,
          title,
          paxType: traveller.travelerType,
          dob: traveller.dateOfBirth,
          nationality: document?.nationality,
        };

        if (document?.documentType === "I") {
          travellerData.cnic = document.number;
          travellerData.cnicExpiry = document.expiryDate;

          console.log("Added CNIC:", travellerData.cnic);
        }

        if (document?.documentType === "P") {
          travellerData.passportNumber = document.number;
          travellerData.passportExpiry = document.expiryDate;

          console.log("Added Passport:", travellerData.passportNumber);
        }

        console.log("\nFinal Traveller Data to Save:");
        console.log(JSON.stringify(travellerData, null, 2));

        const pax = new Pax(travellerData);
        saveTraveller = await pax.save();

        console.log(
          `Traveller SAVED successfully: ${firstName} ${traveller.name.lastName} (Code: ${finalCode})`,
        );
      }

      console.log("\n========== END TRAVELLER SAVE PROCESS ==========");
    } catch (error) {
      console.log("❌ ERROR saving travellers:");
      console.log(error.stack || error);
    }

    const bookingId = bookingData.CreatePassengerNameRecordRS.ItineraryRef.ID;
    console.log("booking id", bookingId);

    const flightInfo =
      bookingData.CreatePassengerNameRecordRS.TravelItineraryRead
        .TravelItinerary.ItineraryInfo.ReservationItems.Item;
    console.log("flightInfo id", flightInfo);
    const newBooking = new Booking({
      type: "flight",
      api: "Sabre",
      flightType: "multi-city",

      userId: req.user._id,
      id: bookingId,
      status: ETicketStatus.HOLD,
      agencyId: req.user.agencyId || null,
      createdBy: req.user.role || null,
      orignalPrice: price,
      totalTax: flightOffers[0]?.totalTax,
      finalPrice: adjustedPrice,
      markupType: markupType,
      markupAmount: findMarkup?.markupValue ? findMarkup?.markupValue : null,
      deptTime: flightOffers[0]?.departureTime || "",
      arrivalTime: flightOffers[0]?.arrivalTime || "",
      travelers: travelers.map((passenger, index) => ({
        id: `${index + 1}.1`,
        dateOfBirth: passenger.dateOfBirth,
        gender: passenger.gender,
        name: passenger.name,

        documents: [
          {
            number: passenger.documents?.[index]?.number || "",
            issuanceCountry:
              passenger.documents?.[index]?.issuanceLocation || "",
            nationality: passenger.documents?.[index]?.nationality || "",
            expiryDate: passenger.documents?.[index]?.expiryDate || "",
            issuanceDate: passenger.documents?.[index]?.issuanceDate,
            birthPlace: passenger.documents?.[index]?.birthPlace,
            documentType: "P",
          },
        ],
        contact: {
          phones: [
            { number: contact?.phones[0]?.number, deviceType: "MOBILE" },
          ],
          email: contact?.emailAddress,
        },
      })),
      flightOffers: [
        {
          itineraries: flightInfo
            .filter((data) => data.FlightSegment) // ✅ skip ARNK
            .map((data, index) => {
              const segments = data.FlightSegment.map((val) => ({
                departure: {
                  iataCode: val.OriginLocation.LocationCode,
                  at: val.DepartureDateTime,
                },
                arrival: {
                  iataCode: val.DestinationLocation.LocationCode,
                  at: bookingSegments?.[index]?.ArrivalDateTime || null,
                  terminal: val.DestinationLocation.Terminal,
                },
                number: val.FlightNumber,
                AirMilesFlown: val.AirMilesFlown,
                SmokingAllowed: val.SmokingAllowed,
                duration: val.ElapsedTime,
                meals: flightOffers[index]?.meal
                  ? MEAL_CODES.includes(
                    flightOffers[index]?.meal.trim().toUpperCase(),
                  )
                  : false,
                className: val.Cabin.Name,
                classCode: val.Cabin.Code,
                carrierCode: val.MarketingAirline.Code,
                boeing: val.Equipment.AirEquipType,
                numberOfStops: val.StopQuantity,

                operating: {
                  carrierCode: val.OperatingAirline?.[0]?.Code || null,
                  Banner: val.OperatingAirline?.[0]?.Banner || null,
                  FlightNumber: val.OperatingAirline?.[0]?.FlightNumber || null,
                },

                marketing: {
                  carrierCode: val.MarketingAirline.Code,
                  Banner: val.MarketingAirline.Banner,
                  FlightNumber: val.MarketingAirline.FlightNumber,
                },
              }));

              return {
                duration: data.FlightSegment?.[0]?.ElapsedTime || "",
                segments,
              };
            }),
        },
      ],
      contacts: [
        {
          addresseeName: { firstName: contact?.firstName || "N/A" },
          phones: contact?.phones || [],
        },
      ],
    });

    await newBooking.save();

    // Update agency cash limit
    // await Agency.findByIdAndUpdate(
    //   agency._id,
    //   { $inc: { cashLimit: -adjustedPrice } },
    //   { new: true, runValidators: true }
    // );

    return successResponse(res, "Flight created successfully", newBooking);
  } catch (error) {
    console.error("Error in createBooking:", error);
    return errorResponse(res, error);
  }
}
async function createBookingMM(req, res) {
  try {
    console.log(";logd Ensuring token");
    await ensureToken();

    const data = req.data;
    console.log(";logd Request data received", data);

    const flightOffers = data.flightOffers;
    const travelers = data.travelers;

    let infant_firstName, infant_lastname, infant_DOB, child_DOB, child_index;

    // Count non-infant travelers
    const adultCount = travelers.filter(
      (t) => t.travelerType !== "INFANT",
    ).length;
    console.log(";logd Number of non-infant travelers", adultCount);

    const contact = travelers[0].contact;
    console.log(";logd Contact info", contact);

    // Prepare flight segments
    const bookingSegments = flightOffers.map((offer) => {
      const dep = offer.departure.departure.departure;
      const arr = offer.departure.departure.arrival;

      return {
        DepartureDateTime: offer.departure.departure.departureTime,
        ArrivalDateTime: offer.departure.departure.arrivalTime,
        FlightNumber: String(offer.departure.departure.marketingFlightNumber),
        NumberInParty: offer.count.toString(),
        DestinationLocation: { LocationCode: arr.airport },
        OriginLocation: { LocationCode: dep.airport },
        ResBookDesigCode: offer.bookingCode[0],
        Status: "NN",
        MarketingAirline: {
          Code: offer.departure.departure.marketing,
          FlightNumber: String(offer.departure.departure.marketingFlightNumber),
        },
      };
    });
    console.log(";logd Booking segments prepared", bookingSegments);

    // Fetch agency and markup
    const agency = await Agency.findById(res.agencyId);
    const findMarkup = await Markup.findOne({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });
    const markupType = findMarkup?.markupType || "none";

    // Calculate adjusted price
    const price = flightOffers[0]?.totalFare || 0;
    let adjustedPrice = flightOffers[0]?.adjustedPrice || price;

    if (findMarkup?.airlines?.includes(flightOffers[0]?.marketing)) {
      adjustedPrice =
        markupType === "percentage"
          ? adjustedPrice + (adjustedPrice * findMarkup.markupValue) / 100
          : adjustedPrice + findMarkup.markupValue;
    }
    console.log(";logd Adjusted price calculated", adjustedPrice);

    // Prepare passenger details
    const passengerNames = travelers.map((passenger, index) => {
      if (getGenderCode(passenger.travelerType) === "INF") {
        infant_firstName = passenger.name.firstName.replace(" Mstr", "");
        infant_lastname = passenger.name.lastName;
        infant_DOB = formatDate(passenger.dateOfBirth);
      }
      if (passenger.travelerType === "CHILD") {
        child_DOB = formatDate(passenger.dateOfBirth);
        child_index = `${index + 1}.1`;
      }

      return {
        NameNumber: `${index + 1}.1`,
        GivenName:
          getGenderCode(passenger.travelerType) === "INF"
            ? "INF"
            : passenger.name.firstName?.toUpperCase(),
        Surname: passenger.name.lastName?.toUpperCase(),
        PassengerType: getGenderCode(passenger.travelerType),
        NameReference:
          getGenderCode(passenger.travelerType) === "CNN"
            ? `C${calculateAgeInYears(passenger.dateOfBirth)}`
            : getGenderCode(passenger.travelerType) === "INF"
              ? `I${calculateAgeInMonths(passenger.dateOfBirth)}`
              : `A${calculateAgeInYears(passenger.dateOfBirth)}`,
        Infant: getGenderCode(passenger.travelerType) === "INF",
      };
    });
    console.log(";logd Passenger names prepared", passengerNames);

    // Special requests
    const specialReqDetails = {
      SpecialService: {
        SpecialServiceInfo: {
          SecureFlight: travelers.map((passenger, index) => ({
            SegmentNumber: "A",
            PersonName: {
              NameNumber:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "1.1"
                  : `${index + 1}.1`,
              GivenName:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "INF"
                  : passenger.name.firstName?.toUpperCase(),
              DateOfBirth: passenger.dateOfBirth,
              Surname: passenger.name.lastName?.toUpperCase(),
              Gender:
                getGenderCode(passenger.travelerType) === "INF"
                  ? "FI"
                  : passenger.gender?.charAt(0)?.toUpperCase(),
            },
          })),
          Service: [
            ...(infant_firstName
              ? [
                {
                  SSR_Code: "INFT",
                  Text: `${infant_lastname}/${infant_firstName}/${infant_DOB}`,
                  PersonName: { NameNumber: "1.1" },
                },
              ]
              : []),
            ...(child_DOB
              ? [
                {
                  SSR_Code: "CHLD",
                  Text: `${child_DOB}`,
                  PersonName: { NameNumber: child_index },
                },
              ]
              : []),
            {
              SSR_Code: "CTCM",
              Text: agency.phoneNumber,
              PersonName: { NameNumber: "1.1" },
            },
            {
              SSR_Code: "CTCE",
              Text: agency.agencyEmail,
              PersonName: { NameNumber: "1.1" },
            },
          ],
          AdvancePassenger: travelers.map((passenger, index) => ({
            Document: {
              IssueCountry: passenger.documents?.[0]?.issuanceCountry,
              NationalityCountry: passenger.documents?.[0]?.nationality,
              ExpirationDate: passenger.documents?.[0]?.expiryDate,
              Number: passenger.documents?.[0]?.number,
              Type: passenger.documents?.[0]?.documentType,
            },
            PersonName: {
              NameNumber: `${index + 1}.1`,
              GivenName:
                getGenderCode(passenger.travelerType) === "INF"
                  ? passenger.name.firstName.replace("Mstr", "INF")
                  : passenger.name.firstName?.toUpperCase(),
              Surname: passenger.name.lastName?.toUpperCase(),
              LapChild: getGenderCode(passenger.travelerType) === "INF",
              Gender:
                getGenderCode(passenger.travelerType) === "INF"
                  ? `${passenger.gender?.charAt(0).toUpperCase()}I`
                  : passenger.gender?.charAt(0).toUpperCase(),
              DateOfBirth: passenger.dateOfBirth,
            },
            SegmentNumber: "A",
          })),
        },
      },
    };
    console.log(";logd Special request details prepared", specialReqDetails);

    // Booking request
    const bookingRequest = {
      CreatePassengerNameRecordRQ: {
        version: "2.4.0",
        targetCity: SABRE.SABRE_PCC,
        haltOnAirPriceError: true,
        TravelItineraryAddInfo: {
          AgencyInfo: {
            Ticketing: { TicketType: "7TAW" },
            Address: {
              AddressLine: agency.address,
              CityName: agency.city,
              PostalCode: agency.poBoxNumber,
              VendorPrefs: { Airline: { Hosted: true } },
            },
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber: [
                {
                  NameNumber: "1.1",
                  Phone: agency.phoneNumber,
                  PhoneUseType: "A",
                },
              ],
            },
            PersonName: passengerNames,
            Email: [{ Address: agency.agencyEmail, NameNumber: "1.1" }],
          },
        },
        SpecialReqDetails: specialReqDetails,
        AirBook: {
          RetryRebook: { Option: true },
          OriginDestinationInformation: { FlightSegment: bookingSegments },
          RedisplayReservation: { NumAttempts: 5, WaitInterval: 100 },
        },
        AirPrice: [
          {
            PriceRequestInformation: {
              Retain: true,
              OptionalQualifiers: {
                FOP_Qualifiers: { BasicFOP: { Type: "CA" } },
                PricingQualifiers: {
                  PassengerType: travelers.map((t) => ({
                    Code: getGenderCode(t.travelerType),
                    Quantity: "1",
                  })),
                  SpecificPenalty: {
                    EitherOr: {
                      Any: true,
                    },
                  },
                },
              },
            },
          },
        ],
        PostProcessing: {
          EndTransaction: {
            Source: { ReceivedFrom: agency.agencyName || "API" },
          },
          RedisplayReservation: {},
          PricingInterval: { waitInterval: 100 },
        },
      },
    };
    console.log(";logd Booking request payload prepared", bookingRequest);

    // // Send booking request to Sabre
    const response = await fetch(
      `${SABRE.BASE_URL}/v2.4.0/passenger/records?mode=create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      },
    );

    const bookingData = await response.json();
    console.log(";logd Sabre API response", bookingData);
    // return { status: 200, data: bookingData };

    // return res.status(200).json({ message: "Flight booked successfully", bookingData });
    if (
      !response.ok ||
      bookingData.CreatePassengerNameRecordRS?.ApplicationResults?.status !==
      "Complete"
    ) {
      console.error(";logd Booking failed", bookingData);
      return res.status(500).json({ error: bookingData });
    }

    const bookingId = bookingData.CreatePassengerNameRecordRS.ItineraryRef.ID;
    console.log(";logd Booking ID", bookingId);
    let saveTraveller = null;

    try {
      console.log("========== START TRAVELLER SAVE PROCESS ==========");

      for (const traveller of data.travelers) {
        console.log("\n---------------------------------------------");
        console.log(
          "Processing traveller:",
          JSON.stringify(traveller, null, 2),
        );

        // --- Extract Title from firstName ---
        const fullName = traveller.name.firstName.trim().split(" ");
        let title = null;
        let firstName = traveller.name.firstName;

        if (fullName.length > 1) {
          title = fullName[fullName.length - 1];
          firstName = fullName.slice(0, -1).join(" ");
        }

        console.log("Extracted Name:");
        console.log("  First Name:", firstName);
        console.log("  Last Name :", traveller.name.lastName);
        console.log("  Title     :", title);

        // --- Convert DOB + Expiry Dates ---
        if (traveller.dateOfBirth) {
          traveller.dateOfBirth = new Date(traveller.dateOfBirth)
            .toISOString()
            .split("T")[0];

          console.log("Converted DOB:", traveller.dateOfBirth);
        }

        if (traveller.documents[0]?.expiryDate) {
          traveller.documents[0].expiryDate = new Date(
            traveller.documents[0].expiryDate,
          )
            .toISOString()
            .split("T")[0];

          console.log(
            "Converted Document Expiry:",
            traveller.documents[0].expiryDate,
          );
        }

        const document = traveller.documents?.[0];

        console.log("Document Info:");
        console.log("  Type :", document?.documentType);
        console.log("  Number :", document?.number);
        console.log("  Nationality :", document?.nationality);

        // *************************************************************
        // 1️⃣ FIND ANY TRAVELLER WITH SAME FIRSTNAME + LASTNAME
        // *************************************************************
        console.log("\nSearching travellers with same name...");

        const sameNameTravellers = await Pax.find({
          firstname: firstName,
          lastname: traveller.name.lastName,
        });

        console.log(
          "Travellers found with same name:",
          sameNameTravellers.length,
        );

        sameNameTravellers.forEach((t, i) => {
          console.log(
            `  [${i + 1}] Code: ${t.code}, CNIC: ${t.cnic}, Passport: ${t.passportNumber
            }`,
          );
        });

        let existingTraveller = null;

        if (sameNameTravellers.length > 0) {
          // *************************************************************
          // 2️⃣ Check if any have SAME document (same CNIC/passport)
          // *************************************************************
          console.log("Checking for matching document...");

          existingTraveller = sameNameTravellers.find((t) => {
            if (document?.documentType === "I") {
              return t.cnic === document.number;
            }
            if (document?.documentType === "P") {
              return t.passportNumber === document.number;
            }
            return false;
          });

          if (existingTraveller) {
            console.log("MATCH FOUND → Existing traveller identified:");
            console.log("  Code:", existingTraveller.code);
          } else {
            console.log("NO document match. This is a *new* traveller.");
          }
        }

        // If SAME traveller found → do nothing
        if (existingTraveller) {
          console.log(
            `Skipping save → Traveller already exists: ${firstName} ${traveller.name.lastName}`,
          );
          continue;
        }

        // *************************************************************
        // 3️⃣ New traveller → Generate next available code (DH02, DH03…)
        // *************************************************************
        console.log("Generating new traveller code...");
        const code = await getCode(firstName, traveller.name.lastName);
        const finalCode = code.toUpperCase();

        console.log("Assigned Code:", finalCode);

        // *************************************************************
        // 4️⃣ Save new traveller
        // *************************************************************
        const travellerData = {
          code: finalCode,
          firstname: firstName,
          lastname: traveller.name.lastName,
          title,
          paxType: traveller.travelerType,
          dob: traveller.dateOfBirth,
          nationality: document?.nationality,
        };

        if (document?.documentType === "I") {
          travellerData.cnic = document.number;
          travellerData.cnicExpiry = document.expiryDate;

          console.log("Added CNIC:", travellerData.cnic);
        }

        if (document?.documentType === "P") {
          travellerData.passportNumber = document.number;
          travellerData.passportExpiry = document.expiryDate;

          console.log("Added Passport:", travellerData.passportNumber);
        }

        console.log("\nFinal Traveller Data to Save:");
        console.log(JSON.stringify(travellerData, null, 2));

        const pax = new Pax(travellerData);
        saveTraveller = await pax.save();

        console.log(
          `Traveller SAVED successfully: ${firstName} ${traveller.name.lastName} (Code: ${finalCode})`,
        );
      }

      console.log("\n========== END TRAVELLER SAVE PROCESS ==========");
    } catch (error) {
      console.log("❌ ERROR saving travellers:");
      console.log(error.stack || error);
    }
    // Save booking in DB
    const flightInfo =
      bookingData.CreatePassengerNameRecordRS.TravelItineraryRead
        .TravelItinerary.ItineraryInfo.ReservationItems.Item;
    console.log("flightInfo id", flightInfo);
    const newBooking = new Booking({
      type: "flight",
      api: "Sabre",
      flightType: "multi-city",
      userId: res._id,
      id: bookingId,
      status: ETicketStatus.HOLD,
      agencyId: res.agencyId || null,
      createdBy: res.role || null,
      orignalPrice: price,
      totalTax: flightOffers[0]?.totalTax,
      finalPrice: adjustedPrice,
      markupType: markupType,
      markupAmount: findMarkup?.markupValue ? findMarkup?.markupValue : null,
      deptTime: flightOffers[0]?.departureTime || "",
      arrivalTime: flightOffers[0]?.arrivalTime || "",
      travelers: travelers.map((passenger, index) => ({
        id: `${index + 1}.1`,
        dateOfBirth: passenger.dateOfBirth,
        gender: passenger.gender,
        name: passenger.name,

        documents: [
          {
            number: passenger.documents?.[index]?.number || "",
            issuanceCountry:
              passenger.documents?.[index]?.issuanceLocation || "",
            nationality: passenger.documents?.[index]?.nationality || "",
            expiryDate: passenger.documents?.[index]?.expiryDate || "",
            issuanceDate: passenger.documents?.[index]?.issuanceDate,
            birthPlace: passenger.documents?.[index]?.birthPlace,
            documentType: "P",
          },
        ],
        contact: {
          phones: [
            { number: contact?.phones[0]?.number, deviceType: "MOBILE" },
          ],
          email: contact?.emailAddress,
        },
      })),
      flightOffers: [
        {
          itineraries: flightInfo.map((data, index) => {
            const segments = data.FlightSegment.map((val) => ({
              departure: {
                iataCode: val.OriginLocation.LocationCode,
                at: val.DepartureDateTime,
              },
              arrival: {
                iataCode: val.DestinationLocation.LocationCode,
                at: bookingSegments?.[index].ArrivalDateTime,
                terminal: val.DestinationLocation.Terminal,
              },
              number: val.FlightNumber,
              AirMilesFlown: val.AirMilesFlown,
              SmokingAllowed: val.SmokingAllowed,
              duration: val.ElapsedTime,
              meals: flightOffers[index]?.meal
                ? MEAL_CODES.includes(
                  flightOffers[index]?.meal.trim().toUpperCase(),
                )
                : false,
              className: val.Cabin.Name,
              classCode: val.Cabin.Code,
              carrierCode: val.MarketingAirline.Code,
              boeing: val.Equipment.AirEquipType,
              numberOfStops: val.StopQuantity,

              operating: {
                carrierCode: val.OperatingAirline[0]?.Code || null,
                Banner: val.OperatingAirline[0]?.Banner || null,
                FlightNumber: val.OperatingAirline[0]?.FlightNumber || null,
              },

              marketing: {
                carrierCode: val.MarketingAirline.Code,
                Banner: val.MarketingAirline.Banner,
                FlightNumber: val.MarketingAirline.FlightNumber,
              },
            }));

            return {
              duration: data.FlightSegment?.[0]?.ElapsedTime || "",
              segments,
            };
          }),
        },
      ],
      contacts: [
        {
          addresseeName: { firstName: contact?.firstName || "N/A" },
          phones: contact?.phones || [],
        },
      ],
    });

    await newBooking.save();
    console.log(";logd Booking saved successfully");
    return { status: 200, data: newBooking };

    return res
      .status(200)
      .json({ message: "Flight booked successfully", bookingData });
  } catch (error) {
    console.error(";logd Error in createBooking:", error);
    return res.status(500).json({ error });
  }
}

async function issueTicket(req, res) {
  try {
    const { otp, userId, commission } = req.body;
    const user = await User.findById(req.user._id);
    const agency = await Agency.findById(req.user.agencyId);

    // const otpValidationResult = await handleOtpAttempts(user, otp);

    // if (!otpValidationResult.success) {
    //   return res.status(otpValidationResult.status).json({
    //     error: otpValidationResult.message,
    //   });
    // }
    await ensureToken();
    const { country_code, pnr, number } = req.body;

    const findBookings = await Booking.findOne({ id: pnr });
    if (Number(agency.cashLimit) < Number(findBookings.finalPrice)) {
      return errorResponse(
        res,
        "Insufficient balance. Please recharge your account.",
        404,
      );
    }
    // if (
    //   req.user.id !== findBookings.uniqueId &&
    //   req.user.role !== EUserRole.SUPERADMIN
    // ) {
    //   return errorResponse(
    //     res,
    //     "only the user created ticket can issue it",
    //     404
    //   );
    // }
    const travellers = findBookings.travelers;
    const data = {
      AirTicketRQ: {
        DesignatePrinter: {
          Printers: {
            Ticket: {
              CountryCode: "PK",
            },
            Hardcopy: {
              LNIATA: `${process.env.SABRE_PRINTER_NUMBER}`,
            },
          },
        },
        Itinerary: {
          ID: pnr,
        },
        Ticketing: [
          {
            PricingQualifiers: {
              PriceQuote: [
                {
                  NameSelect: travellers.map((data, index) => ({
                    NameNumber: Number(`${index + 1}.1`),
                  })),
                  Record: [
                    {
                      Number: 1,
                      Reissue: false,
                    },
                  ],
                },
              ],
            },
            FOP_Qualifiers: {
              BasicFOP: {
                Type: "CA",
              },
            },
            MiscQualifiers: {
              Commission: {
                Percent: 0,
              },
            },
          },
        ],
        PostProcessing: {
          EndTransaction: {
            Source: {
              ReceivedFrom: `${SABRE.SABRE_PCC}`,
            },
            // Email: {
            //   eTicket: {
            //     PDF: {
            //       Ind: false,
            //     },
            //     Ind: true,
            //   },
            //   // PersonName: {
            //   //   NameNumber: "1.1",
            //   // },
            //   // PersonName: {
            //   //   NameNumber: "2.1",
            //   // },
            //   Ind: true,
            // },
          },
        },
      },
    };
    // return errorResponse(res,data,404)
    const amadeusResponse = await fetch(`${SABRE.BASE_URL}/v1.3.0/air/ticket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const bookingData = await amadeusResponse.json();

    // let bookingData?.AirTicketRS?.ApplicationResults?.status =complete
    // const errorDetails = await amadeusResponse.text();
    // if (!bookingData.ok) {
    // return errorResponse(res, bookingData, 404);
    // }
    // Check if ticketing was successful
    if (bookingData?.AirTicketRS?.ApplicationResults?.status === "Complete") {
      const findbooking = await Booking.findOne({ id: pnr });
      if (!findbooking) {
        return errorResponse(res, "Data not available in the database", 404);
      }
      // console.log("bookingData", bookingData);
      const updatedTravelers = findbooking.travelers.map((traveler, index) => {
        console.log(
          "TICKET NUMBER",
          bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber,
        );
        const ticketInfo =
          bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber;
        return {
          ...traveler._doc,
          ticketNumber: ticketInfo,
        };
      });
      console.log("updatedTravelers", updatedTravelers);
      console.log(" findbooking._id,", findbooking._id);

      const updatebooking = await Booking.findByIdAndUpdate(
        findbooking._id,
        {
          commission: commission ? commission : 0,
          status: ETicketStatus.COMFIRMED,
          isTicketed: true,
          travelers: updatedTravelers,
        },
        { new: true, runValidators: true },
      );

      console.log("detucting the amount from the wallet...... ");
      const finalPrice = Number(findBookings.finalPrice);
      if (isNaN(finalPrice)) {
        return { status: 500, data: "Invalid finalPrice" };
      }
      if (
        user.role === EUserRole.AGENCY ||
        user.role === EUserRole.SUPERADMIN
      ) {
        console.log(`detucting the amount from agency`);
        let currentBalance = Number(agency.cashLimit); // convert DB value

        await Agency.findByIdAndUpdate(
          agency._id,
          { cashLimit: currentBalance - finalPrice },
          { new: true, runValidators: true },
        );
      } else {
        console.log(`detucting the amount  agent ${user.role}`);
        let currentBalance = Number(user.allocatedBalance); // convert DB value
        await User.findByIdAndUpdate(
          user._id,
          { allocatedBalance: currentBalance - finalPrice },
          { new: true, runValidators: true },
        );
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let spo;
      if (updatebooking.userId) {
        const finduser = await User.findOne({ _id: updatebooking.userId });
        if (finduser.assignedSPO) {
          spo = finduser.assignedSPO;
        }
      }
      // Save Customer Ledger Entry (Final Price)
      const newCustomerLedger = new CustomerLedger({
        customerName: updatebooking.travelers[0].name,
        spo: spo,
        ticketNumber: updatebooking.travelers[0].ticketNumber,
        amount:
          Number(updatebooking.finalPrice) + Number(updatebooking.commission),
        payMode: "CASH",
        supplierType: updatebooking.api,
        type: "credited",
      });
      await newCustomerLedger.save();
      console.log("saved newCustomerLedger");

      // Save Supplier Ledger Entry (Original Price)
      const newSupplierLedger = new SupplierLedger({
        supplierName: updatebooking.api,
        amount: updatebooking.orignalPrice,
        payMode: "CASH",
        spo: spo,
        type: "credited",
      });
      await newSupplierLedger.save();
      console.log("saved newSupplierLedger");
      let total = 0;

      if (updatebooking.markupType === "percentage") {
        total =
          Number(updatebooking.finalPrice) - Number(updatebooking.orignalPrice);
      } else {
        total = Number(updatebooking.markupAmount); // Fixed markup amount
      }

      // Save Income Statement Entry (Markup)
      const newIncomeStatement = new IncomeStatement({
        spo: spo,
        amount: total,
        // description: `Markup from ticket ${ticketNumber}`,
        supplierLedger: newSupplierLedger._id,
        customerLedger: newCustomerLedger._id,
      });
      await newIncomeStatement.save();

      console.log("saved newIncomeStatement");
      return successResponse(res, "Ticket issued successfully", updatebooking);
    } else {
      // Log bookingData if available for troubleshooting
      const warnings =
        bookingData?.AirTicketRS?.ApplicationResults?.Warning || [];

      const hasPriceExpired = warnings.some((w) =>
        w.SystemSpecificResults?.some((r) =>
          r.Message?.some((m) => m.content?.includes("PRICE QUOTE EXPIRED")),
        ),
      );
      if (hasPriceExpired) {
        console.log(
          "Your price quote has expired. Please re-price and try again.",
        );
        return errorResponse(
          res,
          "Your price quote has expired. Please re-price and try again.",
          400,
        );
      }
      console.error("Ticket issuance failed:", bookingData.AirTicketRS);
      return errorResponse(res, bookingData, 404);
    }
  } catch (error) {
    console.error("Error in issueTicket:", error); // Log detailed error
    return errorResponse(res, error);
  }
}
async function issueTicketOffline(req, res) {
  let bookingData;
  try {
    const {
      otp,
      userId,
      commission,
      country_code,
      pnr,
      number,
      travelers,
      flight,
      referenceNumber,
      totalPrice,
    } = req.body;
    const user = await User.findById(req.user._id);
    const agency = await Agency.findById(req.user.agencyId);
    // if (flight.isTicketed === true) {
    //   return errorResponse(res, "ticket is already issued", 409);
    // }
    // const otpValidationResult = await handleOtpAttempts(user, otp);

    // if (!otpValidationResult.success) {
    //   return res.status(otpValidationResult.status).json({
    //     error: otpValidationResult.message,
    //   });
    // }
    await ensureToken();

    // const findBookings = await Booking.findOne({ id: pnr });
    if (Number(agency.cashLimit) < Number(totalPrice)) {
      return errorResponse(
        res,
        "Insufficient balance. Please recharge your account.",
        404,
      );
    }
    // if (
    //   req.user.id !== findBookings.uniqueId &&
    //   req.user.role !== EUserRole.SUPERADMIN
    // ) {
    //   return errorResponse(
    //     res,
    //     "only the user created ticket can issue it",
    //     404
    //   );
    // }
    // const travellers = findBookings.travelers;
    const data = {
      AirTicketRQ: {
        DesignatePrinter: {
          Printers: {
            Ticket: {
              CountryCode: "PK",
            },
            Hardcopy: {
              LNIATA: `${process.env.SABRE_PRINTER_NUMBER}`,
            },
          },
        },
        Itinerary: {
          ID: pnr,
        },
        Ticketing: [
          {
            PricingQualifiers: {
              PriceQuote: [
                {
                  NameSelect: travelers.map((data, index) => ({
                    NameNumber: Number(`${index + 1}.1`),
                  })),
                  Record: [
                    {
                      Number: 1,
                      Reissue: false,
                    },
                  ],
                },
              ],
            },
            FOP_Qualifiers: {
              BasicFOP: {
                Type: "CA",
              },
            },
            MiscQualifiers: {
              Commission: {
                Percent: 0,
              },
            },
          },
        ],
        PostProcessing: {
          EndTransaction: {
            Source: {
              ReceivedFrom: `${SABRE.SABRE_PCC}`,
            },
            // Email: {
            //   eTicket: {
            //     PDF: {
            //       Ind: false,
            //     },
            //     Ind: true,
            //   },
            //   // PersonName: {
            //   //   NameNumber: "1.1",
            //   // },
            //   // PersonName: {
            //   //   NameNumber: "2.1",
            //   // },
            //   Ind: true,
            // },
          },
        },
      },
    };

    const amadeusResponse = await fetch(`${SABRE.BASE_URL}/v1.3.0/air/ticket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    bookingData = await amadeusResponse.json();
    // const errorDetails = await amadeusResponse.text();
    // if (!bookingData.ok) {
    //   return errorResponse(res, "Failed to issue ticket", bookingData);
    // }
    // Check if ticketing was successful
    if (bookingData?.AirTicketRS?.ApplicationResults?.status === "Complete") {
      // Group flights by fareConstructionDirection (e.g., OUTBOUND, INBOUND)
      const groupedFlights = flight.flights.reduce((acc, flight) => {
        const dir = flight.fareConstructionDirection || "UNKNOWN";
        if (!acc[dir]) acc[dir] = [];
        acc[dir].push(flight);
        return acc;
      }, {});

      // Build itineraries from grouped flights
      const itineraries = Object.values(groupedFlights).map((flightGroup) => ({
        duration: `${Math.floor(
          flightGroup.reduce((acc, f) => acc + f.durationInMinutes, 0) / 60,
        )}H${flightGroup.reduce((acc, f) => acc + f.durationInMinutes, 0) % 60
          }M`,
        segments: flightGroup.map((flight) => ({
          departure: {
            iataCode: flight?.fromAirportCode,
            terminal: "", // Add if available
            at: `${flight?.departureDate}T${flight?.departureTime}`,
          },
          arrival: {
            iataCode: flight?.toAirportCode,
            terminal: flight?.arrivalTerminalName || "",
            at: `${flight?.arrivalDate}T${flight?.arrivalTime}`,
          },
          carrierCode: flight?.operatingFlightNumber,
          number: flight?.flightNumber.toString(),
          aircraft: {
            code: flight?.aircraftTypeCode,
          },
          duration: `${Math.floor(flight?.durationInMinutes / 60)}H${flight?.durationInMinutes % 60
            }M`,
          bookingStatus: flight?.flightStatusName,
          segmentType: "FLIGHT",
          isFlown: false,
          operating: {
            carrierCode: flight?.operatingAirlineCode,
          },
          id: flight.itemId,
          numberOfStops: 0,
          blacklistedInEU: false,
        })),
      }));
      const travellers = flight?.travelers.map((traveler, index) => ({
        id: (index + 1).toString(), // Traveler ID as "1", "2", etc.
        dateOfBirth: traveler?.dateOfBirth,
        name: {
          firstName: traveler?.givenName?.toUpperCase(),
          lastName: traveler?.surname?.toUpperCase(),
        },
        ...(traveler?.identityDocuments?.length && {
          gender: traveler?.identityDocuments?.[0].gender,
          documents: [
            {
              number: traveler?.identityDocuments?.[0].documentNumber,
              expiryDate: traveler?.identityDocuments?.[0].expiryDate,
              issuanceCountry:
                traveler?.identityDocuments?.[0].issuingCountryCode,
              documentType:
                traveler.identityDocuments?.[0].documentType === "P"
                  ? "passport"
                  : "CNIC",
              holder: traveler?.identityDocuments?.[0].isPrimaryDocumentHolder,
            },
          ],
        }),
        // travelerType: traveler.passengerCode,
        // ticketNumber: "bookingData.AirTicketRS?.Summary?.[index]?.DocumentNu"mber",
        ticketNumber:
          bookingData?.AirTicketRS?.Summary?.[index]?.DocumentNumber,
      }));
      const newBooking = new Booking({
        api: "Sabre",
        id: pnr,
        reference: referenceNumber,
        status: "confirmed",
        bookingType: req?.body?.bookingType,
        isTicketed: true,
        userId: req.user._id,
        agencyId: req.user.agencyId,
        finalPrice: Number(totalPrice),
        totalTax: Number(flight?.payments?.flightTotals?.[0]?.taxes || 0),
        orignalPrice: Number(flight?.payments?.flightTotals?.[0]?.total || 0),
        markupAmount: Number(flight?.markup || 0),
        taxes:
          flight?.fares?.[0]?.taxBreakdown?.map((tax) => ({
            amount: tax?.taxAmount?.amount,
            code: tax?.taxCode,
          })) || [],
        flightOffers: [
          {
            id: pnr,
            source: "Sabre",
            numberOfBookableSeats: flight?.flights?.[0]?.numberOfSeats || 0,
            itineraries: itineraries,
            price: {
              currency: flight?.fares?.[0].totals?.currencyCode,
              total: flight?.fares?.[0].totals?.total,
              base: flight?.fares?.[0].totals?.subtotal,
              grandTotal: flight?.fares?.[0].totals.total,
            },
            validatingAirlineCodes: [flight?.flights?.[0].airlineCode],
            travelerPricings: [
              {
                travelerId: "1",
                travelerType: flight?.travelers?.[0].passengerCode,
                price: {
                  currency: flight?.fares?.[0].totals?.currencyCode,
                  total: flight?.fares?.[0].totals?.total,
                  base: flight?.fares?.[0].totals?.subtotal,
                },
                fareDetailsBySegment: [
                  {
                    segmentId: flight?.flights?.[0].itemId,
                    cabin: flight?.flights?.[0].cabinTypeCode,
                    fareBasis:
                      flight?.fares?.[0].fareConstruction?.[0].fareBasisCode,
                    class: flight?.flights?.[0].bookingClass,
                    includedCheckedBags: {
                      weight:
                        flight?.fareOffers?.[0].checkedBaggageAllowance
                          .totalWeightInKilograms,
                      weightUnit: "KG",
                    },
                  },
                ],
              },
            ],
          },
        ],
        travelers: travellers,
      });
      await newBooking.save();
      console.log("detucting the amount from the wallet...... ");
      if (
        user.role === EUserRole.AGENCY ||
        user.role === EUserRole.SUPERADMIN
      ) {
        console.log(`detucting the amount from agency`);

        await Agency.findByIdAndUpdate(
          agency._id,
          { $inc: { cashLimit: -Number(totalPrice) } },
          { new: true, runValidators: true },
        );
      } else {
        console.log(`detucting the amount  agent ${user.role}`);

        await User.findByIdAndUpdate(
          user._id,
          { $inc: { allocatedBalance: -Number(findBookings.finalPrice) } },
          { new: true, runValidators: true },
        );
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // let spo;
      // if (updatebooking.userId) {
      //   const finduser = await User.findOne({ _id: updatebooking.userId });
      //   if (finduser.assignedSPO) {
      //     spo = finduser.assignedSPO;
      //   }
      // }
      // // Save Customer Ledger Entry (Final Price)
      // const newCustomerLedger = new CustomerLedger({
      //   customerName: updatebooking.travelers[0].name,
      //   spo: spo,
      //   ticketNumber: updatebooking.travelers[0].ticketNumber,
      //   amount:
      //     Number(updatebooking.finalPrice) + Number(updatebooking.commission),
      //   payMode: "CASH",
      //   supplierType: updatebooking.api,
      //   type: "credited",
      // });
      // await newCustomerLedger.save();
      // console.log("saved newCustomerLedger");

      // // Save Supplier Ledger Entry (Original Price)
      // const newSupplierLedger = new SupplierLedger({
      //   supplierName: updatebooking.api,
      //   amount: updatebooking.orignalPrice,
      //   payMode: "CASH",
      //   spo: spo,
      //   type: "credited",
      // });
      // await newSupplierLedger.save();
      // console.log("saved newSupplierLedger");
      // let total = 0;

      // if (updatebooking.markupType === "percentage") {
      //   total =
      //     Number(updatebooking.finalPrice) - Number(updatebooking.orignalPrice);
      // } else {
      //   total = Number(updatebooking.markupAmount); // Fixed markup amount
      // }

      // // Save Income Statement Entry (Markup)
      // const newIncomeStatement = new IncomeStatement({
      //   spo: spo,
      //   amount: total,
      //   // description: `Markup from ticket ${ticketNumber}`,
      //   supplierLedger: newSupplierLedger._id,
      //   customerLedger: newCustomerLedger._id,
      // });
      // await newIncomeStatement.save();

      console.log("saved newIncomeStatement", bookingData);
      return successResponse(res, "Ticket issued successfully", bookingData);
    } else {
      // Log bookingData if available for troubleshooting
      console.error("Ticket issuance failed:", bookingData.AirTicketRS);
      return errorResponse(res, bookingData, 404);
    }
  } catch (error) {
    return errorResponse(res, `${error} error ${bookingData}`);
  }
}
async function issueTickett(Nada, us, res) {
  try {
    const { otp, userId, commission } = Nada;
    const user = await User.findById(us._id);
    const agency = await Agency.findById(us.agencyId);

    await ensureToken();
    const { country_code, pnr, number } = Nada;

    const findBookings = await Booking.findOne({ id: pnr });
    if (Number(agency.cashLimit) < Number(findBookings.finalPrice)) {
      console.log("Insufficient balance.");
      return {
        status: 500,
        data: "Insufficient balance. Please recharge your account.",
      };
    }
    // if (
    //   req.user.id !== findBookings.uniqueId &&
    //   req.user.role !== EUserRole.SUPERADMIN
    // ) {
    //   return errorResponse(
    //     res,
    //     "only the user created ticket can issue it",
    //     404
    //   );
    // }
    const travellers = findBookings.travelers;
    const data = {
      AirTicketRQ: {
        DesignatePrinter: {
          Printers: {
            Ticket: {
              CountryCode: "PK",
            },
            Hardcopy: {
              LNIATA: `${process.env.SABRE_PRINTER_NUMBER}`,
            },
          },
        },
        Itinerary: {
          ID: pnr,
        },
        Ticketing: [
          {
            PricingQualifiers: {
              PriceQuote: [
                {
                  NameSelect: travellers.map((data, index) => ({
                    NameNumber: Number(`${index + 1}.1`),
                  })),
                  Record: [
                    {
                      Number: 1,
                      Reissue: false,
                    },
                  ],
                },
              ],
            },
            FOP_Qualifiers: {
              BasicFOP: {
                Type: "CA",
              },
            },
            MiscQualifiers: {
              Commission: {
                Percent: 0,
              },
            },
          },
        ],
        PostProcessing: {
          EndTransaction: {
            Source: {
              ReceivedFrom: `${SABRE.SABRE_PCC}`,
            },
            // Email: {
            //   eTicket: {
            //     PDF: {
            //       Ind: false,
            //     },
            //     Ind: true,
            //   },
            //   // PersonName: {
            //   //   NameNumber: "1.1",
            //   // },
            //   // PersonName: {
            //   //   NameNumber: "2.1",
            //   // },
            //   Ind: true,
            // },
          },
        },
      },
    };
    const findbooking = await Booking.findOne({ id: pnr });

    if (!findbooking) {
      console.log("!findbooking");

      return { status: 500, data: "Data not available in the database" };
    }
    const amadeusResponse = await fetch(`${SABRE.BASE_URL}/v1.3.0/air/ticket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const bookingData = await amadeusResponse.json();
    // let bookingData?.AirTicketRS?.ApplicationResults?.status =complete
    if (!amadeusResponse.ok) {
      console.log("!bookingData.ok");
      return { status: 500, data: bookingData };
    }
    // Check if ticketing was successful
    if (bookingData?.AirTicketRS?.ApplicationResults?.status === "Complete") {
      // console.log("bookingData", bookingData);
      const updatedTravelers = findbooking.travelers.map((traveler, index) => {
        console.log(
          "TICKET NUMBER",
          bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber,
        );
        const ticketInfo =
          bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber;
        return {
          ...traveler._doc,
          ticketNumber: ticketInfo,
        };
      });

      const updatebooking = await Booking.findByIdAndUpdate(
        findbooking._id,
        {
          commission: commission ? commission : 0,
          status: ETicketStatus.COMFIRMED,
          isTicketed: true,
          travelers: updatedTravelers,
        },
        { new: true, runValidators: true },
      );
      console.log("detucting the amount from the wallet...... ");
      const finalPrice = Number(findBookings.finalPrice);
      if (isNaN(finalPrice)) {
        return { status: 500, data: "Invalid finalPrice" };
      }
      if (
        user.role === EUserRole.AGENCY ||
        user.role === EUserRole.SUPERADMIN
      ) {
        console.log(`detucting the amount from agency`);
        let currentBalance = Number(agency.cashLimit); // convert DB value

        await Agency.findByIdAndUpdate(
          agency._id,
          { cashLimit: currentBalance - finalPrice },
          { new: true, runValidators: true },
        );
      } else {
        console.log(`detucting the amount  agent ${user.role}`);
        let currentBalance = Number(user.allocatedBalance); // convert DB value
        await User.findByIdAndUpdate(
          user._id,
          { allocatedBalance: currentBalance - finalPrice },
          { new: true, runValidators: true },
        );
      }
      let spo;
      if (updatebooking.userId) {
        const finduser = await User.findOne({ _id: updatebooking.userId });
        if (finduser.assignedSPO) {
          spo = finduser.assignedSPO;
        }
      }
      // Save Customer Ledger Entry (Final Price)
      const newCustomerLedger = new CustomerLedger({
        customerName: updatebooking.travelers[0].name,
        spo: spo,
        ticketNumber: updatebooking.travelers[0].ticketNumber,
        amount:
          Number(updatebooking.finalPrice) + Number(updatebooking.commission),
        payMode: "CASH",
        supplierType: updatebooking.api,
        bookingId: updatedTravelers._id,
        agencyId: user.agencyId,
        type: "credited",
      });
      await newCustomerLedger.save();
      console.log("saved newCustomerLedger");

      const newSupplierLedger = new SupplierLedger({
        supplierName: updatebooking.api,
        amount: updatebooking.orignalPrice,
        payMode: "CASH",
        spo: spo,
        type: "credited",
        bookingId: updatedTravelers._id,
        agencyId: user.agencyId,
      });
      await newSupplierLedger.save();
      console.log("saved newSupplierLedger");
      let total = 0;

      if (updatebooking.markupType === "percentage") {
        total =
          Number(updatebooking.finalPrice) - Number(updatebooking.orignalPrice);
      } else {
        total = Number(updatebooking.markupAmount); // Fixed markup amount
      }

      const newIncomeStatement = new IncomeStatement({
        spo: spo,
        amount: total,
        supplierLedger: newSupplierLedger._id,
        customerLedger: newCustomerLedger._id,
        bookingId: updatedTravelers._id,
        agencyId: user.agencyId,
      });
      await newIncomeStatement.save();

      console.log("saved newIncomeStatement");
      return { status: 200, data: updatebooking };
    } else {
      console.log("Ticket issuance failed:", bookingData);

      return { status: 500, data: bookingData };
    }
  } catch (error) {
    console.log("Error in issueTicket:");
    return { status: 500, data: error };
  }
}
async function bookAndIssueTicket(req, res) {
  try {
    console.log("Booking Result:", req.user);
    const bookingResult = await createBookingg(req.body, req.user);
    console.log("Booking Result:", bookingResult);

    if (bookingResult?.status !== 200) {
      return res.status(bookingResult?.status || 500).json({
        success: false,
        message: "Booking creation failed",
        error: bookingResult?.data || "Unknown error",
      });
    }

    // Extract PNR from booking response
    const pnr = bookingResult.data?.id;
    if (!pnr) {
      return res.status(500).json({
        success: false,
        message: "Booking successful but PNR missing in response",
      });
    }

    // Step 2: Issue Ticket
    req.body.pnr = pnr;
    const agency = await Agency.findById(req.user.agencyId);
    const user = await User.findById(req.user._id);
    const findBookings = await Booking.findOne({ id: pnr });
    console.log("CHECKING BALANCE.............................. ");
    if (user.role === EUserRole.AGENCY || user.role === EUserRole.SUPERADMIN) {
      console.log(`detucting the amount from agency`);

      if (Number(agency.cashLimit) < Number(findBookings.finalPrice)) {
        console.log("Insufficient balance.");
        console.log(`Insufficient balance for agency role${user.role}.`);

        return errorResponse(
          res,
          "Ticket is booked but, not issued due to insufficient balance. Please recharge your account.",
          404,
        );
      }
    } else {
      console.log(`detucting the amount  agent ${user.role}`);

      if (Number(user.allocatedBalance) < Number(findBookings.finalPrice)) {
        console.log(`Insufficient balance for user role${user.role}.`);
        return errorResponse(
          res,
          "Ticket is booked but, not issued due to insufficient balance. Please recharge your account.",
          404,
        );
      }
    }

    const ticketResult = await issueTickett(req.body, req.user);

    // Ensure the CreatePassengerNameRecordRS object exists before trying to set ItineraryRef
    ticketResult.CreatePassengerNameRecordRS =
      ticketResult.CreatePassengerNameRecordRS || {}; // Initialize if undefined
    ticketResult.CreatePassengerNameRecordRS.ItineraryRef =
      ticketResult.CreatePassengerNameRecordRS.ItineraryRef || {}; // Initialize if undefined

    // Now, safely assign the value to ItineraryRef.ID
    ticketResult.CreatePassengerNameRecordRS.ItineraryRef.ID =
      ticketResult.data.id;

    console.log("Ticket Issuance Result:", ticketResult);

    if (ticketResult?.status === 200) {
      return successResponse(res, "Ticket Issuance Result", ticketResult);
    }
    return errorResponse(res, "Ticket issuance failed", 404);
  } catch (error) {
    console.error("Error in bookAndIssueTicket:", error);
    return errorResponse(res, error);
  }
}

async function bookAndIssueMTicket(req, res) {
  try {
    console.log("req.user", req.user);
    console.log("req.body", req.body);
    const bookingResult = await createBookingMM(req.body, req.user);
    console.log("Booking Result:", bookingResult);
    console.log(
      "pnr",
      bookingResult?.CreatePassengerNameRecordRS?.ItineraryRef?.ID,
    );
    console.log("PNR", bookingResult?.data?.id);
    // return errorResponse(res,bookingResult,404)
    if (bookingResult?.status !== 200) {
      return res.status(bookingResult?.status || 500).json({
        success: false,
        message: "Booking creation failed",
        error: bookingResult || "Unknown error",
      });
    }

    // Extract PNR from booking response
    const pnr = bookingResult.data?.id;
    if (!pnr) {
      return res.status(500).json({
        success: false,
        message: "Booking successful but PNR missing in response",
      });
    }

    // Step 2: Issue Ticket
    req.body.pnr = pnr;
    const agency = await Agency.findById(req.user.agencyId);
    const findBookings = await Booking.findOne({ id: pnr });
    if (Number(agency.cashLimit) < Number(findBookings.finalPrice)) {
      console.log("Insufficient balance.");
      return errorResponse(
        res,
        "Ticket is booked but, not issued due to insufficient balance. Please recharge your account.",
        404,
      );
    }
    const ticketResult = await issueTickett(req.body, req.user);
    console.log("Ticket Issuance Result:", ticketResult);
    // Ensure the CreatePassengerNameRecordRS object exists before trying to set ItineraryRef
    ticketResult.CreatePassengerNameRecordRS =
      ticketResult.CreatePassengerNameRecordRS || {}; // Initialize if undefined
    ticketResult.CreatePassengerNameRecordRS.ItineraryRef =
      ticketResult.CreatePassengerNameRecordRS.ItineraryRef || {}; // Initialize if undefined

    // Now, safely assign the value to ItineraryRef.ID
    ticketResult.CreatePassengerNameRecordRS.ItineraryRef.ID =
      ticketResult.data.id;
    if (ticketResult?.status === 200) {
      return res.status(200).json(ticketResult);
    }

    return res.status(ticketResult?.status || 500).json({
      success: false,
      message: "Ticket issuance failed",
      error: ticketResult?.data || "Unknown error",
    });
  } catch (error) {
    console.error("Error in bookAndIssueTicket:", error);
    return errorResponse(res, error);
  }
}
async function finalizeBooking(req, res) {
  try {
    const agency = await Agency.findById(req.user.agencyId);
    const { pnr } = req.body;
    const data = {
      EndTransactionRQ: {
        version: "1.3.0", // API version (adjust if needed)
        EndTransaction: {
          Source: {
            ReceivedFrom: `${agency.agencyName}`, // Agency name for the booking source
          },
          Reservation: {
            PNR: `${pnr}`, // PNR for the reservation to confirm
            // Payment: paymentInfo, // Payment information for finalizing the booking
          },
          // Email: {
          //   Itinerary: {
          //     PDF: { Ind: true }, // Email itinerary PDF
          //     Ind: true, // Enable email for itinerary
          //   },
          //   Ind: true, // Enable email notifications for confirmation
          // },
          Ticketing: {
            IssueTicket: true, // Indicate that ticketing should be processed
            PaymentMethod: "CA", // Payment method (e.g., Credit Card)
          },
        },
      },
    };
    let nada = {
      agency: {
        contactInfo: {
          emails: ["shoaibjamil43@gmail.com"],
        },
      },
    };
    const amadeusResponse = await fetch(`${SABRE.BASE_URL}/v1.3.0/air/ticket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const bookingData = await amadeusResponse.json();
  } catch (error) { }
}

async function deleteBooking(req, res) {
  try {
    console.log("pnr", req.body.pnr);

    await ensureToken();

    const { pnr } = req.body;
    const booking = await Booking.findOne({ id: pnr });
    console.log(booking);
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }
    console.log("bookingId", booking.id);
    const body = {
      confirmationId: `${booking.id}`,
      retrieveBooking: true,
      cancelAll: true,
      errorHandlingPolicy: "HALT_ON_ERROR",

      // flightTicketOperation: "VOID",
      // errorHandlingPolicy: "HALT_ON_ERROR",
      // retrieveBooking: true,
      // cancelAll: true,
      // notification: {
      //   email: "INVOICE",
      // },
    };
    // return errorResponse(res, body, 503);
    const amadeusResponse = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/cancelBooking`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const errorDetails = await amadeusResponse.json();
    console.log("error", errorDetails);

    // if (errorDetails.errors[0].type === "NO_ITEMS_CANCELLED") {
    //   // const errorDetails = await amadeusResponse.text();
    //   return errorResponse(res, errorDetails, 404);
    // }
    console.log("error", errorDetails);
    console.log("error", errorDetails);
    if (!amadeusResponse.ok) {
      // const errorDetails = await amadeusResponse.text();
      return errorResponse(
        res,
        `Failed to delete booking: ${amadeusResponse.status} ${amadeusResponse.statusText}. Details: ${errorDetails}`,
        amadeusResponse.status,
      );
    }
    if (errorDetails.type === "NO_ITEMS_CANCELLED") {
      return errorResponse(
        res,
        `Failed to delete booking: ${amadeusResponse.status} ${amadeusResponse.statusText}. Details: ${errorDetails}`,
        amadeusResponse.status,
      );
    }
    // const agency = await Agency.findById(booking.agencyId);
    // if (!agency) {
    //   return errorResponse(res, "Agency not found", 404);
    // }

    // // Return credit to the agency's cash limit
    // agency.cashLimit += Number(booking.finalPrice);
    // await agency.save();

    // // Delete booking from database
    // await booking.deleteOne();
    await Booking.findByIdAndUpdate(
      booking._id,
      {
        status: ETicketStatus.CANCELLED,
      },
      { new: true },
    );
    return successResponse(res, errorDetails, 200);
  } catch (error) {
    console.error("Error deleting booking:", error);
    return errorResponse(res, error.message || "An error occurred", 500);
  }
}

async function repriceOrder(req, res) {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(req.user._id);
    const agency = await Agency.findById(req.user.agencyId);

    // const otpValidationResult = await handleOtpAttempts(user, otp);

    // if (!otpValidationResult.success) {
    //   return res.status(otpValidationResult.status).json({
    //     error: otpValidationResult.message,
    //   });
    // }
    await ensureToken();
    const { country_code, pnr, number } = req.body;

    // const findBookings = await Booking.findOne({ id: pnr });
    // if (Number(agency.cashLimit) < Number(findBookings.finalPrice)) {
    //   return errorResponse(
    //     res,
    //     "Insufficient balance. Please recharge your account.",
    //     404
    //   );
    // }
    // const travellers = findBookings.travelers;
    const data = {
      request: {
        orderId: `${pnr}`,
      },
    };

    const amadeusResponse = await fetch(
      `${SABRE.BASE_URL}/v1/offers/repriceOrder`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    console.log("sabre reprice", amadeusResponse);
    const bookingData = await amadeusResponse.json();
    // let bookingData?.AirTicketRS?.ApplicationResults?.status =complete
    // const errorDetails = await amadeusResponse.text();
    // if (!bookingData.ok) {
    //   return errorResponse(res, "Failed to issue ticket", errorDetails);
    // }
    // Check if ticketing was successful
    if (bookingData?.AirTicketRS?.ApplicationResults?.status === "Complete") {
      const findbooking = await Booking.findOne({ id: pnr });
      if (!findbooking) {
        return errorResponse(res, "Data not available in the database", 404);
      }
      // console.log("bookingData", bookingData);
      const updatedTravelers = findbooking.travelers.map((traveler, index) => {
        console.log(
          "TICKET NUMBER",
          bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber,
        );
        const ticketInfo =
          bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber;
        return {
          ...traveler._doc,
          ticketNumber: ticketInfo,
        };
      });
      console.log("updatedTravelers", updatedTravelers);
      console.log(" findbooking._id,", findbooking._id);

      const updatebooking = await Booking.findByIdAndUpdate(
        findbooking._id,
        {
          status: ETicketStatus.COMFIRMED,
          isTicketed: true,
          travelers: updatedTravelers,
        },
        { new: true, runValidators: true },
      );
      if (
        user.role === EUserRole.AGENCY ||
        user.role === EUserRole.SUPERADMIN
      ) {
        console.log("detucting the amount from the agency wallat...... ");
        await Agency.findByIdAndUpdate(
          agency._id,
          { $inc: { cashLimit: -Number(findbooking.finalPrice) } },
          { new: true, runValidators: true },
        );
      } else {
        console.log("detucting the amount from the agent wallat...... ");

        await User.findByIdAndUpdate(
          user._id,
          { $inc: { allocatedBalance: -Number(findbooking.finalPrice) } },
          { new: true, runValidators: true },
        );
      }

      return successResponse(res, "Ticket issued successfully", updatebooking);
    } else {
      // Log bookingData if available for troubleshooting
      console.error("Ticket issuance failed:", bookingData.AirTicketRS);
      return errorResponse(res, bookingData, 404);
    }
  } catch (error) {
    console.error("Error in issueTicket:", error); // Log detailed error
    return errorResponse(res, error);
  }
}

async function refundFlightTickets(req, res) {
  try {
    await ensureToken();

    const { bookingId } = req.body;
    console.log("bookingId", bookingId);

    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }
    console.log("booking", booking);

    // const ticketNumbers = booking.travelers
    //   .map((traveler) => traveler.ticketNumber)
    //   .filter((ticketNumber) => ticketNumber); // Ensure only valid ticket numbers are included
    const data = {
      errorHandlingPolicy: "HALT_ON_ERROR",
      targetPcc: `${SABRE.SABRE_PCC}`,
      // tickets: ticketNumbers.map((ticketNumber) => ({ number: ticketNumber })),
      notification: {
        email: "INVOICE",
      },
      confirmationId: booking.id,
      designatePrinters: [
        {
          ticket: {
            address: `${process.env.SABRE_PRINTER_NUMBER}`,
            countryCode: "PK",
            // "spacing": "1"
          },
        },
      ],
    };
    console.log("body", data);
    // return errorResponse(res, data, 404);
    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/refundFlightTickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    // Parse the response
    const amadeusResponse = await response.json();
    console.log("bookingData", amadeusResponse);

    if (!response.ok) {
      return errorResponse(
        res,
        `Failed to void PNR: ${response.status} ${response.statusText
        }. Details: ${JSON.stringify(amadeusResponse)}`,
        response.status,
      );
    }
    await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: ETicketStatus.REFUNDED,
      },
      { new: true },
    );
    return successResponse(
      res,
      "refundFlightTickets successfully",
      amadeusResponse,
    );
  } catch (error) {
    return errorResponse(res, error);
  }
}

async function voidFlightTickets(req, res) {
  try {
    await ensureToken();

    const { pnr } = req.body;

    const booking = await Booking.findOne({ id: pnr });
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    const data = {
      errorHandlingPolicy: "HALT_ON_ERROR",
      confirmationId: pnr,
      designatePrinters: [
        {
          ticket: {
            address: process.env.SABRE_PRINTER_NUMBER,
            countryCode: "PK",
          },
        },
      ],
    };

    console.log("🟦 voidFlightTickets request:", data);
    // return errorResponse(res, data, 400);
    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/voidFlightTickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const sabreResponse = await response.json();
    console.log("🟩 Sabre voidFlightTickets response:", sabreResponse);

    // If HTTP status is not OK
    if (!response.ok) {
      return errorResponse(
        res,
        `Failed to void PNR: ${response.status} ${response.statusText
        }. Details: ${JSON.stringify(sabreResponse)}`,
        response.status,
      );
    }

    // Check for logical/business errors in successful 200 response
    const errors = sabreResponse?.result?.errors || [];

    if (errors.length) {
      const err = errors[0];
      if (err.type === "TICKET_NOT_FOUND") {
        console.log("⚠️ Ticket not found — marking as VOIDED in DB anyway.");
      }
      if (err.type !== "TICKET_NOT_FOUND") {
        return errorResponse(
          res,
          `${err.type || "Error"}: ${err.description || "Unknown error"}`,
          400,
        );
      }
    }

    // ✅ No errors — fully successful case
    await Booking.findByIdAndUpdate(
      booking._id,
      { status: ETicketStatus.VOIDED },
      { new: true },
    );

    return successResponse(
      res,
      "PNR voidFlightTickets successfully",
      sabreResponse,
    );
  } catch (error) {
    console.error("❌ voidFlightTickets error:", error);
    return errorResponse(res, error.message || error, 500);
  }
}

async function checkFlightTickets(req, res) {
  try {
    await ensureToken();

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    const ticketNumbers = booking.travelers
      .map((traveler) => traveler.ticketNumber)
      .filter((ticketNumber) => ticketNumber); // Ensure only valid ticket numbers are included
    const data = {
      tickets: ticketNumbers.map((ticketNumber) => ({ number: ticketNumber })),
    };
    console.log("body", data);
    // Make the request to refundFlightTickets
    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/checkFlightTickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    // Parse the response
    const amadeusResponse = await response.json();
    console.log("bookingData", amadeusResponse);

    if (!response.ok) {
      return errorResponse(
        res,
        `Failed to void PNR: ${response.status} ${response.statusText
        }. Details: ${JSON.stringify(amadeusResponse)}`,
        response.status,
      );
    }

    return successResponse(
      res,
      "PNR checkFlightTickets successfully",
      amadeusResponse,
    );
  } catch (error) {
    return errorResponse(res, error);
  }
}
async function getAirportInfo(iataCode) {
  await ensureToken();

  console.log(`🔍 Fetching airport info for: ${iataCode}`);

  try {
    const response = await fetch(
      `${SABRE.BASE_URL}/v2/geo/autocomplete?query=${iataCode}&category=AIR&limit=1&clientId=704295`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,

          "Content-Type": "application/json",
        },
      },
    );

    console.log(`📡 Sabre API status for ${iataCode}:`, response.status);

    const data = await response.json();
    console.log(`📥 Raw Sabre response for ${iataCode}:`, JSON.stringify(data));

    const result = data?.grouped?.["category:AIR"]?.doclist?.docs?.[0];

    if (!result) {
      console.warn(`⚠ No airport data found for ${iataCode}`);
      return null;
    }

    console.log(`✅ Parsed airport data for ${iataCode}:`, {
      name: result.name,
      city: result.city,
      country: result.countryName,
    });

    return {
      name: result.name,
      city: result.city,
      country: result.countryName,
    };
  } catch (e) {
    console.error(`❌ Airport lookup failed for ${iataCode}:`, e);
    return null;
  }
}

// global cache (should be outside function)
const airportCache = {};

async function getCachedAirport(iata) {
  iata = (iata || "").trim().toUpperCase();

  if (!airportCache[iata]) {
    console.log(`🐌 Cache miss for ${iata}, fetching from API...`);
    airportCache[iata] = getAirportInfo(iata); // store PROMISE immediately
  } else {
    console.log(`⚡ Cache hit for ${iata}`);
  }

  return await airportCache[iata];
}

async function viewItinary(req, res) {
  try {
    await ensureToken();

    let { pnr } = req.body;
    const booking = await Booking.findOne({ id: pnr }).populate({
      path: "agencyId",
      select:
        "agencyName phoneNumber address city country timeZone poBoxNumber defaultCurrency agencyEmail logo",
    });
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }
    const data = {
      confirmationId: `${pnr}`,
    };
    //  return errorResponse(res,data, 400);
    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/getBooking `,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    const amadeusResponse = await response.json();
    let flightOffers;
    // return errorResponse(res, amadeusResponse, 404);
    if (amadeusResponse.errors?.[0]?.category === "ERROR") {
      return errorResponse(res, amadeusResponse.errors, 400);
    }
    if (!response.ok) {
      return errorResponse(
        res,
        `${amadeusResponse.message}`,
        amadeusResponse.status,
      );
    }
    let findBooking;
    if (!booking.flights) {
      findBooking = await Booking.findOne({ id: pnr });
      flightOffers = findBooking.flightOffers;
    }
    const flightData = [];

    for (const flights of flightOffers) {
      for (const itinerary of flights.itineraries) {
        const segmentsData = await Promise.all(
          itinerary.segments.map(async (segment) => {
            const [departureDate, departureTime] =
              segment.departure.at.split("T");
            const [arrivalDate, arrivalTime] = segment.arrival.at.split("T");

            const fromCode = segment.departure.iataCode;
            const toCode = segment.arrival.iataCode;

            const fromAirport = await getCachedAirport(fromCode);
            const toAirport = await getCachedAirport(toCode);
            const found = airlineLogos.find(
              (a) => a.arCode === segment.marketing.carrierCode,
            );
            return {
              fromAirportCode: fromCode,
              toAirportCode: toCode,
              fromAirport,
              toAirport,
              departureDate,
              arrivalDate,
              departureTime,
              arrivalTime,
              airlineName: found?.ar || null,
              airlineLogo: found?.logo,
              airlineCode: segment.marketing.carrierCode,
              flightNumber: segment.number,
              aircraftTypeName: "",
              cabinTypeName: segment.className,
              departureTerminalName: "",
              aircraftTypeCode: "",
            };
          }),
        );
        flightData.push(...segmentsData);
      }
    }

    const travellers = findBooking.travelers.map((traveller) => {
      // const [dateOfBirth, year] = traveller.dateOfBirth.split("T");
      console.log("HI", traveller);
      return {
        ticketNumber: traveller.ticketNumber,
        givenName: `${traveller.name.firstName} ${traveller.name.lastName}`,
        identityDocuments: [
          {
            birthDate: traveller.dateOfBirth,
            documentNumber: traveller?.documents[0]?.number || null,
            documentType:
              traveller.documents[0]?.documentType === "P"
                ? "PASSPORT"
                : traveller.documents[0]?.documentType || null,
            expiryDate: traveller.documents[0]?.expiryDate || null,
            gender: traveller.gender || null,
            // givenName: "MUHAMMAD MR",
            isPrimaryDocumentHolder: traveller.documents?.holder || null,
            issuingCountryCode: traveller.documents[0]?.nationality || null,
            residenceCountryCode: traveller.documents[0]?.nationality || null,
            surname: `${traveller.name.firstName} ${traveller.name.lastName}`,
          },
        ],
      };
    });
    const enrichSegments = async (segments) => {
      return await Promise.all(
        segments.map(async (segment) => {
          const fromCode =
            segment.OriginLocation?.LocationCode ||
            segment.departure?.iataCode ||
            segment.fromAirportCode;
          const toCode =
            segment.DestinationLocation?.LocationCode ||
            segment.arrival?.iataCode ||
            segment.toAirportCode;

          const fromAirport = await getCachedAirport(fromCode);
          const toAirport = await getCachedAirport(toCode);

          const airlineCode =
            segment.MarketingAirline?.carrierCode ||
            segment.marketing?.carrierCode ||
            segment.airlineCode;

          const found = airlineLogos.find((a) => a.arCode === airlineCode);

          return {
            ...segment,
            fromAirportCode: fromCode,
            toAirportCode: toCode,
            fromAirport,
            toAirport,
            airlineCode,
            airlineName: found?.ar || airlineCode,
            airlineLogo: found?.logo || null,
            cabinTypeName: segment.className || segment.classCode || "",
          };
        }),
      );
    };
    amadeusResponse.reference = booking._id;
    if (findBooking.api === "Sabre") {
      amadeusResponse.flights = flightData;
      amadeusResponse.type = findBooking.flightType;
      if (findBooking.departure && Array.isArray(findBooking.departure)) {
        amadeusResponse.departure = await enrichSegments(findBooking.departure);
      }

      if (findBooking.return && Array.isArray(findBooking.return)) {
        amadeusResponse.return = await enrichSegments(findBooking.return);
      }
      // if (!amadeusResponse.travelers) {
      //   console.log("sabre has no travellers");
      // }
      amadeusResponse.travelers = travellers;
    }
    const creationDate = amadeusResponse.creationDetails?.creationDate;

    if (!creationDate) {
      console.log("No creationDate found");
    }

    const bookingYear = creationDate
      ? creationDate.split("-")[0]
      : new Date().getFullYear().toString();
    const expiryInfo = extractExpiryFromADTK(
      amadeusResponse.specialServices,
      bookingYear,
    );

    if (expiryInfo) {
      const expiryDateObj = new Date(expiryInfo.expiryDateTime);

      amadeusResponse.paymentDeadline = expiryInfo;
      await Booking.findOneAndUpdate(
        { id: pnr },
        {
          ticketingTimeLimit: expiryDateObj,
          ticketingTimeLimitText: amadeusResponse.specialServices.find(
            (s) => s.code === "ADTK",
          )?.message,
        },
      );
    }
    amadeusResponse.agency = booking.agencyId;
    return successResponse(res, "view PNR successfully", {
      data: amadeusResponse,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}
function extractExpiryFromADTK(specialServices, year) {
  if (!specialServices) return null;

  const adtk = specialServices.find((s) => s.code === "ADTK");
  if (!adtk || !adtk.message) return null;

  const regex = /BY\s(\d{2}[A-Z]{3})\s(\d{4})/;
  const match = adtk.message.match(regex);

  if (!match) return null;

  const [_, datePart, timePart] = match;

  const day = datePart.substring(0, 2);
  const monthStr = datePart.substring(2);

  const months = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };

  const month = months[monthStr];
  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${timePart.substring(0, 2)}:${timePart.substring(2)}`;

  return {
    expiryDate: formattedDate,
    expiryTime: formattedTime,
    expiryDateTime: `${formattedDate}T${formattedTime}:00`,
  };
}
async function updatePNR(req, res) {
  try {
    await ensureToken();
    const { pnr } = req.body;
    const findBooking = await Booking.findOne({ id: pnr });
    if (!findBooking) {
      return errorResponse(res, "Booking not found with the given PNR", 404);
    }
    const data = {
      confirmationId: `${pnr}`,
    };
    console.log("body", data);

    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/getBooking`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    // Parse the response
    const amadeusResponse = await response.json();
    if (!response.ok) {
      // Check for specific error from Amadeus

      // Generic API error
      return errorResponse(
        res,
        `Failed to get Booking: ${response.status} ${response.statusText
        }. Details: ${JSON.stringify(amadeusResponse)}`,
        response.status,
      );
    }
    if (
      amadeusResponse.errors &&
      amadeusResponse.errors.some(
        (error) =>
          error.type === "BOOKING_NOT_FOUND" &&
          error.description === "Booking cannot be found",
      )
    ) {
      return errorResponse(res, `Booking not found on this  account`, 404);
    }
    if (
      amadeusResponse.errors &&
      amadeusResponse.errors.some(
        (error) => error.type === "UNAUTHORIZED_ACCESS",
      )
    ) {
      return errorResponse(res, amadeusResponse.errors[0].description, 404);
    }

    if (findBooking.status === "hold" && amadeusResponse.isTicketed === false) {
      return successResponse(res, "the status is same i.e hold", 204);
    }
    if (
      findBooking.status === "canceled" &&
      amadeusResponse.isTicketed === false
    ) {
      return successResponse(
        res,
        {
          message:
            "ticket is booked not issued but db contains cancelled status",
          ticketNumber: null,
          status: "hold",
        },
        200,
      );
    }
    if (
      findBooking.status === "confirmed" &&
      amadeusResponse.isTicketed === false
    ) {
      return successResponse(
        res,

        {
          message: "ticket is on hold but db contains confirmed status",
          ticketNumber: null,
          status: "hold",
        },
        200,
      );
    }
    const flightTickets = amadeusResponse.flightTickets || [];
    const lastTicket =
      flightTickets.length > 0 ? flightTickets[flightTickets.length - 1] : null;
    const status = lastTicket ? lastTicket.ticketStatusName : null;

    // const status =
    //   amadeusResponse?.flightTickets[amadeusResponse?.flightTickets?.length - 1]
    //     .ticketStatusName;
    if (findBooking.status === "hold" && status === "Issued") {
      const ticketNumber = amadeusResponse.flightTickets.map((data) => ({
        ticket: data.number,
      }));
      return successResponse(
        res,

        {
          message: "ticket is issued but db contains hold status",
          ticketNumber,
          status: "confirmed",
        },
        200,
      );
    }
    if (findBooking.status === "hold" && status === "Voided") {
      const ticketNumber = amadeusResponse.flightTickets.map((data) => ({
        ticket: data.number,
      }));
      return successResponse(
        res,

        {
          message: "ticket is Voided but db contains hold status",
          ticketNumber,
          status: "voided",
        },
        200,
      );
    }
    if (findBooking.status === "confirmed" && status === "Voided") {
      const ticketNumber = amadeusResponse.flightTickets.map((data) => ({
        ticket: data.number,
      }));
      return successResponse(
        res,

        {
          message: "ticket is Voided but db contains confirmed status",
          ticketNumber,
          status: "voided",
        },
        200,
      );
    }
    if (findBooking.status === "confirmed" && status === "Issued") {
      return successResponse(res, "the status is same i.e confirmed", 204);
    }
    if (findBooking.status === "voided" && status === "Issued") {
      const ticketNumber = amadeusResponse.flightTickets.map((data) => ({
        ticket: data.number,
      }));
      return successResponse(
        res,

        {
          message: "ticket is Issued but db contains voided status",
          ticketNumber,
          status: "confirmed",
        },
        200,
      );
    }
    if (findBooking.status === "voided" && status === "Voided") {
      return successResponse(res, "the status is same i.e Voided", 204);
    }
    if (
      findBooking.status === "voided" &&
      amadeusResponse.isTicketed === false
    ) {
      return successResponse(
        res,

        {
          message: "ticket is hold but db contains voided status",
          ticketNumber: null,
          status: "hold",
        },
        200,
      );
    }
    if (
      findBooking.status === "confirmed" &&
      amadeusResponse.isTicketed === false
    ) {
      return successResponse(
        res,
        "ticket is hold but db contains confirmed status",
        200,
      );
    } else {
      return errorResponse(
        res,
        "error occured contact administration department",
        400,
      );
    }
  } catch (error) {
    return errorResponse(res, error);
  }
}
async function updateStatus(req, res) {
  try {
    await ensureToken();
    const { pnr, status, ticket } = req.body;
    console.log("ticket", ticket);

    const findBooking = await Booking.findOne({ id: pnr });
    if (!findBooking) {
      return errorResponse(res, "Booking not found with the given PNR", 404);
    }
    console.log("Booking", findBooking);
    let updatedTravelers = findBooking.travelers;

    if (ticket && Array.isArray(ticket)) {
      if (ticket.length !== findBooking.travelers.length) {
        return errorResponse(
          res,
          "Number of ticket numbers does not match the number of travelers",
          400,
        );
      }
      updatedTravelers = findBooking.travelers.map((traveler, index) => {
        return {
          ...traveler._doc,
          ticketNumber: ticket[index].ticket.toString(),
        };
      });
    }
    console.log("updatedTravelers", updatedTravelers);
    const updateFields = { status };
    if (ticket) updateFields.travelers = updatedTravelers;

    const updatedBooking = await Booking.findByIdAndUpdate(
      findBooking._id,
      updateFields,
      { new: true },
    );

    return successResponse(res, "Booking updated successfully", updatedBooking);
  } catch (error) {
    return errorResponse(res, error);
  }
}
async function importPNR(req, res) {
  try {
    await ensureToken();
    const { pnr, staffMarkupValue, staffMarkupType } = req.body;

    console.log(pnr);
    const findBookings = await Booking.findOne({ id: pnr });
    if (findBookings) {
      return errorResponse(res, "PNR already exists", 400);
    }
    let airlineLogoMap = {};
    try {
      airlineLogo.forEach(({ arCode, logo, ar }) => {
        airlineLogoMap[arCode] = { ar, logo, arCode };
      });
    } catch (error) {
      console.error("Error processing airline logo data:", error);
    }
    // const findMakrup = await Markup.findOne({
    //   api: { $in: ["sabre", "all"] },
    //   status: "ACTIVE",
    // });
    const findMakrup = await Markup.find({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });
    if (findMakrup) {
      let markupType = findMakrup.markupType;
    }
    const findBooking = await Booking.findOne({ id: pnr });
    const findAgency = await Agency.findOne({ _id: req.user.agencyId });

    // if (findBooking) {
    //   return errorResponse(res, "PNR already exists in the database", 200);
    // }

    const data = {
      confirmationId: `${pnr}`,
      targetPcc: `${SABRE.SABRE_PCC}`,
    };

    // const data = {
    //   confirmationId: "FSPDZN",
    //   bookingSource: "SABRE",
    //   targetPcc: "0BJL",
    //   givenName: "ALI",
    //   surname: "EMAN",
    //   // returnOnly: ["FLIGHTS"],
    //   extraFeatures: {
    //     returnFrequentRenter: false,
    //     returnWalletFormsOfPayment: false,
    //     returnFiscalId: false,
    //     returnEmptySeatObjects: true,
    //   },
    //   unmaskPaymentCardNumbers: false,
    // };
    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/getBooking`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const amadeusResponse = await response.json();

    // Handle warnings and errors
    if (amadeusResponse.errors) {
      const hasWarnings = amadeusResponse.errors.some(
        (error) => error.category === "WARNING",
      );
      const hasErrors = amadeusResponse.errors.some(
        (error) => error.category !== "WARNING",
      );

      if (hasErrors) {
        const errors = amadeusResponse.errors.filter(
          (error) => error.category !== "WARNING",
        );
        console.error("Errors from Sabre API:", errors);
        return errorResponse(res, errors, 404);
      }

      if (hasWarnings) {
        console.warn("Warnings from Sabre API:", amadeusResponse.errors);
        // if (
        //   amadeusResponse.errors[0].description ===
        //   "FareRules can not be populated because the ticket is voided, refunded or exchanged."
        // ) {
        //   return errorResponse(res, amadeusResponse.errors[0].description);
        // }
      }
    }
    if (!amadeusResponse?.flights) {
      return errorResponse(res, "No flights available", 404);
    }
    // if (!amadeusResponse.fareRules) {
    //   return errorResponse(res, "fare rules not available", 404);
    // }
    if (!amadeusResponse?.payments?.flightTotals) {
      return errorResponse(res, "No price quote available", 404);
    }
    let totalFare = 0;

    amadeusResponse.fares.forEach((fare) => {
      totalFare += parseFloat(fare.totals.total);
    });
    let basePrice = 0;
    basePrice = amadeusResponse?.fares
      ? parseFloat(amadeusResponse?.fares?.[0]?.totals.total)
      : 0;
    const adjustedPrice = calculateAdjustedPrice(
      totalFare,
      findMakrup,
      staffMarkupValue || 0,
      staffMarkupType || 0,
    );
    function calculateMarkups(staffMarkupValue, staffMarkupType, agencyMarkup) {
      let totalMarkup = 0;

      // Add agency markup if provided
      if (agencyMarkup) {
        const agencyMarkupAmount =
          agencyMarkup.type === "percentage"
            ? (totalMarkup * Number(agencyMarkup.value)) / 100
            : Number(agencyMarkup.value);
        totalMarkup += agencyMarkupAmount;
      }

      // Add staff markup if provided
      if (staffMarkupValue) {
        const staffMarkupAmount =
          staffMarkupType === "percentage"
            ? (totalMarkup * Number(staffMarkupValue)) / 100
            : Number(staffMarkupValue);
        totalMarkup += staffMarkupAmount;
      }

      // Return the combined markup
      return totalMarkup.toFixed(2); // Format to two decimal places
    }

    // Add adjusted price to the response
    amadeusResponse.markup = calculateMarkups(
      findMakrup,
      staffMarkupValue || 0,
      staffMarkupType || 0,
    );
    amadeusResponse.fares[0].totals.total = adjustedPrice.toFixed(3);

    if (amadeusResponse.flights) {
      amadeusResponse.flights.forEach((flight) => {
        const airlineData = airlineLogoMap[flight.operatingAirlineCode] || {
          arCode: flight.airlineCode,
          logo: "default_logo_url",
        };
        flight.logo = airlineData.logo;
      });
    }

    return successResponse(res, "Import PNR from Sabre API", amadeusResponse);
  } catch (error) {
    return errorResponse(res, error);
  }
}

async function modifyPNR(req, res) {
  try {
    await ensureToken();
    const agency = await Agency.findById(req.user.agencyId);

    const { pnr, documentDetails, staffMarkupValue, staffMarkupType } =
      req.body;
    const { bookingSignature, travelers, request } = req.body.data;

    let markupType, markupAmount;
    const findBooking = await Booking.findOne({ id: pnr });
    // if (findBooking) {
    //   return errorResponse(res, "PNR already exixts", 400);
    // }
    // Fetch agency details
    const findAgency = await Agency.findOne({ _id: req.user.agencyId });

    // Fetch markup details
    const findMakrup = await Markup.findOne({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });

    if (findMakrup) {
      markupType = findMakrup.markupType;
      markupAmount = findMakrup.markupValue;
    }

    // Prepare the data object
    const data = {
      confirmationId: request?.confirmationId || null,
      bookingSignature,
      targetPcc: "0BJL",
      before: {},
      after: {
        payments: {
          formsOfPayment: [{ type: "CASH" }],
        },
        travelers: Array.isArray(travelers)
          ? travelers.map((data, index) => ({
            givenName: data.givenName?.toUpperCase(),
            surname: data.surname?.toUpperCase(),
            type: data.type,
            passengerCode: data.passengerCode,
            birthDate: documentDetails?.[index]?.dateOfBirth || null,
            identityDocuments: documentDetails?.[index]
              ? [
                {
                  residenceCountryCode:
                    documentDetails[index]?.validityCountry || "",
                  gender: documentDetails[index]?.gender || "",
                  issuingCountryCode:
                    documentDetails[index]?.issuanceCountry || "",
                  documentType: documentDetails[index]?.documentType || "",
                  documentNumber: documentDetails[index]?.number || "",
                  expiryDate: documentDetails[index]?.expiryDate || "",
                  isPrimaryDocumentHolder:
                    documentDetails[index]?.holder || false,
                  givenName: data.givenName?.toUpperCase(),
                  surname: data.surname?.toUpperCase(),
                  birthDate: documentDetails[index]?.dateOfBirth || "",
                },
              ]
              : [],
          }))
          : [],
      },
      retrieveBooking: true,
      receivedFrom: findAgency?.agencyName || "Unknown Agency",
    };

    if (!data.confirmationId) {
      return errorResponse(res, "Missing confirmation ID", 400);
    }

    // Call Sabre API
    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/modifyBooking`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const sabreResponse = await response.json();
    return errorResponse(res, sabreResponse, 400);

    if (sabreResponse.errors) {
      return errorResponse(res, sabreResponse, 400);
    }
    // return successResponse(res, sabreResponse, sabreResponse);
    const flightOffers = {
      itineraries: {
        segments: [],
      },
    };
    if (!response.ok) {
      return errorResponse(
        res,
        `Failed to modify booking: ${response.status} ${response.statusText
        }. Details: ${JSON.stringify(sabreResponse)}`,
        response.status,
      );
    }
    const bookingId = sabreResponse.bookingId;
    // Process response
    let status = null,
      ticketing,
      ticketNumber;
    if (sabreResponse.isTicketed === false) {
      status = "hold";
      ticketNumber = null;
      ticketing = false;
    } else if (sabreResponse.isTicketed === true) {
      const sabreStatus =
        sabreResponse?.flightTickets?.[sabreResponse.flightTickets.length - 1]
          ?.ticketStatusName || "";

      if (sabreStatus === "Issued") {
        ticketNumber = sabreResponse.flightTickets.map((data) => ({
          ticket: data.number,
        }));
        status = "confirmed";
        ticketing = true;
      } else if (sabreStatus === "Voided") {
        ticketNumber = sabreResponse.flightTickets.map((data) => ({
          ticket: data.number,
        }));
        status = "voided";
        ticketing = true;
      }
    }

    const traveler = Array.isArray(sabreResponse.travelers)
      ? sabreResponse.travelers.map((traveler, index) => ({
        id: `${index + 1}`,
        dateOfBirth: traveler.identityDocuments[0].birthDate,
        gender: traveler.identityDocuments[0].gender,
        name: {
          firstName: traveler.givenName,
          lastName: traveler.surname,
        },
        documents: Array.isArray(traveler.identityDocuments)
          ? traveler.identityDocuments.map((doc) => ({
            number: doc.documentNumber,
            issuanceCountry: doc.issuingCountryCode,
            nationality: doc.residenceCountryCode,
            expiryDate: doc.expiryDate,
            // issuanceDate: doc.issuanceDate,
            // birthPlace: doc.birthPlace,
            documentType: doc.documentType,
            holder: doc.isPrimaryDocumentHolder,
          }))
          : [],
      }))
      : [];

    if (Array.isArray(sabreResponse.flights)) {
      sabreResponse.flights.forEach((flight) => {
        flightOffers.itineraries.segments.push({
          departure: {
            iataCode: flight.fromAirportCode,
            at: `${flight.departureDate}T${flight.departureTime}`,
          },
          arrival: {
            iataCode: flight.toAirportCode,
            at: `${flight.arrivalDate}T${flight.arrivalTime}`,
          },
          carrierCode: flight.flightNumber,
          number: flight.flightNumber,
          aircraft: {
            code: flight.aircraftTypeCode,
          },
          operating: {
            carrierCode: flight.operatingAirlineCode,
          },
        });
      });
    }

    const price = Array.isArray(sabreResponse.payments?.flightTotals)
      ? sabreResponse.payments.flightTotals.map((price) => ({
        currency: price.currencyCode,
        total: price.total,
        base: price.subtotal,
        grandTotal: price.total,
      }))
      : [];

    let basePrice = parseFloat(sabreResponse?.fares?.[0]?.totals?.total || 0);
    const adjustedPrice = calculateAdjustedPrice(
      basePrice,
      findMakrup,
      staffMarkupValue || 0,
      staffMarkupType || 0,
    );

    // Save booking to database
    const newBooking = new Booking({
      type: "flight",
      api: "Sabre",
      id: bookingId,
      isTicketed: sabreResponse.isTicketed,
      status,
      orignalPrice: basePrice,
      finalPrice: adjustedPrice,
      markupType,
      markupAmount,
      travelers: traveler,
      flightOffers,
      price,
    });
    // console.log("booking", bookingId, newBooking, sabreResponse);
    await newBooking.save();
    // const findBookings = await Booking.findOne({ id: pnr });
    // if (Number(agency.cashLimit) < Number(findBookings.finalPrice)) {
    //   return errorResponse(
    //     res,
    //     "Insufficient balance. Please recharge your account.",
    //     404
    //   );
    // }
    // console.log("dataaa", req.user._id, findBookings.uniqueId);
    // if (req.user._id !== findBookings.uniqueId) {
    //   return errorResponse(
    //     res,
    //     "only the user created ticket can issue it",
    //     404
    //   );
    // }
    // const travellers = findBookings.travelers;
    // const datas = {
    //   AirTicketRQ: {
    //     DesignatePrinter: {
    //       Printers: {
    //         Ticket: {
    //           CountryCode: "PK",
    //         },
    //         Hardcopy: {
    //           LNIATA: "BB7ECE",
    //         },
    //       },
    //     },
    //     Itinerary: {
    //       ID: pnr,
    //     },
    //     Ticketing: [
    //       {
    //         PricingQualifiers: {
    //           PriceQuote: [
    //             {
    //               NameSelect: travellers.map((data, index) => ({
    //                 NameNumber: Number(`${index + 1}.1`),
    //               })),
    //               Record: [
    //                 {
    //                   Number: 1,
    //                   Reissue: false,
    //                 },
    //               ],
    //             },
    //           ],
    //         },
    //         FOP_Qualifiers: {
    //           BasicFOP: {
    //             Type: "CA",
    //           },
    //         },
    //       },
    //     ],
    //     PostProcessing: {
    //       EndTransaction: {
    //         Source: {
    //           ReceivedFrom: `${SABRE.SABRE_PCC}`,
    //         },
    //         Email: {
    //           eTicket: {
    //             PDF: {
    //               Ind: false,
    //             },
    //             Ind: true,
    //           },
    //           // PersonName: {
    //           //   NameNumber: "1.1",
    //           // },
    //           // PersonName: {
    //           //   NameNumber: "2.1",
    //           // },
    //           Ind: true,
    //         },
    //       },
    //     },
    //   },
    // };

    // const amadeusResponse = await fetch(`${SABRE.BASE_URL}/v1.3.0/air/ticket`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${getAccessToken()}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(datas),
    // });

    // const bookingData = await amadeusResponse.json();
    // return successResponse(res, "bookingData", bookingData);
    // // let bookingData?.AirTicketRS?.ApplicationResults?.status =complete
    // // const errorDetails = await amadeusResponse.text();
    // // if (!bookingData.ok) {
    // //   return errorResponse(res, "Failed to issue ticket", errorDetails);
    // // }
    // // Check if ticketing was successful
    // if (bookingData?.AirTicketRS?.ApplicationResults?.status === "Complete") {
    //   const findbooking = await Booking.findOne({ id: pnr });
    //   if (!findbooking) {
    //     return errorResponse(res, "Data not available in the database", 404);
    //   }
    //   // console.log("bookingData", bookingData);
    //   const updatedTravelers = findbooking.travelers.map((traveler, index) => {
    //     console.log(
    //       "TICKET NUMBER",
    //       bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber
    //     );
    //     const ticketInfo =
    //       bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber;
    //     return {
    //       ...traveler._doc,
    //       ticketNumber: ticketInfo,
    //     };
    //   });
    //   console.log("updatedTravelers", updatedTravelers);
    //   console.log(" findbooking._id,", findbooking._id);

    //   const updatebooking = await Booking.findByIdAndUpdate(
    //     findbooking._id,
    //     {
    //       commission: commission ? commission : 0,
    //       status: ETicketStatus.COMFIRMED,
    //       isTicketed: true,
    //       travelers: updatedTravelers,
    //     },
    //     { new: true, runValidators: true }
    //   );
    //   console.log("detucting the amount from the wallet...... ");
    //   await Agency.findByIdAndUpdate(
    //     agency._id,
    //     { $inc: { cashLimit: -Number(findBookings.finalPrice) } },
    //     { new: true, runValidators: true }
    //   );

    //   return successResponse(res, "Ticket issued successfully", updatebooking);
    // } else {
    //   // Log bookingData if available for troubleshooting
    //   console.error("Ticket issuance failed:", bookingData.AirTicketRS);
    //   return errorResponse(res, bookingData, 404);
    // }
    return successResponse(res, "PNR imported Successfully", sabreResponse);
  } catch (error) {
    console.error("Error in modifyPNR:", error);
    return errorResponse(res, error);
  }
}

async function modifyPNRV2(req, res) {
  try {
    await ensureToken();
    const agency = await Agency.findById(req.user.agencyId);
    let infant_firstName, infant_lastname, infant_DOB, child_DOB, child_index;

    const { pnr, documentDetails, staffMarkupValue, staffMarkupType } =
      req.body;
    const { bookingSignature, travelers, request, flights } = req.body.data;
    let count = 0;
    travelers.map((data) => {
      if (data.type !== "INFANT") {
        count = count + 1;
      }
    });
    // Prepare passenger details
    const passengerNames = travelers.map((passenger, index) => {
      console.log("PASSENGER", passenger);
      infant_firstName =
        passenger.passengerCode === "INF"
          ? passenger.name.firstName.replace(" Mstr", "")
          : null;

      infant_lastname =
        passenger.passengerCode === "INF" ? passenger.name.lastName : null;
      {
        passenger.type === "INFANT"
          ? (infant_DOB = formatDate(passenger.dateOfBirth))
          : null;
      }
      {
        passenger.type === "CHILD"
          ? (child_DOB = formatDate(passenger.dateOfBirth))
          : null;
      }
      {
        passenger.type === "CHILD" ? (child_index = `${index + 1}.1`) : null;
      }
      return {
        NameNumber: `${index + 1}.1`,
        GivenName:
          passenger.passengerCode === "INF"
            ? "INF"
            : passenger.givenName?.toUpperCase(),

        Surname: passenger.surname?.toUpperCase(),
        // NameReference: `${passenger.name.firstName}${[index + 1]}`,
        PassengerType: passenger.passengerCode,
        NameReference:
          passenger.passengerCode === "CNN"
            ? `C${calculateAgeInYears(documentDetails[index].dateOfBirth)}`
            : passenger.passengerCode === "INF"
              ? `I${calculateAgeInMonths(documentDetails[index].dateOfBirth)}`
              : `A${calculateAgeInYears(documentDetails[index].dateOfBirth)}`,

        // Gender: passenger.gender || "M",
        Infant: passenger.type === "INFANT" ? true : false,
      };
    });
    let nada = [];
    let returnFlight = [];
    // flights.forEach((offer, index) => {
    //   if (offer.return) {
    //     offer.return.forEach((segment, segmentIndex) => {
    //       const arr1 = {
    //         DepartureDateTime: `${segment.departureDate}T${
    //           segment.departureTime
    //         }`,
    //         ArrivalDateTime: `${segment.arrivalDate}T${
    //           segment.arrivalTime
    //         }`,
    //         FlightNumber: String(segment.marketingFlightNumber),
    //         NumberInParty: String(count),
    //         // ResBookDesigCode: "Y",

    //         ResBookDesigCode: offer.bookingCode[0],
    //         MarriageGrp: "O",
    //         Status: "NN",
    //         DestinationLocation: {
    //           LocationCode: segment.arrivalLocation,
    //         },
    //         MarketingAirline: {
    //           Code: segment.marketingCarrier,
    //           FlightNumber: String(segment.marketingFlightNumber),
    //         },
    //         OriginLocation: {
    //           LocationCode: segment.departureLocation,
    //         },
    //       };

    //       returnFlight.push(arr1);
    //     });
    //   }
    // });
    // console.log("done return");

    flights.forEach((offer, index) => {
      const arr1 = {
        DepartureDateTime: `${offer.departureDate}T${offer.departureTime}`,
        ArrivalDateTime: `${offer.arrivalDate}T${offer.arrivalTime}`,
        FlightNumber: String(offer.operatingFlightNumber),
        NumberInParty: String(count),
        // ResBookDesigCode: "Y",

        ResBookDesigCode: offer.cabinTypeCode[0],
        Status: "NN",
        DestinationLocation: {
          LocationCode: offer.toAirportCode,
        },
        MarketingAirline: {
          Code: offer.operatingAirlineCode,
          FlightNumber: String(offer.operatingFlightNumber),
        },
        OriginLocation: {
          LocationCode: offer.fromAirportCode,
        },
      };

      nada.push(arr1);
    });
    console.log("done nada");

    let markupType, markupAmount;
    const findBooking = await Booking.findOne({ id: pnr });
    // if (findBooking) {
    //   return errorResponse(res, "PNR already exixts", 400);
    // }
    // Fetch agency details
    const findAgency = await Agency.findOne({ _id: req.user.agencyId });

    // Fetch markup details
    const findMakrup = await Markup.findOne({
      api: { $in: ["sabre", "all"] },
      status: "ACTIVE",
    });

    if (findMakrup) {
      markupType = findMakrup.markupType;
      markupAmount = findMakrup.markupValue;
    }
    const bodys = {
      UpdatePassengerNameRecordRQ: {
        version: "1.2.0",
        // targetCity: "0BJL",
        haltOnInvalidMCT: false,
        haltOnAirPriceError: false,
        Itinerary: {
          id: `${req.body.data.bookingId}`,
        },
        TravelItineraryAddInfo: {
          AgencyInfo: {
            Ticketing: { TicketType: "7TAW" },
            Address: {
              AddressLine: agency.address,
              CityName: agency.city,
              PostalCode: agency.poBoxNumber,
            },
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber: [
                {
                  NameNumber: "1.1",
                  Phone: agency.phoneNumber,
                  PhoneUseType: "A",
                },
              ],
            },
            PersonName: passengerNames,
          },
        },
        AirBook: {
          HaltOnStatus: [
            {
              Code: "HL",
            },
            {
              Code: "KK",
            },
            {
              Code: "LL",
            },
            {
              Code: "NN",
            },
            {
              Code: "NO",
            },
            {
              Code: "UC",
            },
            {
              Code: "US",
            },
          ],
          OriginDestinationInformation: {
            FlightSegment: nada,
          },
          RedisplayReservation: {
            NumAttempts: 10,
            WaitInterval: 300,
          },
        },
        AirPrice: [
          {
            PriceRequestInformation: {
              Retain: true,
              OptionalQualifiers: {
                FOP_Qualifiers: {
                  BasicFOP: {
                    Type: "CA",
                  },
                },
                PricingQualifiers: {
                  PassengerType: travelers.map((data) => ({
                    Code: data.passengerCode,
                    Quantity: "1",
                  })),
                },
              },
            },
          },
        ],
        SpecialReqDetails: {
          // AddRemark: {
          //   RemarkInfo: {
          //     FOP_Remark: {
          //       Type: "CASH",
          //     },
          //   },
          // },
          SpecialService: {
            SpecialServiceInfo: {
              SecureFlight: travelers.map((data, index) => ({
                SegmentNumber: "A",
                PersonName: {
                  DateOfBirth: documentDetails?.[index]?.dateOfBirth,
                  Gender:
                    getGenderCode(data.passengerCode) === "INF"
                      ? "FI"
                      : documentDetails?.[index]?.gender
                        ?.charAt(0)
                        ?.toUpperCase(),
                  NameNumber:
                    getGenderCode(data.passengerCode) === "INF"
                      ? "1.1"
                      : `${index + 1}.1`,
                  GivenName: data.givenName?.toUpperCase(),
                  Surname: data.surname?.toUpperCase(),
                },
                VendorPrefs: {
                  Airline: {
                    Hosted: true,
                  },
                },

                // Service: [
                //   ...(infant_firstName
                //     ? [
                //         {
                //           SSR_Code: "INFT",
                //           Text: `${infant_lastname}/${infant_firstName}/${infant_DOB}`,
                //           PersonName: {
                //             NameNumber: "1.1",
                //           },
                //         },
                //       ]
                //     : []),
                //   ...(child_DOB
                //     ? [
                //         {
                //           SSR_Code: "CHLD",
                //           Text: `${child_DOB}`,
                //           PersonName: { NameNumber: child_index },
                //         },
                //       ]
                //     : []),
                //   {
                //     SSR_Code: "CTCM",
                //     // Text: `${contact.phones?.[0].number}`,
                //     Text: `3003790375`,
                //     PersonName: {
                //       NameNumber: "1.1",
                //     },
                //   },
                //   {
                //     SSR_Code: "OTHS",
                //     Text: `CC ${travelers.givenName} ${travelers.surname}`,
                //   },

                //   // {
                //   //   SSR_Code: "CTCE",
                //   //   Text: `${data.emailAddress}`,
                //   //   PersonName: {
                //   //     NameNumber: "1.1",
                //   //   },
                //   // },
                //   // s,
                // ],
              })),
              Service: [
                {
                  SSR_Code: "OTHS",
                  Text: `CC FAHEEM MUHAMMAD`,
                },
              ],
              AdvancePassenger: travelers.map((passenger, index) => ({
                Document: {
                  IssueCountry: documentDetails[index].issuanceCountry,
                  NationalityCountry: documentDetails[index].nationality,
                  ExpirationDate: documentDetails[index].expiryDate,
                  Number: documentDetails[index].number,
                  Type:
                    documentDetails[index].documentType === "PASSPORT"
                      ? "P"
                      : "I",
                },
                PersonName: {
                  NameNumber: `${index + 1}.1`,
                  GivenName: passenger.givenName?.toUpperCase(),
                  Surname: passenger.surname?.toUpperCase(),
                  LapChild:
                    getGenderCode(passenger.passengerCode) === "INF"
                      ? true
                      : false,
                  Gender:
                    getGenderCode(passenger.passengerCode) === "INF"
                      ? `${documentDetails[index].gender
                        ?.charAt(0)
                        ?.toUpperCase()}I`
                      : documentDetails[index].gender?.charAt(0)?.toUpperCase(),
                  DateOfBirth: documentDetails[index].dateOfBirth,
                },
                SegmentNumber: "A",
              })),
            },
          },
        },
        PostProcessing: {
          EndTransaction: {
            ScheduleChange: {
              Ind: true,
            },
            Source: { ReceivedFrom: agency.agencyName || "API" },
            // Email: {
            //   Ind: true,
            // },
            // Email: {
            //   Itinerary: {
            //     PDF: {
            //       Ind: true,
            //     },
            //     Ind: true,
            //   },
            //   PersonName: {
            //     NameNumber: "1.1",
            //   },
            //   Ind: true,
            // },
          },
          RedisplayReservation: {},
        },
      },
    };
    // // Prepare the data object
    // const data = {
    //   confirmationId: request?.confirmationId || null,
    //   bookingSignature,
    //   targetPcc: "0BJL",
    //   before: {},
    //   after: {
    //     payments: {
    //       formsOfPayment: [{ type: "CASH" }],
    //     },
    //     travelers: Array.isArray(travelers)
    //       ? travelers.map((data, index) => ({
    //           givenName: data.givenName,
    //           surname: data.surname,
    //           type: data.type,
    //           passengerCode: data.passengerCode,
    //           birthDate: documentDetails?.[index]?.dateOfBirth || null,
    //           identityDocuments: documentDetails?.[index]
    //             ? [
    //                 {
    //                   residenceCountryCode:
    //                     documentDetails[index]?.validityCountry || "",
    //                   gender: documentDetails[index]?.gender || "",
    //                   issuingCountryCode:
    //                     documentDetails[index]?.issuanceCountry || "",
    //                   documentType: documentDetails[index]?.documentType || "",
    //                   documentNumber: documentDetails[index]?.number || "",
    //                   expiryDate: documentDetails[index]?.expiryDate || "",
    //                   isPrimaryDocumentHolder:
    //                     documentDetails[index]?.holder || false,
    //                   givenName: data.givenName,
    //                   surname: data.surname,
    //                   birthDate: documentDetails[index]?.dateOfBirth || "",
    //                 },
    //               ]
    //             : [],
    //         }))
    //       : [],
    //   },
    //   retrieveBooking: true,
    //   receivedFrom: findAgency?.agencyName || "Unknown Agency",
    // };

    // if (!data.confirmationId) {
    //   return errorResponse(res, "Missing confirmation ID", 400);
    // }

    // Call Sabre API
    const response = await fetch(
      `${SABRE.SABRE_IMPORTPNR}/v1.1.0/passenger/records?mode=update`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodys),
      },
    );

    const sabreResponse = await response.json();
    console.log("AAAAAAAAAAAAAAAAA0", sabreResponse);
    return successRes(res, bodys, 400);

    if (sabreResponse.errors) {
      return errorResponse(res, data, 400);
    }
    return successResponse(res, bodys, sabreResponse);
    const flightOffers = {
      itineraries: {
        segments: [],
      },
    };
    if (!response.ok) {
      return errorResponse(
        res,
        `Failed to modify booking: ${response.status} ${response.statusText
        }. Details: ${JSON.stringify(sabreResponse)}`,
        response.status,
      );
    }
    // if (
    //   sabreResponse.UpdatePassengerNameRecordRS.ApplicationResults.status ===
    //   "Complete"
    // ) {
    // }
    const bookingId = sabreResponse.bookingId;
    // Process response
    let status = null,
      ticketing,
      ticketNumber;
    // if (sabreResponse.isTicketed === false) {
    //   status = "hold";
    //   ticketNumber = null;
    //   ticketing = false;
    // } else if (sabreResponse.isTicketed === true) {
    //   const sabreStatus =
    //     sabreResponse?.flightTickets?.[sabreResponse.flightTickets.length - 1]
    //       ?.ticketStatusName || "";

    //   if (sabreStatus === "Issued") {
    //     ticketNumber = sabreResponse.flightTickets.map((data) => ({
    //       ticket: data.number,
    //     }));
    //     status = "confirmed";
    //     ticketing = true;
    //   } else if (sabreStatus === "Voided") {
    //     ticketNumber = sabreResponse.flightTickets.map((data) => ({
    //       ticket: data.number,
    //     }));
    //     status = "voided";
    //     ticketing = true;
    //   }
    // }

    const traveler = Array.isArray(sabreResponse.travelers)
      ? sabreResponse.travelers.map((traveler, index) => ({
        id: `${index + 1}`,
        dateOfBirth: traveler.identityDocuments[0].birthDate,
        gender: traveler.identityDocuments[0].gender,
        name: {
          firstName: traveler.givenName,
          lastName: traveler.surname,
        },
        documents: Array.isArray(traveler.identityDocuments)
          ? traveler.identityDocuments.map((doc) => ({
            number: doc.documentNumber,
            issuanceCountry: doc.issuingCountryCode,
            nationality: doc.residenceCountryCode,
            expiryDate: doc.expiryDate,
            // issuanceDate: doc.issuanceDate,
            // birthPlace: doc.birthPlace,
            documentType: doc.documentType,
            holder: doc.isPrimaryDocumentHolder,
          }))
          : [],
      }))
      : [];

    if (Array.isArray(sabreResponse.flights)) {
      sabreResponse.flights.forEach((flight) => {
        flightOffers.itineraries.segments.push({
          departure: {
            iataCode: flight.fromAirportCode,
            at: `${flight.departureDate}T${flight.departureTime}`,
          },
          arrival: {
            iataCode: flight.toAirportCode,
            at: `${flight.arrivalDate}T${flight.arrivalTime}`,
          },
          carrierCode: flight.flightNumber,
          number: flight.flightNumber,
          aircraft: {
            code: flight.aircraftTypeCode,
          },
          operating: {
            carrierCode: flight.operatingAirlineCode,
          },
        });
      });
    }

    const price = Array.isArray(sabreResponse.payments?.flightTotals)
      ? sabreResponse.payments.flightTotals.map((price) => ({
        currency: price.currencyCode,
        total: price.total,
        base: price.subtotal,
        grandTotal: price.total,
      }))
      : [];

    let basePrice = parseFloat(sabreResponse?.fares?.[0]?.totals?.total || 0);
    const adjustedPrice = calculateAdjustedPrice(
      basePrice,
      findMakrup,
      staffMarkupValue || 0,
      staffMarkupType || 0,
    );

    // Save booking to database
    const newBooking = new Booking({
      type: "flight",
      api: "Sabre",
      id: bookingId,
      isTicketed: sabreResponse.isTicketed,
      status,
      orignalPrice: basePrice,
      finalPrice: adjustedPrice,
      markupType,
      markupAmount,
      travelers: traveler,
      flightOffers,
      price,
    });
    // console.log("booking", bookingId, newBooking, sabreResponse);
    await newBooking.save();
    // const findBookings = await Booking.findOne({ id: pnr });
    // if (Number(agency.cashLimit) < Number(findBookings.finalPrice)) {
    //   return errorResponse(
    //     res,
    //     "Insufficient balance. Please recharge your account.",
    //     404
    //   );
    // }
    // console.log("dataaa", req.user._id, findBookings.uniqueId);
    // if (req.user._id !== findBookings.uniqueId) {
    //   return errorResponse(
    //     res,
    //     "only the user created ticket can issue it",
    //     404
    //   );
    // }
    // const travellers = findBookings.travelers;
    // const datas = {
    //   AirTicketRQ: {
    //     DesignatePrinter: {
    //       Printers: {
    //         Ticket: {
    //           CountryCode: "PK",
    //         },
    //         Hardcopy: {
    //           LNIATA: "BB7ECE",
    //         },
    //       },
    //     },
    //     Itinerary: {
    //       ID: pnr,
    //     },
    //     Ticketing: [
    //       {
    //         PricingQualifiers: {
    //           PriceQuote: [
    //             {
    //               NameSelect: travellers.map((data, index) => ({
    //                 NameNumber: Number(`${index + 1}.1`),
    //               })),
    //               Record: [
    //                 {
    //                   Number: 1,
    //                   Reissue: false,
    //                 },
    //               ],
    //             },
    //           ],
    //         },
    //         FOP_Qualifiers: {
    //           BasicFOP: {
    //             Type: "CA",
    //           },
    //         },
    //       },
    //     ],
    //     PostProcessing: {
    //       EndTransaction: {
    //         Source: {
    //           ReceivedFrom: `${SABRE.SABRE_PCC}`,
    //         },
    //         Email: {
    //           eTicket: {
    //             PDF: {
    //               Ind: false,
    //             },
    //             Ind: true,
    //           },
    //           // PersonName: {
    //           //   NameNumber: "1.1",
    //           // },
    //           // PersonName: {
    //           //   NameNumber: "2.1",
    //           // },
    //           Ind: true,
    //         },
    //       },
    //     },
    //   },
    // };

    // const amadeusResponse = await fetch(`${SABRE.BASE_URL}/v1.3.0/air/ticket`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${getAccessToken()}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(datas),
    // });

    // const bookingData = await amadeusResponse.json();
    // return successResponse(res, "bookingData", bookingData);
    // // let bookingData?.AirTicketRS?.ApplicationResults?.status =complete
    // // const errorDetails = await amadeusResponse.text();
    // // if (!bookingData.ok) {
    // //   return errorResponse(res, "Failed to issue ticket", errorDetails);
    // // }
    // // Check if ticketing was successful
    // if (bookingData?.AirTicketRS?.ApplicationResults?.status === "Complete") {
    //   const findbooking = await Booking.findOne({ id: pnr });
    //   if (!findbooking) {
    //     return errorResponse(res, "Data not available in the database", 404);
    //   }
    //   // console.log("bookingData", bookingData);
    //   const updatedTravelers = findbooking.travelers.map((traveler, index) => {
    //     console.log(
    //       "TICKET NUMBER",
    //       bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber
    //     );
    //     const ticketInfo =
    //       bookingData.AirTicketRS?.Summary?.[index]?.DocumentNumber;
    //     return {
    //       ...traveler._doc,
    //       ticketNumber: ticketInfo,
    //     };
    //   });
    //   console.log("updatedTravelers", updatedTravelers);
    //   console.log(" findbooking._id,", findbooking._id);

    //   const updatebooking = await Booking.findByIdAndUpdate(
    //     findbooking._id,
    //     {
    //       commission: commission ? commission : 0,
    //       status: ETicketStatus.COMFIRMED,
    //       isTicketed: true,
    //       travelers: updatedTravelers,
    //     },
    //     { new: true, runValidators: true }
    //   );
    //   console.log("detucting the amount from the wallet...... ");
    //   await Agency.findByIdAndUpdate(
    //     agency._id,
    //     { $inc: { cashLimit: -Number(findBookings.finalPrice) } },
    //     { new: true, runValidators: true }
    //   );

    //   return successResponse(res, "Ticket issued successfully", updatebooking);
    // } else {
    //   // Log bookingData if available for troubleshooting
    //   console.error("Ticket issuance failed:", bookingData.AirTicketRS);
    //   return errorResponse(res, bookingData, 404);
    // }
    return successResponse(res, "PNR imported Successfully", sabreResponse);
  } catch (error) {
    console.error("Error in modifyPNR:", error);
    return errorResponse(res, error);
  }
}
async function ticketStatus(req, res) {
  const { tkt } = req.body;
  await ensureToken(); // Ensure token is valid
  const ticket = {
    tickets: [
      {
        number: `${tkt}`,
      },
    ],
  };
  try {
    const response = await fetch(
      `${SABRE.BASE_URL}/v1/trip/orders/checkFlightTickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      },
    );
    console.log(response);
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error("ERROR", errorDetails.message);
    }
    const confirmationId = data.request.confirmationId;

    return successResponse(res, "ticket data fetched", data);
  } catch (error) {
    return errorResponse(res, error);
  }
}
async function ticketStatusFormDB(req, res) {
  const { ticketNo } = req.params; // Ticket number from request body
  console.log(ticketNo);
  try {
    // Find the booking by ticket number
    const booking = await Booking.findOne({
      "travelers.ticketNumber": ticketNo,
    })
      .populate({
        path: "userId", // Populate user details based on userId
        select: "firstName lastName email", // Select the required fields from the User model
      })
      .populate("flightOffers"); // Populate the flight offers details

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }
    // Extract marketing airline (validating airline code or carrier code from segments)
    let marketingAirline = "";
    if (booking.flightOffers.length > 0) {
      const firstOffer = booking.flightOffers[0];
      if (firstOffer.itineraries && firstOffer.itineraries.length > 0) {
        const firstSegment = firstOffer.itineraries[0].segments[0];
        marketingAirline = firstSegment.operating.carrierCode || "";
      }
    }
    // Prepare the data to send in the response
    const data = {
      pnr: booking.id,
      finalPrice: booking.finalPrice,
      GDS: booking.api,
      airline: marketingAirline,
      status: booking.status,
      orignalPrice: booking.orignalPrice,
      markupType: booking.markupType,
      markupAmount: booking.markupAmount,
      commission: booking.commission,
      userDetails: booking.userId,
      flightOffers: booking.flightOffers,
    };

    // Send the success response with the booking data
    return successResponse(res, "Ticket data fetched", data);
  } catch (error) {
    // Handle errors and send error response
    return errorResponse(res, error);
  }
}
async function getTicketsByMonth(req, res) {
  const { month, year } = req.query;
  const loginUser = req.user._id;
  const agencyId = req.user.agencyId;

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }
  if (!year) {
    return res.status(400).json({ message: "Year is required" });
  }

  const targetMonth = parseInt(month, 10);
  const targetYear = parseInt(year, 10);

  if (
    isNaN(targetMonth) ||
    isNaN(targetYear) ||
    targetMonth < 1 ||
    targetMonth > 12 ||
    targetYear < 1
  ) {
    return res.status(400).json({ message: "Invalid month or year" });
  }

  if (!targetMonth || !targetYear) {
    return errorResponse(res, "Invalid month or year", 400);
  }

  // Define start and end of the selected month
  const nada = getMonthStartAndEndDates(targetMonth, targetYear, true);
  const startDate = nada.startDate;
  const endDate = nada.endDate;

  // Helper to check if a date is inside selected month
  const isWithinMonth = (dateStr) => {
    const date = new Date(dateStr);
    return date >= startDate && date < endDate;
  };
  let bookings;
  try {
    if (req.user.role === "agency") {
      bookings = await Booking.find({
        "flightOffers.itineraries.segments.departure.at": {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
        agencyId: agencyId,
      })
        .populate("flightOffers")
        .populate("userId", "firstName lastName");
    } else if (req.user.role === "super_admin") {
      bookings = await Booking.find({
        "flightOffers.itineraries.segments.departure.at": {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      })
        .populate("flightOffers")
        .populate("userId", "firstName lastName");
    } else {
      bookings = await Booking.find({
        "flightOffers.itineraries.segments.departure.at": {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
        userId: loginUser,
      })
        .populate("flightOffers")
        .populate("userId", "firstName lastName");
    }
    bookings = bookings.filter((booking) => {
      // Check if the booking has valid flight segments within the required month and year
      return booking.flightOffers.some((offer) => {
        return offer.itineraries.some((itinerary) => {
          return itinerary.segments.some((segment) => {
            return (
              segment.departure &&
              segment.arrival &&
              isWithinMonth(segment.departure.at)
            );
          });
        });
      });
    });
    const dailyCounts = {};

    const result = bookings.reduce((acc, booking) => {
      let travelerName = "";
      let title = "";
      let ticketStatus = booking?.status;
      const totalTRavellers = booking.travelers.length - 1;
      console.log("totalTRavellers", totalTRavellers, booking.id);
      booking.travelers.map((data) => {
        const nameParts = data.name.firstName.split(" ");
        let firstNameOnly = nameParts[0];
        if (nameParts.length > 1) {
          title = nameParts[1];
        }
        travelerName = `${title} ${firstNameOnly} ${data.name.lastName}`;
      });

      const allRoutes = [];
      let bookingDate = "";
      let foundFirst = false;

      booking.flightOffers.forEach((offer) => {
        offer.itineraries.forEach((itinerary) => {
          itinerary.segments.forEach((segment) => {
            const dateTime = segment.departure.at;
            if (!foundFirst && isWithinMonth(dateTime)) {
              const arrivalDateTime = segment.arrival.at;
              const [date, time] = dateTime.split("T");
              const [adate, atime] = arrivalDateTime.split("T");

              bookingDate = date;
              dailyCounts[date] = (dailyCounts[date] || 0) + 1;
              foundFirst = true;

              allRoutes.push({
                from: segment.departure.iataCode,
                to: segment.arrival.iataCode,
                date,
                time: time?.slice(0, 5),
                arrivalTime: atime,
                arrivalDate: adate,
              });
            }
          });
        });
      });

      if (foundFirst) {
        acc.push({
          travelerName,
          pnr: booking.id,
          numberOfTravelers: totalTRavellers > 0 ? totalTRavellers : null,
          gds: booking.api,
          status: ticketStatus,
          bookingDate,
          routes: allRoutes,
        });
      }

      return acc;
    }, []);
    const allSegments = bookings
      .map((booking) => {
        const travelerNames = booking.travelers.map(
          (t) => `${t.name.firstName} ${t.name.lastName}`,
        );

        // Filter relevant segments by departure date
        const segments = booking.flightOffers.flatMap((offer) =>
          offer.itineraries.flatMap((itinerary) =>
            itinerary.segments
              .filter((segment) => isWithinMonth(segment.departure.at)) // Ensure the segment's departure time is within the selected month
              .map((segment) => ({
                from: segment.departure.iataCode,
                to: segment.arrival.iataCode,
                departureTime: segment.departure.at,
                arrivalTime: segment.arrival.at,
              })),
          ),
        );

        if (segments.length === 0) return null;

        return {
          travelerNames,
          segments,
        };
      })
      .filter(Boolean); // Remove null entries (bookings with no valid segments)

    const totalBookingsInMonth = bookings.length;
    const validResult = result.filter(Boolean); // Remove null entries (bookings with no valid segments)
    return successResponse(res, "Tickets fetched", {
      totalBookingsInMonth,
      bookings: result,
      totalBookingsPerDay: dailyCounts,
      allSegments,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Get fare rules for flight segments
 * Supports one-way, round-trip, and multicity flights with multiple hubs
 */
async function getFareRules(req, res) {
  try {
    const {
      adult = 0,
      child = 0,
      infant = 0,
      flightDetails = [],
      fareId,
      validatingCarrier,
      options = {},
      groupedItineraryResponse,
    } = req.body;

    // If groupedItineraryResponse is provided (Sabre shopping/pricing response), derive segments.
    let derivedFlights = flightDetails;
    let derivedAdult = adult;
    let derivedChild = child;
    let derivedInfant = infant;
    let derivedValidatingCarrier = validatingCarrier;
    if (groupedItineraryResponse) {
      const {
        buildFareRulesFromGroupedItineraryResponse,
        getFareRules: getFareRulesSoap,
      } = require("./sabreSoapService");
      const built = buildFareRulesFromGroupedItineraryResponse(
        groupedItineraryResponse,
      );
      if (built.flightDetails?.length) {
        derivedFlights = built.flightDetails;
      }
      if (!derivedValidatingCarrier && built.validatingCarrier) {
        derivedValidatingCarrier = built.validatingCarrier;
      }
      if (derivedAdult === 0 && derivedChild === 0 && derivedInfant === 0) {
        derivedAdult = built.paxCounts?.ADT || derivedAdult || 1;
        derivedChild = built.paxCounts?.CNN || 0;
        derivedInfant = built.paxCounts?.INF || 0;
      }

      // Proceed with derived data
      const fareRulesResponse = await getFareRulesSoap({
        adult: parseInt(derivedAdult) || 0,
        child: parseInt(derivedChild) || 0,
        infant: parseInt(derivedInfant) || 0,
        flightDetails: derivedFlights,
        fareId,
        validatingCarrier: derivedValidatingCarrier,
        options,
      });

      return successResponse(
        res,
        "Fare rules retrieved successfully",
        fareRulesResponse,
      );
    }

    // Validate required parameters when groupedItineraryResponse is not provided
    if (!derivedFlights || derivedFlights.length === 0) {
      return errorResponse(res, "Flight details are required", 400);
    }

    if (derivedAdult === 0 && derivedChild === 0 && derivedInfant === 0) {
      return errorResponse(res, "At least one passenger type is required", 400);
    }

    const { getFareRules: getFareRulesSoap } = require("./sabreSoapService");

    const fareRulesResponse = await getFareRulesSoap({
      adult: parseInt(derivedAdult) || 0,
      child: parseInt(derivedChild) || 0,
      infant: parseInt(derivedInfant) || 0,
      flightDetails: derivedFlights,
      fareId,
      validatingCarrier: derivedValidatingCarrier,
      options,
    });

    return successResponse(
      res,
      "Fare rules retrieved successfully",
      fareRulesResponse,
    );
  } catch (error) {
    console.error("Error in getFareRules controller:", error);
    return errorResponse(
      res,
      error.message || "Failed to retrieve fare rules",
      500,
    );
  }
}

/**
 * Build and fetch fare rules directly from a Sabre revalidate response payload.
 */
async function getFareRulesFromRevalidate(req, res) {
  try {
    const {
      groupedItineraryResponse,
      validatingCarrier,
      adult,
      child,
      infant,
      options = {},
    } = req.body;

    if (!groupedItineraryResponse) {
      return errorResponse(res, "groupedItineraryResponse is required", 400);
    }

    const {
      getFareRulesFromRevalidate: getFareRulesFromRevalidateSoap,
    } = require("./sabreSoapService");

    const fareRulesResponse = await getFareRulesFromRevalidateSoap({
      groupedItineraryResponse,
      validatingCarrier,
      adult,
      child,
      infant,
      options,
    });

    return successResponse(
      res,
      "Fare rules retrieved successfully",
      fareRulesResponse,
    );
  } catch (error) {
    console.error("Error in getFareRulesFromRevalidate controller:", error);
    return errorResponse(
      res,
      error.message || "Failed to retrieve fare rules",
      500,
    );
  }
}

/**
 * Get all brands pricing using SOAP AllBrandsPricingRQ
 * Supports one-way, round-trip, and multicity flights
 */
async function getAllBrandsPricing(req, res) {
  try {
    const {
      adult = 0,
      child = 0,
      infant = 0,
      flightDetails = [],
      options = {},
    } = req.body;

    // Validate required parameters
    if (!flightDetails || flightDetails.length === 0) {
      return errorResponse(res, "Flight details are required", 400);
    }

    if (adult === 0 && child === 0 && infant === 0) {
      return errorResponse(res, "At least one passenger type is required", 400);
    }

    const {
      getAllBrandsPricing: getAllBrandsPricingSoap,
    } = require("./sabreSoapService");

    const pricingResponse = await getAllBrandsPricingSoap({
      adult: parseInt(adult) || 0,
      child: parseInt(child) || 0,
      infant: parseInt(infant) || 0,
      flightDetails,
      options,
    });

    return successResponse(
      res,
      "Pricing retrieved successfully",
      pricingResponse,
    );
  } catch (error) {
    console.error("Error in getAllBrandsPricing controller:", error);
    return errorResponse(
      res,
      error.message || "Failed to retrieve pricing",
      500,
    );
  }
}

/**
 * Get fare rules using OTA_AirRulesRQ (alternative method)
 * Useful when you have fare basis code, date, class, and carrier
 */
async function getFareRulesOTA(req, res) {
  try {
    const {
      fareBasisCode,
      departureDate,
      classOfService,
      carrierCode,
      options = {},
    } = req.body;

    // Validate required parameters
    if (!fareBasisCode || !departureDate || !classOfService || !carrierCode) {
      return errorResponse(
        res,
        "fareBasisCode, departureDate, classOfService, and carrierCode are required",
        400,
      );
    }

    const {
      getFareRulesOTA: getFareRulesOTASoap,
    } = require("./sabreSoapService");

    const fareRulesResponse = await getFareRulesOTASoap({
      fareBasisCode,
      departureDate,
      classOfService,
      carrierCode,
      options,
    });

    return successResponse(
      res,
      "Fare rules retrieved successfully",
      fareRulesResponse,
    );
  } catch (error) {
    console.error("Error in getFareRulesOTA controller:", error);
    return errorResponse(
      res,
      error.message || "Failed to retrieve fare rules",
      500,
    );
  }
}

module.exports = {
  postSabreFlightData,
  postSabreCityData,
  createBooking,
  postSabreFlightDataM,
  deleteBooking,
  revalidateItinerary,
  issueTicket,
  refundFlightTickets,
  voidFlightTickets,
  viewItinary,
  checkFlightTickets,
  updatePNR,
  updateStatus,
  importPNR,
  modifyPNR,
  modifyPNRV2,
  repriceOrder,
  createBookingM,
  ticketStatus,
  ticketStatusFormDB,
  bookAndIssueTicket,
  bookAndIssueMTicket,
  issueTicketOffline,
  getTicketsByMonth,
  // getPDF,
  getBookingWithLogos,
  getFareRules,
  getFareRulesFromRevalidate,
  getFareRulesOTA,
  getAllBrandsPricing,
};
