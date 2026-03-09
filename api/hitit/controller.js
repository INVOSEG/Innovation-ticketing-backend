const {
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
} = require("./hititNdcService");
const {
  convertHititAirShoppingToJson,
  convertHititOrderViewToJson,
  mapHititAirShoppingToTickets,
  convertHititOrderFareToJson,
  convertHititOrderChangeToJson
} = require("./hititMapper");
const { sendResponse, errReturned } = require("../../lib/utils/dto");
const Booking = require("../../lib/schema/booking.schema");
const FlightMetadata = require("../../lib/schema/flightMetadata.schema");
const { ETicketStatus, EPaidStatus, EResponseCode } = require("../../lib/utils/enum");
const { successResponse } = require("../../lib/utils/success");

/**
 * Get general parameters (currencies, cabin classes, trip types, etc.)
 */
async function getGeneralParams(req, res) {
  try {
    const result = await doGeneralParams();
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "General parameters retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in getGeneralParams:", error);
    return errReturned(
      res,
      error.message || "Failed to retrieve general parameters",
      500
    );
  }
}

/**
 * Get airline profile and port combinations
 */
async function getAirlineProfile(req, res) {
  try {
    const { airlineCode } = req.query;
    const result = await doAirlineProfile({ airlineCode });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Airline profile retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in getAirlineProfile:", error);
    return errReturned(
      res,
      error.message || "Failed to retrieve airline profile",
      500
    );
  }
}

/**
 * Search for flights
 */
async function searchFlights(req, res) {
  try {
    const {
      originDestCriteria,
      paxList,
      currency,
      cabinClass,
      tripType,
      airlineCode,
      useCitySearch,
    } = req.body;

    if (
      !originDestCriteria ||
      !Array.isArray(originDestCriteria) ||
      originDestCriteria.length === 0
    ) {
      return errReturned(
        res,
        "originDestCriteria is required and must be an array",
        400
      );
    }

    if (!paxList || !Array.isArray(paxList) || paxList.length === 0) {
      return errReturned(res, "paxList is required and must be an array", 400);
    }

    const result = await doAirShopping({
      originDestCriteria,
      paxList,
      currency,
      cabinClass,
      tripType,
      airlineCode,
      useCitySearch,
    });

    // Log the raw result for debugging
    console.log("[Hitit Controller] Raw result type:", typeof result);
    const bodyObj = result?.Body || result?.["S:Body"] || result || {};
    console.log(
      "[Hitit Controller] Result Body keys:",
      Object.keys(bodyObj)
    );

    // const tickets = mapHititAirShoppingToTickets(result);
    // const tic = convertHititAirShoppingToJson(result);
    const convertedResult = convertHititAirShoppingToJson(result);

    // 🆕 DISCOVERY: Save flight-to-aircraft mapping for future enrichment
    if (Array.isArray(convertedResult)) {
      console.log("[Hitit Controller] Starting aircraft discovery from search results...");
      const metadataToUpsert = [];
      convertedResult.forEach(itin => {
        ['departure', 'return'].forEach(dir => {
          itin[dir]?.forEach(seg => {
            const aircraft = seg.aircraft || seg.equipmentType;
            if (seg.marketingCarrier && seg.marketingFlightNumber && aircraft) {
              metadataToUpsert.push({
                carrierCode: seg.marketingCarrier,
                flightNumber: seg.marketingFlightNumber,
                aircraft: String(aircraft).trim(),
                equipmentType: String(aircraft).trim()
              });
            }
          });
        });
      });

      if (metadataToUpsert.length > 0) {
        console.log(`[Hitit Controller] Discovery: found ${metadataToUpsert.length} flight mappings. Upserting to FlightMetadata...`);
        // Use Promise.all for fast non-blocking upserts
        Promise.all(metadataToUpsert.map(meta =>
          FlightMetadata.findOneAndUpdate(
            { carrierCode: meta.carrierCode, flightNumber: meta.flightNumber },
            meta,
            { upsert: true, new: true }
          ).catch(e => console.error(`[Discovery Error] ${meta.carrierCode}${meta.flightNumber}:`, e.message))
        )).then(() => console.log("[Hitit Controller] Discovery: Metadata store updated successfully."));
      }
    }

    return successResponse(res, "Flight data fetched successfully",
      {
        ticket: convertedResult
      }
    );
  } catch (error) {
    console.error("Error in searchFlights:", error);
    return errReturned(res, error.message || "Failed to search flights", 500);
  }
}

/**
 * Create reservation or ticketed PNR
 */
// async function createOrder(req, res) {
//   try {
//     const {
//       selectedOffer, // Backward compatibility or simplified nesting
//       offerRefId,
//       ownerCode,
//       selectedOfferItems,
//       totalAmount,
//       paxList,
//       contactInfoList,
//       currency,
//     } = req.body;

//     if (!paxList || !Array.isArray(paxList) || paxList.length === 0) {
//       return errReturned(res, "paxList is required and must be an array", 400);
//     }

//     const result = await doOrderCreate({
//       offerRefId: offerRefId || selectedOffer?.offerId || selectedOffer?.offerRefId,
//       ownerCode: ownerCode || selectedOffer?.ownerCode || "PK",
//       selectedOfferItems: selectedOfferItems || selectedOffer?.offerItems || selectedOffer?.selectedOfferItems,
//       totalAmount: totalAmount || selectedOffer?.totalAmount || selectedOffer?.TotalOfferPriceAmount,
//       currency: currency || selectedOffer?.currency || selectedOffer?.CurCode || "PKR",
//       paxList,
//       contactInfoList,
//     });

//     const mappedResult = convertHititOrderViewToJson(result);

//     if (mappedResult && mappedResult.status === "error") {
//       return errReturned(res, mappedResult.message || "Order creation failed", 400, mappedResult);
//     }

//     // Save to Database
//     try {
//       const newBooking = new Booking({
//         type: "flight",
//         api: "hitit",
//         id: mappedResult.pnr,
//         userId: req.user?._id,
//         agencyId: req.user?.agencyId,
//         status: ETicketStatus.HOLD, // Hitit OrderCreate usually creates a HOLD/Option PNR
//         status: ETicketStatus.HOLD, // Hitit OrderCreate usually creates a HOLD/Option PNR
//         flightType: selectedOffer?.tripType || selectedOffer?.type || (mappedResult.return?.length > 0 || selectedOffer?.return?.length > 0 ? "round-trip" : "one-way"),
//         departure: (selectedOffer?.departure?.length > 0 ? selectedOffer.departure : mappedResult.departure) || [],
//         return: (selectedOffer?.return?.length > 0 ? selectedOffer.return : mappedResult.return) || [],
//         finalPrice: totalAmount || mappedResult.totalPrice?.amount,
//         orignalPrice: totalAmount || mappedResult.totalPrice?.amount,
//         travelers: paxList.map((pax, index) => ({
//           id: pax.paxID || `PAX${index + 1}`,
//           pax: pax.ptc || "ADT",
//           price: (totalAmount || mappedResult.totalPrice?.amount) / paxList.length, // Simplified per-pax price
//           name: {
//             firstName: pax.individual?.givenName,
//             lastName: pax.individual?.surname,
//           },
//           dateOfBirth: pax.birthdate,
//           gender: pax.individual?.genderCode,
//           documents: pax.identityDoc ? [
//             {
//               number: pax.identityDoc.identityDocID,
//               documentType: pax.identityDoc.identityDocTypeCode,
//               nationality: pax.citizenshipCountryCode,
//             }
//           ] : [],
//           contact: {
//             emailAddress: contactInfoList?.[0]?.emailAddress,
//             phones: contactInfoList?.[0]?.phone ? [
//               {
//                 number: contactInfoList[0].phone.phoneNumber,
//                 countryCallingCode: contactInfoList[0].phone.countryDialingCode,
//               }
//             ] : []
//           }
//         })),
//         createdAt: mappedResult.creationTime || new Date(),
//         contacts: contactInfoList?.map(c => ({
//           addresseeName: { firstName: paxList[0]?.individual?.givenName || "N/A" },
//           phones: c.phone ? [
//             {
//               number: c.phone.phoneNumber,
//               countryCallingCode: c.phone.countryDialingCode,
//               deviceType: "MOBILE"
//             }
//           ] : [],
//           purpose: "STANDARD",
//           emailAddress: c.emailAddress
//         })) || []
//       });

//       await newBooking.save();
//       console.log(`[Hitit Controller] Booking ${mappedResult.pnr} saved to database.`);
//     } catch (dbError) {
//       console.error("[Hitit Controller] Database saving error:", dbError);
//       // We don't return error here because the PNR IS created in Hitit, 
//       // but we should probably inform someone or log it heavily.
//     }

//     return sendResponse(
//       res,
//       EResponseCode.SUCCESS,
//       "Order processing completed and saved",
//       mappedResult || result
//     );
//   } catch (error) {
//     console.error("Error in createOrder:", error);
//     return errReturned(res, error.message || "Failed to create order", 500);
//   }
// }

async function createOrder(req, res) {
  try {
    const {
      selectedOffer, // Backward compatibility or simplified nesting
      offerRefId,
      ownerCode,
      selectedOfferItems,
      totalAmount,
      paxList,
      contactInfoList,
      currency,
    } = req.body;

    // 🔍 DIAGNOSTIC LOGGING
    console.log("[CreateOrder] Request body keys:", Object.keys(req.body));
    console.log("[CreateOrder] selectedOffer exists?", !!selectedOffer);
    console.log("[CreateOrder] selectedOffer.departure exists?", !!selectedOffer?.departure);
    console.log("[CreateOrder] selectedOffer.departure length:", selectedOffer?.departure?.length);
    if (selectedOffer?.departure?.[0]) {
      console.log("[CreateOrder] selectedOffer.departure[0] keys:", Object.keys(selectedOffer.departure[0]));
      console.log("[CreateOrder] selectedOffer.departure[0].aircraft:", selectedOffer.departure[0].aircraft);
      console.log("[CreateOrder] selectedOffer.departure[0].equipmentType:", selectedOffer.departure[0].equipmentType);
    }

    if (!paxList || !Array.isArray(paxList) || paxList.length === 0) {
      return errReturned(res, "paxList is required and must be an array", 400);
    }

    const result = await doOrderCreate({
      offerRefId: offerRefId || selectedOffer?.offerId || selectedOffer?.offerRefId,
      ownerCode: ownerCode || selectedOffer?.ownerCode || "PK",
      selectedOfferItems: selectedOfferItems || selectedOffer?.offerItems || selectedOffer?.selectedOfferItems,
      totalAmount: totalAmount || selectedOffer?.totalAmount || selectedOffer?.TotalOfferPriceAmount,
      currency: currency || selectedOffer?.currency || selectedOffer?.CurCode || "PKR",
      paxList,
      contactInfoList,
    });

    let mappedResult = convertHititOrderViewToJson(result);

    if (mappedResult && mappedResult.status === "error") {
      return errReturned(res, mappedResult.message || "Order creation failed", 400, mappedResult);
    }

    // 🆕 ENRICHMENT: Add aircraft info from search results (Persistence & Discovery Strategy)
    if (mappedResult && mappedResult.status === "success") {
      console.log("[CreateOrder] Starting persistent enrichment...");
      const segmentsToEnrich = [];
      ['departure', 'return'].forEach(dir => {
        if (mappedResult[dir]) {
          mappedResult[dir].forEach(seg => {
            if (!seg.aircraft || seg.aircraft === "") {
              segmentsToEnrich.push(seg);
            }
          });
        }
      });

      if (segmentsToEnrich.length > 0) {
        console.log(`[CreateOrder] Persistence: Fetching aircraft for ${segmentsToEnrich.length} segments from metadata store...`);
        try {
          await Promise.all(segmentsToEnrich.map(async (seg) => {
            const meta = await FlightMetadata.findOne({
              carrierCode: seg.marketingCarrier,
              flightNumber: seg.marketingFlightNumber
            }).lean();

            if (meta && meta.aircraft) {
              console.log(`[CreateOrder] Persistence: Restored ${seg.marketingCarrier}${seg.marketingFlightNumber} -> ${meta.aircraft}`);
              seg.aircraft = meta.aircraft;
              seg.equipmentType = meta.equipmentType || meta.aircraft;
            }
          }));
        } catch (enrichError) {
          console.error("[CreateOrder] Metadata enrichment error:", enrichError.message);
        }
      } else {
        console.log("[CreateOrder] All segments already have aircraft info.");
      }
    }

    // Save to Database
    try {
      const newBooking = new Booking({
        type: "flight",
        api: "hitit",
        id: mappedResult.pnr,
        userId: req.user?._id,
        agencyId: req.user?.agencyId,
        status: ETicketStatus.HOLD,
        flightType: selectedOffer?.tripType || selectedOffer?.type || (mappedResult.return?.length > 0 || selectedOffer?.return?.length > 0 ? "round-trip" : "one-way"),
        paymentDeadline: mappedResult.paymentDeadline || null,
        departure: mappedResult.departure || selectedOffer?.departure || [],
        return: mappedResult.return || selectedOffer?.return || [],
        finalPrice: totalAmount || mappedResult.totalPrice?.amount,
        orignalPrice: totalAmount || mappedResult.totalPrice?.amount,
        travelers: paxList.map((pax, index) => ({
          id: pax.paxID || `PAX${index + 1}`,
          pax: pax.ptc || "ADT",
          price: (totalAmount || mappedResult.totalPrice?.amount) / paxList.length,
          name: {
            firstName: pax.individual?.givenName,
            lastName: pax.individual?.surname,
          },
          dateOfBirth: pax.birthdate,
          gender: pax.individual?.genderCode,
          documents: pax.identityDoc ? [
            {
              number: pax.identityDoc.identityDocID,
              documentType: pax.identityDoc.identityDocTypeCode,
              nationality: pax.citizenshipCountryCode,
            }
          ] : [],
          contact: {
            emailAddress: contactInfoList?.[0]?.emailAddress,
            phones: contactInfoList?.[0]?.phone ? [
              {
                number: contactInfoList[0].phone.phoneNumber,
                countryCallingCode: contactInfoList[0].phone.countryDialingCode,
              }
            ] : []
          }
        })),
        createdAt: mappedResult.creationTime || new Date(),
        contacts: contactInfoList?.map(c => ({
          addresseeName: { firstName: paxList[0]?.individual?.givenName || "N/A" },
          phones: c.phone ? [
            {
              number: c.phone.phoneNumber,
              countryCallingCode: c.phone.countryDialingCode,
              deviceType: "MOBILE"
            }
          ] : [],
          purpose: "STANDARD",
          emailAddress: c.emailAddress
        })) || []
      });

      await newBooking.save();
      console.log(`[Hitit Controller] Booking ${mappedResult.pnr} saved to database.`);
    } catch (dbError) {
      console.error("[Hitit Controller] Database saving error:", dbError);
    }

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Order processing completed and saved",
      mappedResult || result
    );
  } catch (error) {
    console.error("Error in createOrder:", error);
    return errReturned(res, error.message || "Failed to create order", 500);
  }
}
/**
 

/**
 * Retrieve PNR information
 */
async function retrieveOrder(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return errReturned(res, "orderId is required", 400);
    }

    const result = await doOrderRetrieve({ orderId });
    const mappedResult = convertHititOrderViewToJson(result);

    if (mappedResult && mappedResult.status === "error") {
      return errReturned(res, mappedResult.message || "Order retrieval failed", 400, mappedResult);
    }

    // Database Fallback or Proactive Save for missing information
    const missingAircraft = mappedResult.departure?.some(s => !s.aircraft) || mappedResult.return?.some(s => !s.aircraft);
    if (mappedResult && (
      (!mappedResult.departure || mappedResult.departure.length === 0) ||
      (!mappedResult.tickets || mappedResult.tickets.length === 0) ||
      missingAircraft
    )) {
      console.log(`[Hitit Controller] Fallback/Enrichment triggered for PNR: ${orderId}. Tickets empty: ${!mappedResult.tickets || mappedResult.tickets.length === 0}, Missing Aircraft: ${missingAircraft}`);
      try {
        const localBooking = await Booking.findOne({ id: orderId, api: "hitit" });
        if (localBooking) {
          console.log(`[Hitit Controller] Local booking found for ${orderId}.`);
          // Fallback segments/itinerary
          if ((!mappedResult.departure || mappedResult.departure.length === 0) && localBooking.departure?.length > 0) {
            mappedResult.departure = localBooking.departure;
          }
          if ((!mappedResult.return || mappedResult.return.length === 0) && localBooking.return?.length > 0) {
            mappedResult.return = localBooking.return;
          }
          if (!mappedResult.flightType && localBooking.flightType) {
            mappedResult.flightType = localBooking.flightType;
          }
          if ((!mappedResult.tickets || mappedResult.tickets.length === 0) && localBooking.tickets?.length > 0) {
            mappedResult.tickets = localBooking.tickets;
          }

          // [Robust Fallback] If segments exist in response but aircraft is missing, fetch from Local Cache (Booking or metadata store)
          for (const dir of ['departure', 'return']) {
            if (mappedResult[dir]) {
              for (const seg of mappedResult[dir]) {
                if (!seg.aircraft || seg.aircraft === "") {
                  // 1. Try local booking (PNR history)
                  const dbSeg = localBooking[dir]?.find(ds => String(ds.marketingFlightNumber) === String(seg.marketingFlightNumber));
                  if (dbSeg && dbSeg.aircraft) {
                    console.log(`[Hitit Controller] Restored aircraft from Booking for ${seg.marketingFlightNumber}: ${dbSeg.aircraft}`);
                    seg.aircraft = dbSeg.aircraft;
                    seg.equipmentType = dbSeg.equipmentType || dbSeg.aircraft;
                  } else {
                    // 2. Try global metadata store (Discovery system)
                    const meta = await FlightMetadata.findOne({ carrierCode: seg.marketingCarrier, flightNumber: seg.marketingFlightNumber }).lean();
                    if (meta && meta.aircraft) {
                      console.log(`[Hitit Controller] Restored aircraft from Metadata for ${seg.marketingFlightNumber}: ${meta.aircraft}`);
                      seg.aircraft = meta.aircraft;
                      seg.equipmentType = meta.equipmentType || meta.aircraft;
                    }
                  }
                }
              }
            }
          }
        }
      } catch (dbError) {
        console.error("Error fetching local booking for fallback:", dbError);
      }
    }

    // Proactive Save: if we have tickets in response but NOT in DB, save them
    if (mappedResult && mappedResult.tickets?.length > 0) {
      try {
        const localBooking = await Booking.findOne({ id: orderId, api: "hitit" });
        if (localBooking && (!localBooking.tickets || localBooking.tickets.length === 0)) {
          await Booking.findOneAndUpdate(
            { id: orderId },
            {
              $set: {
                tickets: mappedResult.tickets.map(t => ({
                  documentNumber: t.ticketNumber,
                  documentStatus: t.status,
                  bookingId: t.bookingId,
                  documentType: "TICKET"
                })),
                isTicketed: true,
                paidStatus: EPaidStatus.PAID,
                status: ETicketStatus.COMFIRMED
              }
            }
          );
          console.log(`[Hitit Controller] Proactively updated tickets for ${orderId} in DB.`);
        }
      } catch (dbSaveError) {
        console.error("Error proactively saving tickets:", dbSaveError);
      }
    }

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Order retrieved successfully",
      mappedResult || result
    );
  } catch (error) {
    console.error("Error in retrieveOrder:", error);
    return errReturned(res, error.message || "Failed to retrieve order", 500);
  }
}

/**
 * Cancel reservation or refund ticketed PNR
 */
async function cancelOrder(req, res) {
  try {
    const { orderId, action, changeOrder, ownerCode, currency } = req.body;

    if (!orderId) {
      return errReturned(res, "orderId is required", 400);
    }

    if (!action || !["VIEW_ONLY", "COMMIT"].includes(action)) {
      return errReturned(res, "action must be either VIEW_ONLY or COMMIT", 400);
    }

    const result = await doOrderCancel({ orderId, action, changeOrder, ownerCode, currency });
    console.log("[CancelOrder] Raw result keys:", JSON.stringify(Object.keys(result || {})));
    let mappedResult = convertHititOrderViewToJson(result.body);
    console.log("[CancelOrder] Mapped result:", JSON.stringify(mappedResult));

    if (mappedResult && mappedResult.status === "error") {
      return errReturned(res, mappedResult.message || "Cancellation failed", 400, mappedResult);
    }

    // [ENRICHMENT] After successful COMMIT, fetch full historical data to avoid empty arrays
    if (action === "COMMIT" && (!mappedResult || mappedResult.status === "success")) {
      try {
        console.log(`[CancelOrder] Enrichment: Fetching full order details for PNR ${orderId} after cancellation...`);
        const enrichedRaw = await doOrderRetrieve({ orderId });
        const enrichedMapped = convertHititOrderViewToJson(enrichedRaw);
        if (enrichedMapped && enrichedMapped.status === "success") {
          mappedResult = enrichedMapped;
          // Force status to CLOSED if it came back as something else from retrieve
          mappedResult.orderStatus = "CLOSED";
        }
      } catch (enrichError) {
        console.warn("[CancelOrder] Enrichment failed, returning basic cancellation response:", enrichError.message);
      }
    }

    // Update DB on successful COMMIT
    if (action === "COMMIT" && result.ok) {
      await Booking.findOneAndUpdate(
        { id: orderId },
        { $set: { status: ETicketStatus.CANCELLED } }
      );
    }

    return res.status(200).json({
      status: "success",
      message: action === "COMMIT"
        ? "Order cancelled successfully"
        : "Cancellation preview retrieved successfully",
      result: mappedResult || result.body
    });
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    return errReturned(res, error.message || "Failed to cancel order", 500);
  }
}

/**
 * Complete ticketing for Option PNR or add SSRs to ticketed PNR
 */
async function changeOrder(req, res) {
  try {
    const { orderId, ownerCode, currency, paymentFunctions, changeOrder, dataLists } = req.body;

    if (!orderId) {
      return errReturned(res, "orderId is required", 400);
    }

    const result = await doOrderChange({
      orderId,
      ownerCode,
      currency,
      paymentFunctions,
      changeOrder,
      dataLists,
    });

    if (result && result.status === "error") {
      return errReturned(
        res,
        result.message || "Order change failed",
        result.code || 400,
        result
      );
    }

    const mappedResult = convertHititOrderViewToJson(result);
    if (mappedResult && mappedResult.status === "error") {
      return errReturned(res, mappedResult.message || "Order change failed", 400, mappedResult);
    }

    // Update DB on successful ticketing
    if (mappedResult && mappedResult.status === "success" && (mappedResult.tickets?.length > 0 || mappedResult.orderStatus === "CLOSED")) {
      let ticketsToSave = mappedResult.tickets || [];

      // Fallback: If no tickets in OrderChangeRS, retrieve them explicitly
      if (ticketsToSave.length === 0 && orderId) {
        try {
          const freshResult = await doOrderRetrieve({ orderId });
          const freshMapped = convertHititOrderViewToJson(freshResult);
          if (freshMapped && freshMapped.tickets?.length > 0) {
            ticketsToSave = freshMapped.tickets;
            // Also update mappedResult for the immediate response to user
            mappedResult.tickets = ticketsToSave;
            if (freshMapped.departure?.length > 0) mappedResult.departure = freshMapped.departure;
            if (freshMapped.return?.length > 0) mappedResult.return = freshMapped.return;
          }
        } catch (retrieveError) {
          console.error("[Hitit Controller] Fallback retrieveOrder failed:", retrieveError);
        }
      }

      const dbTickets = ticketsToSave.map(t => ({
        documentNumber: t.ticketNumber,
        documentStatus: t.status,
        bookingId: t.bookingId,
        documentType: "TICKET"
      }));

      await Booking.findOneAndUpdate(
        { id: orderId },
        {
          $set: {
            status: ETicketStatus.COMFIRMED,
            isTicketed: true,
            paidStatus: EPaidStatus.PAID,
            tickets: dbTickets
          }
        }
      );
    }

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Order changed successfully",
      mappedResult || result
    );
  } catch (error) {
    console.error("Error in changeOrder:", error);
    return errReturned(res, error.message || "Failed to change order", 500);
  }
}

/**
 * Preview ticket pricing before ticketing
 */
async function previewTicket(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return errReturned(res, "orderId is required", 400);
    }

    const result = await doTicketPreview({ orderId });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Ticket preview retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in previewTicket:", error);
    return errReturned(res, error.message || "Failed to preview ticket", 500);
  }
}

/**
 * Void a ticket
 */
async function voidTicket(req, res) {
  try {
    const { orderId, ticketDocNbr } = req.body;

    if (!orderId) {
      return errReturned(res, "orderId is required", 400);
    }

    if (!ticketDocNbr) {
      return errReturned(res, "ticketDocNbr is required", 400);
    }

    const result = await doVoidTicket({ orderId, ticketDocNbr });

    const mappedResult = convertHititOrderViewToJson(result.body);

    // Update DB on successful void
    if (result.ok && ticketDocNbr) {
      // Find the booking and update the status of the specific ticket in the tickets array
      await Booking.findOneAndUpdate(
        { id: orderId, "tickets.documentNumber": ticketDocNbr },
        {
          $set: {
            "tickets.$.documentStatus": "V",
            status: ETicketStatus.VOIDED
          }
        }
      );
    }

    // Return the parsed Hitit body directly in our response
    return res.status(result.status || 200).json({
      code: result.status,
      message: result.ok ? "Ticket void request processed" : (mappedResult?.message || "Hitit server returned an error"),
      success: result.ok,
      body: mappedResult || result.body,
    });
  } catch (error) {
    console.error("Error in voidTicket:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "Failed to execute void request",
      error: error.stack
    });
  }
}

/**
 * Get available ancillary services for a PNR
 */
async function getServiceList(req, res) {
  try {
    const { orderId, offerId } = req.query;

    if (!orderId) {
      return errReturned(res, "orderId is required", 400);
    }

    const result = await doServiceList({ orderId, offerId });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Service list retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in getServiceList:", error);
    return errReturned(
      res,
      error.message || "Failed to retrieve service list",
      500
    );
  }
}

/**
 * Get seat availability for a flight
 */
async function getSeatAvailability(req, res) {
  try {
    const { airlineCode, ownerCode, bookingId, originDest } = req.body;

    if (!airlineCode || !ownerCode || !bookingId || !originDest) {
      return errReturned(
        res,
        "airlineCode, ownerCode, bookingId, and originDest are required",
        400
      );
    }

    const result = await doSeatAvailability({
      airlineCode,
      ownerCode,
      bookingId,
      originDest,
    });

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Seat availability retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in getSeatAvailability:", error);
    return errReturned(
      res,
      error.message || "Failed to retrieve seat availability",
      500
    );
  }
}

/**
 * Get baggage service options
 */
async function getBaggageServiceList(req, res) {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return errReturned(res, "orderId is required", 400);
    }

    const result = await doBaggageServiceList({ orderId });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Baggage service list retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in getBaggageServiceList:", error);
    return errReturned(
      res,
      error.message || "Failed to retrieve baggage service list",
      500
    );
  }
}

/**
 * Add SSR (Special Service Request) to PNR
 */
async function addAncillary(req, res) {
  try {
    const { orderId, changeOrder, dataLists } = req.body;

    if (!orderId || !changeOrder || !dataLists) {
      return errReturned(
        res,
        "orderId, changeOrder, and dataLists are required",
        400
      );
    }

    const result = await doAddAncillary({ orderId, changeOrder, dataLists });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Ancillary service added successfully",
      result
    );
  } catch (error) {
    console.error("Error in addAncillary:", error);
    return errReturned(
      res,
      error.message || "Failed to add ancillary service",
      500
    );
  }
}

/**
 * Delete SSR from PNR
 */
async function deleteAncillary(req, res) {
  try {
    const { orderId, changeOrder, dataLists } = req.body;

    if (!orderId || !changeOrder || !dataLists) {
      return errReturned(
        res,
        "orderId, changeOrder, and dataLists are required",
        400
      );
    }

    const result = await doDeleteAncillary({ orderId, changeOrder, dataLists });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Ancillary service deleted successfully",
      result
    );
  } catch (error) {
    console.error("Error in deleteAncillary:", error);
    return errReturned(
      res,
      error.message || "Failed to delete ancillary service",
      500
    );
  }
}

/**
 * Purchase/ticket SSR
 */
async function sellAncillary(req, res) {
  try {
    const { orderId, paymentFunctions, changeOrder, dataLists } = req.body;

    if (!orderId || !paymentFunctions || !changeOrder) {
      return errReturned(
        res,
        "orderId, paymentFunctions, and changeOrder are required",
        400
      );
    }

    const result = await doSellAncillary({
      orderId,
      paymentFunctions,
      changeOrder,
      dataLists,
    });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Ancillary service sold successfully",
      result
    );
  } catch (error) {
    console.error("Error in sellAncillary:", error);
    return errReturned(
      res,
      error.message || "Failed to sell ancillary service",
      500
    );
  }
}

/**
 * Get pricing for SSRs before adding them
 */
async function getOfferPrice(req, res) {
  try {
    const { orderId, selectedOfferItems } = req.body;

    if (!orderId || !selectedOfferItems) {
      return errReturned(
        res,
        "orderId and selectedOfferItems are required",
        400
      );
    }

    const result = await doOfferPrice({ orderId, selectedOfferItems });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Offer price retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in getOfferPrice:", error);
    return errReturned(
      res,
      error.message || "Failed to retrieve offer price",
      500
    );
  }
}

/**
 * Preview reissue transaction
 */
async function previewReissue(req, res) {
  try {
    const {
      orderId,
      existingOrderCriteria,
      deleteOrderItem,
      specificOriginDestCriteria,
    } = req.body;

    if (!orderId || !existingOrderCriteria) {
      return errReturned(
        res,
        "orderId and existingOrderCriteria are required",
        400
      );
    }

    const result = await doReissuePreview({
      orderId,
      existingOrderCriteria,
      deleteOrderItem,
      specificOriginDestCriteria,
    });

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Reissue preview retrieved successfully",
      result
    );
  } catch (error) {
    console.error("Error in previewReissue:", error);
    return errReturned(res, error.message || "Failed to preview reissue", 500);
  }
}

/**
 * Commit reissue transaction
 */
async function commitReissue(req, res) {
  try {
    const {
      orderId,
      paymentFunctions,
      existingOrderCriteria,
      deleteOrderItem,
      specificOriginDestCriteria,
    } = req.body;

    if (!orderId || !paymentFunctions || !existingOrderCriteria) {
      return errReturned(
        res,
        "orderId, paymentFunctions, and existingOrderCriteria are required",
        400
      );
    }

    const result = await doReissueCommit({
      orderId,
      paymentFunctions,
      existingOrderCriteria,
      deleteOrderItem,
      specificOriginDestCriteria,
    });

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Reissue completed successfully",
      result
    );
  } catch (error) {
    console.error("Error in commitReissue:", error);
    return errReturned(res, error.message || "Failed to commit reissue", 500);
  }
}

/**
 * Split/divide a passenger from PNR
 */
async function splitPassenger(req, res) {
  try {
    const { orderId, paxId } = req.body;

    if (!orderId || !paxId) {
      return errReturned(res, "orderId and paxId are required", 400);
    }

    const result = await doSplit({ orderId, paxId });
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Passenger split successfully",
      result
    );
  } catch (error) {
    console.error("Error in splitPassenger:", error);
    return errReturned(res, error.message || "Failed to split passenger", 500);
  }
}

/**
 * getOrderFare - Get fare rules for a specific flight
 */
async function getOrderFare(req, res) {
  try {
    const { airlineCode = "PK", origin, destination, departureDate, fareBasisCode, currency = "PKR" } = req.body;

    // Basic validation
    if (!origin || !destination || !departureDate || !fareBasisCode) {
      return errReturned(res, "origin, destination, departureDate, and fareBasisCode are required", 400);
    }

    const result = await doOrderFare({
      airlineCode,
      origin,
      destination,
      departureDate,
      fareBasisCode,
      currency
    });

    const mappedResult = convertHititOrderFareToJson(result);

    // Return the parsed Hitit body directly in our response
    return res.status(result.status || 200).json({
      code: result.status,
      message: result.ok ? "Order fare rules retrieved" : "Hitit server returned an error",
      success: result.ok,
      result: mappedResult || result.body,
    });
  } catch (error) {
    console.error("Error in getOrderFare:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "Failed to retrieve fare rules",
      error: error.stack
    });
  }
}

module.exports = {
  getGeneralParams,
  getAirlineProfile,
  searchFlights,
  createOrder,
  retrieveOrder,
  cancelOrder,
  changeOrder,
  previewTicket,
  voidTicket,
  getOrderFare,
  getServiceList,
  getSeatAvailability,
  getBaggageServiceList,
  addAncillary,
  deleteAncillary,
  sellAncillary,
  getOfferPrice,
  previewReissue,
  commitReissue,
  splitPassenger,
};
