const airlineLogo = require("../airlineLogo/airlineLogo");

// Global helpers for case-insensitive and prefix-insensitive key matching
const findKey = (obj, regex) => {
    if (!obj || typeof obj !== "object") return null;
    return Object.keys(obj).find((k) => regex.test(k));
};

const getVal = (obj, regex) => {
    const k = findKey(obj, regex);
    return k ? obj[k] : undefined;
};

function calculateAdjustedPrice(
    price,
    markups,
    staffMarkupValue,
    staffMarkupType,
    carrierCode,
) {
    let adjustedPrice = price;

    markups?.forEach((markup) => {
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
/**
 * Converts Hitit SOAP response to Sabre-like REST JSON format.
 * Groups Offers by Itinerary (Segments) and maps to brandedResutls.
 */
function convertHititAirShoppingToJson(
    rawResponse,
    findMakrup,
    staffMarkupValue,
    staffMarkupType,
) {
    if (!rawResponse) {
        console.log("[convertHititAirShoppingToJson] No rawResponse provided");
        return [];
    }
    const attachAirlineLogo = (segment) => {
        const code = segment.marketingCarrier;
        const airlineData = airlineLogoMap[code] || {
            arCode: code,
            logo: "default_logo_url",
            ar: code,
        };

        return {
            ...segment,
            logo: {
                arCode: airlineData.arCode,
                ar: airlineData.ar,
                logo: airlineData.logo,
            },
        };
    };

    // Prepare airline logo mapping
    let airlineLogoMap = {};
    try {
        airlineLogo?.forEach(({ arCode, logo, ar }) => {
            airlineLogoMap[arCode] = { ar, logo, arCode };
        });
    } catch (error) {
        console.error("Error processing airline logo data:", error);
    }
    /* ---------------- SOAP SAFE ACCESS ---------------- */

    // Normalize keys to find Envelope
    let root = rawResponse;
    const body = getVal(getVal(root, /envelope/i) || root, /body/i) || root;

    // Find AirShoppingRS
    const rs = getVal(body, /airshoppingrs/i);

    if (!rs) {
        console.log(
            "[convertHititAirShoppingToJson] Could not find AirShoppingRS element. Keys available:",
            Object.keys(body || {}),
        );
        return [];
    }

    const error = getVal(rs, /error/i);
    if (error) {
        console.log("[Mapper] API ERROR found:", JSON.stringify(error));
        return {
            status: "error",
            message: getVal(error, /desctext/i) || "API Error",
            code: getVal(error, /code/i)
        };
    }

    const response = getVal(rs, /response/i) || {};
    const dataLists = getVal(response, /datalists/i) || getVal(rs, /datalists/i) || {};

    const rsKeys = Object.keys(rs || {});
    const responseKeys = Object.keys(response || {});
    console.log(
        `[Mapper] rs keys: ${rsKeys.join(", ")}`,
    );
    console.log(
        `[Mapper] response keys: ${responseKeys.join(", ")}`,
    );

    /* ---------------- PAX LIST ---------------- */
    const dlKeys = Object.keys(dataLists || {});
    console.log(`[Mapper] DataList keys: ${dlKeys.join(", ")}`);
    const paxListKey = dlKeys.find((k) => k.match(/paxlist/i));
    const paxListObj = paxListKey ? dataLists[paxListKey] : {};

    console.log(`[Mapper] PaxListKey: ${paxListKey}`);

    // PaxList might contain "Pax" or "NS8:Pax"
    const plKeys = Object.keys(paxListObj || {});
    const paxKey = plKeys.find((k) => k.match(/^(\w+:)?pax$/i)); // Matches 'Pax', 'NS8:Pax'
    const paxRaw = paxKey ? paxListObj[paxKey] : [];

    const paxList = Array.isArray(paxRaw) ? paxRaw : paxRaw ? [paxRaw] : [];


    const findPaxByPTC = (ptc) =>
        paxList.find((p) => {
            const pPTC = getVal(p, /ptc/i) || "";
            return String(pPTC).toUpperCase() === ptc.toUpperCase();
        });

    const adtRef = findPaxByPTC("ADT");
    const chdRef = findPaxByPTC("CHD");
    const infRef = findPaxByPTC("INF");

    const getPaxId = (p) => getVal(p, /paxid/i);
    const ADT_ID = getPaxId(adtRef);
    const CHD_ID = getPaxId(chdRef);
    const INF_ID = getPaxId(infRef);

    const getPassengerCount = (ptc) =>
        paxList.filter((p) => {
            const tc = getVal(p, /ptc/i) || "";
            return String(tc).toUpperCase() === ptc.toUpperCase();
        }).length;

    const adtCount = getPassengerCount("ADT");
    const chdCount = getPassengerCount("CHD");
    const infCount = getPassengerCount("INF");

    /* ---------------- ORIGIN DEST LIST (Leg Mapping) ---------------- */
    const odKey = findKey(dataLists, /origindestlist/i);
    const odListObj = odKey ? dataLists[odKey] : {};
    const odRaw = getVal(odListObj, /^(\w+:)?origindest$/i) || [];
    const odList = Array.isArray(odRaw) ? odRaw : [odRaw];

    const journeyToLegMap = {};
    odList?.forEach((od, idx) => {
        const journeyRefsRaw = getVal(od, /paxjourneyrefid/i) || [];
        const journeyRefs = Array.isArray(journeyRefsRaw)
            ? journeyRefsRaw
            : [journeyRefsRaw];
        journeyRefs?.forEach((jRef) => {
            if (jRef) journeyToLegMap[jRef] = idx;
        });
    });

    /* ---------------- JOURNEY LIST (Segment Mapping) ---------------- */
    const journeyListKey = findKey(dataLists, /paxjourneylist/i);
    const journeyListObj = journeyListKey ? dataLists[journeyListKey] : {};
    const journeyRaw = getVal(journeyListObj, /^(\w+:)?paxjourney$/i) || [];
    const journeyList = Array.isArray(journeyRaw) ? journeyRaw : [journeyRaw];

    const journeyToSegmentMap = {};
    journeyList?.forEach((j) => {
        const jId = getVal(j, /paxjourneyid/i);
        const sRefsRaw = getVal(j, /paxsegmentrefid/i) || [];
        if (jId)
            journeyToSegmentMap[jId] = Array.isArray(sRefsRaw)
                ? sRefsRaw
                : [sRefsRaw];
    });

    /* ---------------- SEGMENTS MAP ---------------- */
    const segListKey = findKey(dataLists, /paxsegmentlist/i);
    const segListObj = segListKey ? dataLists[segListKey] : {};
    const segRaw = getVal(segListObj, /^(\w+:)?paxsegment$/i) || [];

    const segmentMap = {};
    const segArray = Array.isArray(segRaw) ? segRaw : segRaw ? [segRaw] : [];
    console.log(`[Mapper] Segment collection size: ${segArray.length}`);

    segArray?.forEach((seg) => {
        const segId = getVal(seg, /paxsegmentid/i);
        if (!segId) return;

        console.log(`[Mapper] Mapping segment: ${segId}`);

        const marketingInfo = getVal(seg, /marketingcarrierinfo/i) || {};
        const operatingInfo = getVal(seg, /operatingcarrierinfo/i) || {};
        const dep = getVal(seg, /^(\w+:)?dep$/i) || {};
        const arrival = getVal(seg, /^(\w+:)?arrival$/i) || {};
        const datedLeg = getVal(seg, /datedoperatingleg/i) || {};
        // Try exhaustive fallbacks for aircraft name/code in AirShopping
        let aircraftName = "";
        const rawAltAircraft = getVal(datedLeg, /carrieraircrafttype/i);
        const opEquip = getVal(operatingInfo, /equipment/i);
        const markEquip = getVal(marketingInfo, /equipment/i);
        const directEquip = getVal(seg, /equipment/i) || getVal(seg, /aircrafttype/i) || getVal(seg, /aircraft/i);

        if (rawAltAircraft) {
            if (typeof rawAltAircraft === "string") aircraftName = rawAltAircraft;
            else aircraftName = getVal(rawAltAircraft, /typename/i) || getVal(rawAltAircraft, /carrieraircrafttypename/i) || rawAltAircraft?.["_"];
        }
        if (!aircraftName && opEquip) aircraftName = getVal(opEquip, /aircraftcode/i) || getVal(opEquip, /equipmentcode/i) || (typeof opEquip === "string" ? opEquip : "");
        if (!aircraftName && markEquip) aircraftName = getVal(markEquip, /aircraftcode/i) || getVal(markEquip, /equipmentcode/i);
        if (!aircraftName && directEquip) {
            aircraftName = (typeof directEquip === "string") ? directEquip : (getVal(directEquip, /aircraftcode/i) || getVal(directEquip, /equipmentcode/i) || directEquip?.["_"]);
        }

        // Fallback: Scan child objects for aircraft keywords
        if (!aircraftName) {
            Object.values(seg).forEach(val => {
                if (val && typeof val === "object" && !aircraftName) {
                    aircraftName = getVal(val, /aircraftcode/i) || getVal(val, /equipmentcode/i) || getVal(val, /typename/i);
                }
            });
        }

        aircraftName = aircraftName || "";

        segmentMap[segId] = {
            marketingCarrier: getVal(marketingInfo, /carrierdesigcode/i),
            marketingCarrierName: getVal(marketingInfo, /carriername/i),
            marketingFlightNumber: getVal(marketingInfo, /flightnumber/i),
            operating: getVal(operatingInfo, /carrierdesigcode/i),
            operatingFlightNumber: getVal(operatingInfo, /flightnumber/i),
            departureTime: getVal(dep, /datetime/i),
            arrivalTime: getVal(arrival, /datetime/i),
            departureLocation: getVal(dep, /locationcode/i),
            arrivalLocation: getVal(arrival, /locationcode/i),
            elapsedTime: getVal(seg, /duration/i),
            duration: getVal(seg, /duration/i),
            stopCount: 0,
            equipmentType: aircraftName,
            aircraft: aircraftName,
            gav: getVal(datedLeg, /gav/i) || null,
            id: segId,
            cabin: { code: "", name: "" },
        };
    });

    /* ---------------- BAGGAGE MAP ---------------- */
    const baggageMap = {};
    const bagListKey = findKey(dataLists, /baggageallowancelist/i);
    const bagListObj = bagListKey ? dataLists[bagListKey] : {};
    const baggageRaw = getVal(bagListObj, /^(\w+:)?baggageallowance$/i) || [];

    (Array.isArray(baggageRaw)
        ? baggageRaw
        : baggageRaw
            ? [baggageRaw]
            : []
    ).forEach((bag) => {
        const bagId = getVal(bag, /allowanceid/i);
        if (!bagId) return;

        let weight = 0,
            unit = "Piece";
        const weightRaw = getVal(bag, /weightallowance/i);
        if (weightRaw) {
            const maxWeight =
                getVal(weightRaw, /maximumweight/i) ||
                getVal(weightRaw, /maximumweightmeasure/i);
            weight = Number(maxWeight?._ || maxWeight || 0);
            unit = getVal(maxWeight, /unitcode/i) || "KG";
        } else {
            const pieceRaw = getVal(bag, /pieceallowance/i);
            const totalQty =
                getVal(pieceRaw, /totalqty/i) || getVal(pieceRaw, /totalquantity/i);

            // In Hitit, TotalQty: 0 often means we should look at PieceWeightAllowance
            const pw =
                getVal(pieceRaw, /pieceweight/i) ||
                getVal(pieceRaw, /pieceweightallowance/i);
            if (pw) {
                const maxW =
                    getVal(pw, /maximumweight/i) || getVal(pw, /maximumweightmeasure/i);
                weight = Number(maxW?._ || maxW || 0);
                unit = getVal(maxW, /unitcode/i) || "KG";
            } else if (totalQty && Number(totalQty?._ || totalQty) > 0) {
                weight = Number(totalQty?._ || totalQty || 0);
                unit = "Piece";
            }
        }
        baggageMap[bagId] = { weight, unit };
    });

    /* ---------------- SERVICE DEFINITION MAP ---------------- */
    const serviceDefMap = {};
    const sdListKey = findKey(dataLists, /servicedefinitionlist/i);
    const sdListObj = sdListKey ? dataLists[sdListKey] : {};
    const serviceDefRaw = getVal(sdListObj, /^(\w+:)?servicedefinition$/i) || [];

    (Array.isArray(serviceDefRaw)
        ? serviceDefRaw
        : serviceDefRaw
            ? [serviceDefRaw]
            : []
    )?.forEach((sd) => {
        const sdId = getVal(sd, /definitionid/i);
        if (!sdId) return;

        const name = getVal(sd, /^(\w+:)?name$/i);
        const descObj = getVal(sd, /^(\w+:)?desc$/i);
        const descArray = Array.isArray(descObj) ? descObj : [descObj];
        const desc =
            descArray
                .map((d) => getVal(d, /desctext/i))
                .filter(Boolean)
                .join(", ") || "";
        const code = getVal(sd, /servicecode/i);

        const assoc = getVal(sd, /association/i);
        const bagRefObj = getVal(assoc, /baggageallowanceref/i);
        const bagRef =
            getVal(bagRefObj, /allowanceid/i) || getVal(bagRefObj, /refid/i);

        const bundleObj = getVal(assoc, /servicebundle/i);
        const bundleRefsRaw = getVal(bundleObj, /definitionrefid/i) || [];
        const bundleRefs = Array.isArray(bundleRefsRaw)
            ? bundleRefsRaw
            : [bundleRefsRaw];

        serviceDefMap[sdId] = {
            id: sdId,
            name: String(name || ""),
            desc: String(desc || ""),
            code: String(code || ""),
            baggageRef: bagRef,
            bundleRefs: bundleRefs,
        };
    });

    /* ---------------- OFFERS PROCESSING ---------------- */
    const itineraryMap = {};
    const offersGroupKey = findKey(response, /offersgroup/i);
    const offersGroup = offersGroupKey ? response[offersGroupKey] : {};
    const carrierOffersKey = findKey(offersGroup, /carrieroffers/i);
    const carrierOffers = carrierOffersKey ? offersGroup[carrierOffersKey] : {};
    const offersRaw = getVal(carrierOffers, /^(\w+:)?offer$/i) || [];

    const offers = Array.isArray(offersRaw)
        ? offersRaw
        : offersRaw
            ? [offersRaw]
            : [];
    console.log(`[Mapper] Offers count: ${offers.length}`);

    // Helper to resolve services recursively (for bundles)
    const resolveServices = (sdId, depth = 0) => {
        if (depth > 5 || !serviceDefMap[sdId])
            return { baggage: [], meals: [], others: [] };
        const sd = serviceDefMap[sdId];
        let baggage = [],
            meals = [],
            others = [];

        if (sd.baggageRef && baggageMap[sd.baggageRef]) {
            baggage.push(baggageMap[sd.baggageRef]);
        }

        const nameUpper = sd.name.toUpperCase();
        const descUpper = sd.desc.toUpperCase();
        const codeUpper = sd.code.toUpperCase();

        const isMeal =
            codeUpper === "MEAL" ||
            nameUpper.includes("MEAL") ||
            descUpper.includes("MEAL");
        if (isMeal) {
            let mealText = sd.desc || sd.name || "Meal Provided";
            if (mealText.toUpperCase() === "MEAL") mealText = "Meal Provided";
            meals.push(mealText);
        } else if (codeUpper === "SEAT" || nameUpper.includes("SEAT")) {
            others.push("Seat Selection Included");
        } else if (codeUpper === "REISSUE" || nameUpper.includes("REISSUE")) {
            others.push("Reissue Possible");
        } else if (
            codeUpper === "CBAG" ||
            nameUpper.includes("CBAG") ||
            nameUpper.includes("CABIN")
        ) {
            others.push("Cabin Baggage Included");
        } else if (
            sd.name &&
            !codeUpper.includes("BAG") &&
            !nameUpper.includes("XBAG")
        ) {
            // Add any other named service as a feature
            others.push(sd.name);
        }

        sd.bundleRefs?.forEach((refId) => {
            if (refId) {
                const res = resolveServices(refId, depth + 1);
                baggage = [...baggage, ...res.baggage];
                meals = [...meals, ...res.meals];
                others = [...others, ...res.others];
            }
        });

        return { baggage, meals, others };
    };

    offers?.forEach((offer) => {
        const rawOfferId = getVal(offer, /^(\w+:)?offerid$/i) || "UNKNOWN";
        const offerId = typeof rawOfferId === "string" ? rawOfferId.trim().replace(/\s+/g, "") : rawOfferId;
        const itemsRaw = getVal(offer, /^(\w+:)?offeritem$/i) || [];
        const items = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];
        if (items.length > 0) {
            console.log(`[Mapper] OfferItem[0] keys:`, Object.keys(items[0]).join(", "));
        }

        const segmentRefs = new Set();
        let brandDetails = {
            code: "",
            name: "",
            baggage: [],
            meals: [],
            others: [],
            rbd: "",
        };
        let priceInfo = { adt: null, chd: null, inf: null };

        let totalAllPax = 0;
        let totalBase = 0;
        let totalTax = 0;
        let ownerCode = "PK"; // Default

        const offerItems = [];
        items?.forEach((item) => {
            const rawOfferItemRefId = getVal(item, /^(\w+:)?offeritemid$/i) || getVal(item, /^(\w+:)?offeritemrefid$/i) || getVal(item, /^(\w+:)?refid$/i);
            const offerItemRefId = typeof rawOfferItemRefId === "string" ? rawOfferItemRefId.trim().replace(/\s+/g, "") : rawOfferItemRefId;
            const service = getVal(item, /^(\w+:)?service$/i);
            const paxRefId = getVal(service, /^(\w+:)?paxrefid$/i) || getVal(item, /^(\w+:)?paxrefid$/i);

            if (offerItemRefId && paxRefId) {
                offerItems.push({ offerItemRefId, paxRefId });
            }

            const serviceRawForSegments = Array.isArray(service) ? service : (service ? [service] : []);

            serviceRawForSegments?.forEach((svc) => {
                const assoc = getVal(svc, /association/i);

                // 1. Check direct baggage ref
                const directBagRefObj = getVal(assoc, /baggageallowanceref/i);
                const directBagRef =
                    getVal(directBagRefObj, /allowanceid/i) ||
                    getVal(directBagRefObj, /refid/i);
                if (directBagRef && baggageMap[directBagRef]) {
                    if (
                        !brandDetails.baggage.some(
                            (b) =>
                                b.weight === baggageMap[directBagRef].weight &&
                                b.unit === baggageMap[directBagRef].unit,
                        )
                    ) {
                        brandDetails.baggage.push(baggageMap[directBagRef]);
                    }
                }

                // 2. Check definition refs (Recursive)
                const defRefObj = getVal(assoc, /definitionref/i);
                const defRefId =
                    getVal(defRefObj, /definitionrefid/i) || getVal(defRefObj, /refid/i);
                if (defRefId) {
                    const resolved = resolveServices(defRefId);
                    resolved.baggage?.forEach((b) => {
                        if (
                            !brandDetails.baggage.some(
                                (exist) => exist.weight === b.weight && exist.unit === b.unit,
                            )
                        ) {
                            brandDetails.baggage.push(b);
                        }
                    });
                    resolved.meals?.forEach((m) => {
                        if (!brandDetails.meals.includes(m)) brandDetails.meals.push(m);
                    });
                    resolved.others?.forEach((o) => {
                        if (!brandDetails.others.includes(o)) brandDetails.others.push(o);
                    });
                }

                // Leg/Segment association for itinerary grouping
                const flightAssoc = getVal(defRefObj, /flightassociation/i);
                const paxSegRefObj = flightAssoc
                    ? getVal(flightAssoc, /paxsegmentref/i)
                    : defRefObj;
                if (paxSegRefObj) {
                    const segRef =
                        getVal(paxSegRefObj, /segmentrefid/i) ||
                        paxSegRefObj.PaxSegmentRefID ||
                        paxSegRefObj["NS8:PaxSegmentRefID"];
                    if (segRef) segmentRefs.add(segRef);
                }
            });

            const fareDetailRaw = getVal(item, /^(\w+:)?faredetail$/i) || [];
            const fareDetails = Array.isArray(fareDetailRaw)
                ? fareDetailRaw
                : [fareDetailRaw];

            let itemPriceInfo = { adt: null, chd: null, inf: null };

            fareDetails?.forEach((fd) => {
                // Price Extraction - Try item.Price first, then FareDetail
                const itemPrice = getVal(item, /^(\w+:)?price$/i);
                const fdPrice = getVal(fd, /^(\w+:)?price$/i);
                const pcRaw = getVal(fd, /^(\w+:)?passenger$/i);

                if (pcRaw) {
                    const prices = Array.isArray(pcRaw) ? pcRaw : [pcRaw];
                    prices.forEach((p) => {
                        const ptc = getVal(p, /^(\w+:)?ptc$/i);
                        const totalObj = getVal(p, /^(\w+:)?totalamount$/i);
                        const amount = parseFloat(totalObj?._ || totalObj || 0);

                        const baseObj = getVal(p, /^(\w+:)?baseamount$/i);
                        const baseAmount = parseFloat(baseObj?._ || baseObj || 0);

                        const taxSum = getVal(p, /^(\w+:)?taxsummary$/i);
                        const totalTaxObj = getVal(taxSum, /^(\w+:)?totalamount$/i) || getVal(taxSum, /^(\w+:)?totaltaxamount$/i);
                        const taxAmount = parseFloat(totalTaxObj?._ || totalTaxObj || 0);

                        if (ptc === "ADT") itemPriceInfo.adt = { amount, base: baseAmount, tax: taxAmount };
                        else if (ptc === "CHD") itemPriceInfo.chd = { amount, base: baseAmount, tax: taxAmount };
                        else if (ptc === "INF") itemPriceInfo.inf = { amount, base: baseAmount, tax: taxAmount };
                    });
                } else {
                    const priceSource = fdPrice || itemPrice;
                    if (priceSource) {
                        const totalObj = getVal(priceSource, /^(\w+:)?totalamount$/i);
                        const equivObj = getVal(priceSource, /^(\w+:)?equivamount$/i);

                        const amount = parseFloat(totalObj?._ || totalObj || 0);
                        const equiv = parseFloat(equivObj?._ || equivObj || 0);
                        const finalAmount = equiv > 0 ? equiv : amount;

                        const baseObj = getVal(priceSource, /^(\w+:)?baseamount/i);
                        const base = parseFloat(baseObj?._ || baseObj || 0);

                        const taxSum = getVal(priceSource, /^(\w+:)?taxsummary/i);
                        const taxObj = getVal(taxSum, /^(\w+:)?totaltaxamount$/i) || getVal(taxSum, /^(\w+:)?totalamount$/i);
                        const tax = parseFloat(taxObj?._ || taxObj || 0);

                        // If equiv exists and is greater than 0, it's likely the local currency (PKR)
                        if (!itemPriceInfo.adt) {
                            itemPriceInfo.adt = {
                                amount: finalAmount || (base + tax),
                                base,
                                tax: tax || (finalAmount - base)
                            };
                        }
                    }
                }

                // Brand & Cabin
                const fc = getVal(fd, /^(\w+:)?farecomponent$/i);
                if (fc) {
                    const code = getVal(fc, /^(\w+:)?farebasiscode$/i);
                    const rbdObj = getVal(fc, /^(\w+:)?rbd$/i);
                    const rbd = getVal(rbdObj, /rbd_code/i) || rbdObj;
                    const cabin = getVal(fc, /^(\w+:)?cabintype$/i);

                    let paxType = (paxRefId === ADT_ID) ? "adt" : (CHD_ID && paxRefId === CHD_ID ? "chd" : (INF_ID && paxRefId === INF_ID ? "inf" : "adt"));

                    if (!brandDetails.code || paxType === "adt") {
                        const ft = getVal(fc, /faretypecode/i);
                        if (code) {
                            brandDetails.code = code;
                            brandDetails.name = ft || code.replace(/CH$/i, "").replace(/[0-9]/g, "");
                        }
                        if (rbd) brandDetails.rbd = rbd;
                    }

                    const segRef = getVal(fc, /segmentrefid/i);
                    if (segRef && segmentMap[segRef] && cabin) {
                        segmentMap[segRef].cabin = {
                            code: getVal(cabin, /typecode/i) || "",
                            name: getVal(cabin, /typename/i) || "",
                        };
                    }
                }
            });

            // Accumulate prices for the whole offer
            totalAllPax += (itemPriceInfo.adt?.amount || 0) + (itemPriceInfo.chd?.amount || 0) + (itemPriceInfo.inf?.amount || 0);
            totalBase += (itemPriceInfo.adt?.base || 0) + (itemPriceInfo.chd?.base || 0) + (itemPriceInfo.inf?.base || 0);
            totalTax += (itemPriceInfo.adt?.tax || 0) + (itemPriceInfo.chd?.tax || 0) + (itemPriceInfo.inf?.tax || 0);

            // Update offer-level priceInfo for brand display (taking the first or merging)
            if (itemPriceInfo.adt) priceInfo.adt = itemPriceInfo.adt;
            if (itemPriceInfo.chd) priceInfo.chd = itemPriceInfo.chd;
            if (itemPriceInfo.inf) priceInfo.inf = itemPriceInfo.inf;
        });

        const sortedSegIds = Array.from(segmentRefs).sort((a, b) => {
            const segA = segmentMap[a],
                segB = segmentMap[b];
            if (!segA || !segB) return 0;
            return new Date(segA.departureTime) - new Date(segB.departureTime);
        });

        // Leg Splitting
        const journeyOverview = getVal(offer, /journeyoverview/i) || {};
        const jpcRaw = getVal(journeyOverview, /journeypriceclass/i) || [];
        const journeyPriceClassList = Array.isArray(jpcRaw) ? jpcRaw : [jpcRaw];

        const segmentsByLeg = {};
        journeyPriceClassList?.forEach((jpc) => {
            const jId = getVal(jpc, /journeyrefid/i);
            const legIdx = journeyToLegMap[jId];
            const segIds = journeyToSegmentMap[jId] || [];
            if (typeof legIdx !== "undefined") {
                if (!segmentsByLeg[legIdx]) segmentsByLeg[legIdx] = [];
                segIds?.forEach((sid) => {
                    if (segmentMap[sid]) segmentsByLeg[legIdx].push(segmentMap[sid]);
                });
            }
        });

        // Dynamic Leg Assignment
        const legIndices = Object.keys(segmentsByLeg)
            .map(Number)
            .sort((a, b) => a - b);
        const finalDeparture = segmentsByLeg[legIndices[0]] || [];
        const finalReturn = legIndices
            .slice(1)
            .flatMap((idx) => segmentsByLeg[idx] || []);

        const useDeparture =
            finalDeparture.length > 0
                ? finalDeparture
                : sortedSegIds.map((id) => segmentMap[id]).filter(Boolean);
        const useReturn = finalReturn;

        const itinKey = sortedSegIds.join("|");
        if (!itineraryMap[itinKey]) {
            itineraryMap[itinKey] = {
                departure: useDeparture,
                return: useReturn,
                brands: [],
            };
        }

        // Fares already accumulated above in the items loop

        // Deduplicate baggage by taking max weight per unit
        const bagMapForItin = {};
        brandDetails.baggage?.forEach((b) => {
            if (!bagMapForItin[b.unit] || b.weight > bagMapForItin[b.unit]) {
                bagMapForItin[b.unit] = b.weight;
            }
        });
        const finalBaggage = Object.entries(bagMapForItin).map(
            ([unit, weight]) => ({ weight, unit }),
        );
        if (finalBaggage.length === 0) finalBaggage.push({ weight: 0, unit: "KG" });

        const allFeatures = [...brandDetails.meals, ...brandDetails.others];

        itineraryMap[itinKey].brands.push({
            offerId,
            brandName: brandDetails.name || "Standard",
            brandCode: brandDetails.code || "STD",
            fare: totalAllPax,
            taxAmount: totalTax,
            baseFare: totalBase,
            totalSeats: 9,
            bookingCode: brandDetails.rbd || "Y",
            meal: brandDetails.meals.length ? brandDetails.meals.join(", ") : "N/A",
            baggageInformation: finalBaggage,
            fareBasisCode: brandDetails.code,
            brandInfo: {
                name: brandDetails.name || "Standard",
                features: allFeatures,
            },
            breakdown: priceInfo,
        });
    });

    return Object.values(itineraryMap).map((itin) => {
        itin.brands.sort((a, b) => a.fare - b.fare);
        const def = itin.brands[0] || {};
        const extra = {};

        if (def.breakdown?.adt)
            extra.adult = {
                count: adtCount,
                amount: def.breakdown.adt.amount,
                base: def.breakdown.adt.base,
                tax: def.breakdown.adt.tax,
            };
        if (def.breakdown?.chd)
            extra.child = {
                count: chdCount,
                amount: def.breakdown.chd.amount,
                base: def.breakdown.chd.base,
                tax: def.breakdown.chd.tax,
            };
        if (def.breakdown?.inf)
            extra.infants = {
                count: infCount,
                amount: def.breakdown.inf.amount,
                base: def.breakdown.inf.base,
                tax: def.breakdown.inf.tax,
            };

        const marketingCarrier = itin.departure[0]?.marketingCarrier;
        const airlineData = airlineLogoMap[marketingCarrier] || {
            arCode: marketingCarrier,
            logo: "default_logo_url",
            ar: marketingCarrier,
        };

        return {
            api: "hitit",
            arAbbreviation: airlineData.arCode,
            arCode: airlineData.ar,
            logo: airlineData.logo,
            operatingLogo: airlineData.logo,
            uuid: Math.random().toString(36).substring(7),
            departure: itin.departure.map((s) =>
                attachAirlineLogo({
                    ...s,
                    stopCount: itin.departure.length - 1,
                    meal: def.meal && def.meal !== "N/A" ? def.meal : "No Meal",
                }),
            ),

            return: itin.return.map((s) =>
                attachAirlineLogo({
                    ...s,
                    stopCount: itin.return.length - 1,
                    meal: def.meal && def.meal !== "N/A" ? def.meal : "No Meal",
                }),
            ),

            totalFare: def.fare,
            netFare: def.fare,
            baseFare: def.baseFare,
            totalTax: def.taxAmount,
            passengerTotalFare: def.fare,
            extra,

            brandedFare: {
                data: itin.brands.map((b) => ({
                    offerId: b.offerId,
                    brandName: b.brandName,
                    brandCode: b.brandCode,
                    fare: b.fare,
                    taxAmount: b.taxAmount,
                    adjustedPrice: calculateAdjustedPrice(
                        b.fare,
                        findMakrup,
                        staffMarkupValue,
                        staffMarkupType,
                        marketingCarrier,
                    ),
                    totalFare: calculateAdjustedPrice(
                        b.fare,
                        findMakrup,
                        staffMarkupValue,
                        staffMarkupType,
                        marketingCarrier,
                    ),
                    baseFare: b.baseFare,
                    totalSeats: b.totalSeats,
                    bookingCode: b.bookingCode,
                    meal: b.meal,
                    baggageInformation: b.baggageInformation,
                    fareBasisCode: b.fareBasisCode,
                    brandInfo: b.brandInfo,
                })),
            },
        };
    });
}

/**
 * Converts OrderCreate/OrderRetrieve response (OrderViewRS) to a cleaner JSON.
 */
function convertHititOrderViewToJson(rawResponse) {
    if (!rawResponse) return null;


    // Robust drill-down for SOAP Envelope or direct response
    let root = rawResponse;
    let env = getVal(root, /envelope/i);
    if (env) {
        let body = getVal(env, /body/i);
        root = body || env;
    }

    const rs = getVal(root, /orderviewrs/i) || getVal(root, /orderretrieve/i) || getVal(root, /orderchangers/i);
    // console.log("[Mapper] RS Keys:", Object.keys(rs || {}));

    // Check for SOAP Fault
    const fault = getVal(root, /fault/i);
    if (fault) {
        return {
            status: "error",
            message: getVal(fault, /faultstring/i) || "SOAP Fault",
            code: getVal(fault, /faultcode/i)
        };
    }

    if (!rs) {
        // If no RS and no Fault, but we have root, maybe root IS the RS?
        // But safely, if we found Body but no RS inside, it's likely an unknown error or empty.
        // Let's fallback to root if it looks like a response, otherwise return null to avoid swallowing errors.
        if (getVal(root, /response/i)) return convertHititOrderViewToJson(root);
        return null;
    }

    const error = getVal(rs, /error/i);
    if (error) {
        return {
            status: "error",
            code: getVal(error, /code/i),
            message: getVal(error, /desctext/i) || "API Error",
        };
    }

    const responseBlock = getVal(rs, /response/i);
    if (!responseBlock) {
        console.log("[Mapper] Response block NOT FOUND in RS. Keys:", Object.keys(rs));
        return null;
    }

    const order = getVal(responseBlock, /order/i);
    if (!order) {
        console.log("[Mapper] Order block NOT FOUND in response. Keys:", Object.keys(responseBlock));
        return null;
    }

    const pnr = getVal(order, /orderid/i);
    const status = getVal(order, /statuscode/i);
    console.log(`[Mapper] Processing PNR: ${pnr}, Status: ${status}`);

    const creationTime = getVal(order, /creationdatetime/i);

    const totalPriceObj = getVal(order, /totalprice/i);
    const totalAmount = totalPriceObj ? (getVal(totalPriceObj, /totalamount/i)?.["_"] || getVal(totalPriceObj, /totalamount/i)) : 0;
    const currency = totalPriceObj ? getVal(getVal(totalPriceObj, /totalamount/i), /curcode/i) : "PKR";

    // Extract DataLists for Segments
    const dataLists = getVal(rs, /datalists/i) || getVal(responseBlock, /datalists/i);
    if (!dataLists) console.log("[Mapper] DataLists NOT FOUND in RS or Response.");

    // ---- Extract meal from OrderItem FareTypeCode (brand name) ----
    // PIA brand-to-meal lookup: ECO LIGHT = no meal, SMART = no meal, FREEDOM = meal included
    const brandMealMap = {
        "ECOLIGHT": "Meal Provided",
        "ECO LIGHT": "Meal Provided",
        "ECL": "Meal Provided",
        "SMART": "Meal Provided",
        "ECC": "Meal Provided",
        "FREEDOM": "Meal Provided",
        "ECO FLEX": "Meal Provided",
        "ECF": "Meal Provided",
        "MEAL": "Meal Provided",
    };

    let mealFromBrand = "No Meal"; // default fallback
    let paymentDeadline = null;    // PaymentTimeLimitDateTime
    try {
        const orderItemsRaw = getVal(order, /orderitem/i) || [];
        const orderItems = Array.isArray(orderItemsRaw) ? orderItemsRaw : [orderItemsRaw];
        // Extract payment deadline from the first OrderItem
        if (orderItems.length > 0) {
            paymentDeadline = getVal(orderItems[0], /paymenttimelimitdatetime/i) || null;
        }
        outer: for (const oi of orderItems) {
            const fareDetailRaw = getVal(oi, /faredetail/i) || [];
            const fareDetails = Array.isArray(fareDetailRaw) ? fareDetailRaw : [fareDetailRaw];
            for (const fd of fareDetails) {
                const fc = getVal(fd, /farecomponent/i) || {};
                const fareTypeCode = (getVal(fc, /faretypecode/i) || "").toUpperCase().trim();
                const fareBasisCode = (getVal(fc, /farebasiscode/i) || "").toUpperCase().trim();
                // Check brand name against meal map
                for (const [brand, meal] of Object.entries(brandMealMap)) {
                    if (fareTypeCode.includes(brand) || fareBasisCode.includes(brand)) {
                        mealFromBrand = meal;
                        break outer;
                    }
                }
                // Also check if the fare type itself contains MEAL
                if (fareTypeCode.includes("MEAL")) {
                    mealFromBrand = "Meal Provided";
                    break outer;
                }
            }
        }
    } catch (e) {
        console.log("[Mapper] Could not extract meal from OrderItem:", e.message);
    }

    let departure = [];
    let returnSegments = [];

    // Setup logo map for enrichment
    let airlineLogoMap = {};
    try {
        airlineLogo?.forEach(({ arCode, logo, ar }) => {
            airlineLogoMap[arCode] = { ar, logo, arCode };
        });
    } catch (error) {
        console.error("[Mapper] Error processing airline logo data:", error);
    }

    const attachAirlineLogo = (segment) => {
        const code = segment.marketingCarrier;
        const airlineData = airlineLogoMap[code] || {
            arCode: code,
            logo: "https://res.cloudinary.com/wego/f_auto,fl_lossy,w_1000,q_auto/v1480072078/flights/airlines_square/" + code,
            ar: segment.marketingCarrierName || code,
        };

        return {
            ...segment,
            logo: {
                arCode: airlineData.arCode,
                ar: airlineData.ar,
                logo: airlineData.logo,
            },
        };
    };

    if (dataLists) {
        // 1. Map all segments first
        const segListKey = findKey(dataLists, /paxsegmentlist/i);
        const segRaw = segListKey ? (getVal(dataLists[segListKey], /paxsegment/i) || []) : [];
        const segArray = Array.isArray(segRaw) ? segRaw : [segRaw];

        const segmentMap = {};
        segArray.forEach(seg => {
            const segId = getVal(seg, /paxsegmentid/i);
            if (!segId) return;

            const marketingInfo = getVal(seg, /marketingcarrierinfo/i) || {};
            const operatingInfo = getVal(seg, /operatingcarrierinfo/i) || {};
            const dep = getVal(seg, /dep/i) || {};
            const arrival = getVal(seg, /arrival/i) || {};
            const datedLeg = getVal(seg, /datedoperatingleg/i) || {};

            // Try exhaustive fallbacks for aircraft name/code
            let aircraftName = "";
            const rawAltAircraft = getVal(datedLeg, /carrieraircrafttype/i);
            const opEquip = getVal(operatingInfo, /equipment/i);
            const markEquip = getVal(marketingInfo, /equipment/i);
            const directEquip = getVal(seg, /equipment/i) || getVal(seg, /aircrafttype/i) || getVal(seg, /aircraft/i);

            if (rawAltAircraft) {
                if (typeof rawAltAircraft === "string") aircraftName = rawAltAircraft;
                else aircraftName = getVal(rawAltAircraft, /typename/i) || getVal(rawAltAircraft, /carrieraircrafttypename/i) || rawAltAircraft?.["_"];
            }
            if (!aircraftName && opEquip) aircraftName = getVal(opEquip, /aircraftcode/i) || getVal(opEquip, /equipmentcode/i) || (typeof opEquip === 'string' ? opEquip : "");
            if (!aircraftName && markEquip) aircraftName = getVal(markEquip, /aircraftcode/i) || getVal(markEquip, /equipmentcode/i);
            if (!aircraftName && directEquip) {
                aircraftName = (typeof directEquip === "string") ? directEquip : (getVal(directEquip, /aircraftcode/i) || getVal(directEquip, /equipmentcode/i) || directEquip?.["_"]);
            }

            // Fallback: Scan child objects for aircraft keywords
            if (!aircraftName) {
                Object.values(seg).forEach(val => {
                    if (val && typeof val === 'object' && !aircraftName) {
                        aircraftName = getVal(val, /aircraftcode/i) || getVal(val, /equipmentcode/i) || getVal(val, /typename/i);
                    }
                });
            }

            aircraftName = aircraftName || "";
            const carrierCode = getVal(marketingInfo, /carrierdesigcode/i);
            console.log(`[Mapper] Segment ${segId}: final aircraftName: "${aircraftName}"`);

            const segmentData = {
                marketingCarrier: carrierCode,
                marketingCarrierName: getVal(marketingInfo, /carriername/i) || airlineLogoMap[carrierCode]?.ar || "PAKISTAN AIRLINES",
                marketingFlightNumber: getVal(marketingInfo, /flightnumber/i),
                operating: getVal(operatingInfo, /carrierdesigcode/i) || carrierCode,
                operatingFlightNumber: getVal(operatingInfo, /flightnumber/i) || getVal(marketingInfo, /flightnumber/i),
                departureTime: getVal(dep, /datetime/i),
                arrivalTime: getVal(arrival, /datetime/i),
                departureLocation: getVal(dep, /locationcode/i),
                departureStation: getVal(dep, /stationname/i),
                arrivalLocation: getVal(arrival, /locationcode/i),
                arrivalStation: getVal(arrival, /stationname/i),
                equipmentType: aircraftName,
                aircraft: aircraftName,
                duration: getVal(seg, /duration/i) || getVal(seg, /elapsedtime/i),
                meal: mealFromBrand,
                id: segId,
                cabin: {
                    code: getVal(getVal(seg, /cabintype/i), /typecode/i) || "Y",
                    name: getVal(getVal(seg, /cabintype/i), /typename/i) || "ECONOMY"
                }
            };

            segmentMap[segId] = attachAirlineLogo(segmentData);
        });

        // 2. Map Journeys to Segments
        const journeyListKey = findKey(dataLists, /paxjourneylist/i);
        const journeyRaw = journeyListKey ? (getVal(dataLists[journeyListKey], /paxjourney/i) || []) : [];
        const journeyArray = Array.isArray(journeyRaw) ? journeyRaw : [journeyRaw];

        const journeyMap = {};
        journeyArray.forEach(j => {
            const jId = getVal(j, /paxjourneyid/i);
            if (!jId) return;
            const sRefs = getVal(j, /paxsegmentrefid/i);
            journeyMap[jId] = (Array.isArray(sRefs) ? sRefs : [sRefs]).map(ref => segmentMap[ref]).filter(Boolean);
        });

        // 3. Map OriginDest to Journeys
        const odListKey = findKey(dataLists, /origindestlist/i);
        const odRaw = odListKey ? (getVal(dataLists[odListKey], /origindest/i) || []) : [];
        const odArray = Array.isArray(odRaw) ? odRaw : [odRaw];

        odArray.forEach((od, idx) => {
            const jRefs = getVal(od, /paxjourneyrefid/i);
            const journeyRefs = Array.isArray(jRefs) ? jRefs : [jRefs];
            const segments = journeyRefs.flatMap(ref => journeyMap[ref] || []);

            if (idx === 0) departure = segments;
            else if (idx === 1) returnSegments = segments;
        });

        // Fallback: If no OD/Journey mapping but we have segments, put them in departure
        if (departure.length === 0 && returnSegments.length === 0 && segArray.length > 0) {
            departure = Object.values(segmentMap);
        }
    }

    // Extract Tickets first to associate with travelers
    const ticketDocInfo = getVal(responseBlock, /ticketdocinfo/i) ||
        getVal(order, /ticketdocinfo/i) ||
        getVal(dataLists, /ticketdocinfo/i) ||
        getVal(rs, /ticketdocinfo/i) ||
        getVal(getVal(rs, /response/i), /ticketdocinfo/i);

    const ticketsRaw = Array.isArray(ticketDocInfo) ? ticketDocInfo : (ticketDocInfo ? [ticketDocInfo] : []);

    const tickets = ticketsRaw.map((td) => {
        const t = getVal(td, /ticket/i);
        const bookingRef = getVal(td, /bookingref/i);
        const bookingId = bookingRef ? getVal(bookingRef, /bookingid/i) : "";
        const paxRefId = getVal(td, /paxrefid/i);
        const dateOfIssue = getVal(td, /dateofissue/i);

        return {
            ticketNumber: t ? getVal(t, /ticketnumber/i) : "",
            status: t ? getVal(getVal(t, /coupon/i), /couponstatuscode/i) : "",
            bookingId: bookingId,
            paxRefId: paxRefId,
            dateOfIssue: dateOfIssue
        };
    });

    // 4. Map Travelers
    const paxListKey = findKey(dataLists, /paxlist/i);
    const paxRaw = paxListKey ? (getVal(dataLists[paxListKey], /pax/i) || []) : [];
    const paxArray = Array.isArray(paxRaw) ? paxRaw : [paxRaw];

    const travelers = paxArray.map((p) => {
        const individual = getVal(p, /individual/i) || {};
        const identityDoc = getVal(p, /identitydoc/i) || {};
        const paxId = getVal(p, /paxid/i);

        // Find associated ticket number
        const associatedTicket = tickets.find(t => t.paxRefId === paxId);

        const title = getVal(individual, /titlename/i) || "";
        const firstName = getVal(individual, /givenname/i) || "";
        const lastName = getVal(individual, /surname/i) || "";

        // Match Sabre format: "FirstName Title LastName" or similar
        const fullGivenName = [firstName, title, lastName].filter(Boolean).join(" ");

        return {
            ticketNumber: associatedTicket ? associatedTicket.ticketNumber : "",
            givenName: fullGivenName,
            identityDocuments: [
                {
                    birthDate: getVal(p, /birthdate/i),
                    documentNumber: getVal(identityDoc, /identitydocid/i),
                    documentType: getVal(identityDoc, /identitydoctypecode/i) === "PT" ? "PASSPORT" : (getVal(identityDoc, /identitydoctypecode/i) || "PASSPORT"),
                    expiryDate: getVal(identityDoc, /expirydate/i),
                    gender: getVal(individual, /gendercode/i) === "M" ? "MALE" : (getVal(individual, /gendercode/i) === "F" ? "FEMALE" : getVal(individual, /gendercode/i)),
                    isPrimaryDocumentHolder: null,
                    issuingCountryCode: getVal(identityDoc, /issuingcountrycode/i),
                    residenceCountryCode: getVal(identityDoc, /issuingcountrycode/i),
                    surname: fullGivenName
                }
            ],
            id: paxId,
            ptc: getVal(p, /ptc/i)
        };
    });

    return {
        status: "success",
        pnr,
        orderStatus: status,
        creationTime,
        paymentDeadline,
        totalPrice: {
            amount: Number(totalAmount),
            currency,
        },
        departure,
        return: returnSegments,
        travelers,
        tickets,
    };
}

/**
 * Converts Hitit OrderRulesRS to a clean JSON format.
 * @param {Object} rawResponse - Raw response from doOrderFare; rawResponse.body is a raw XML string
 * @returns {Object} Cleaned fare rules with ruleCode, title, and text
 */
function convertHititOrderFareToJson(rawResponse) {
    if (!rawResponse) return null;

    // ─── Numeric rule code → human-readable title ──────────────────────────
    const RULE_TITLES = {
        "01": "Eligibility",
        "03": "Seasonality",
        "04": "Flight Application",
        "05": "Advance Reservations / Ticketing",
        "07": "Travel Restrictions",
        "08": "Stopovers",
        "09": "Transfers / Routing",
        "10": "Combinations",
        "12": "Special Passengers",
        "14": "Travel Validity",
        "15": "Sales Restrictions",
        "16": "Penalties (Changes / Cancellations)",
        "17": "Higher Intermediate Point",
        "18": "Ticket Endorsements",
        "19": "Children / Unaccompanied Minors",
        "22": "Discounts",
        "23": "Baggage Allowance",
        "31": "Voluntary Changes",
        "33": "Refunds",
        "35": "Agent Restrictions",
    };

    // ─── Helper: navigate a parsed xml2js object to find FareRules ─────────
    function extractFromParsed(parsedRoot) {
        let env = getVal(parsedRoot, /envelope/i) || parsedRoot;
        let body = getVal(env, /body/i) || env;
        let rs = getVal(body, /orderrulesrs/i);
        if (!rs) return null;

        const resp = getVal(rs, /response/i);
        if (!resp) return null;

        const rules = getVal(resp, /rules/i);
        if (!rules) return null;

        const airlineCode = getVal(rules, /airlinedesigcode/i) || "";

        // FareRule may be array or single object
        const fareRuleRaw = getVal(rules, /farerule/i);
        const fareRuleArray = Array.isArray(fareRuleRaw)
            ? fareRuleRaw
            : fareRuleRaw ? [fareRuleRaw] : [];

        // Deduplicate by ruleCode — keep first occurrence of each text
        const rulesMap = new Map(); // ruleCode → { title, texts: Set }

        fareRuleArray.forEach((fr) => {
            const rawCode = getVal(fr, /rulecode/i);
            if (!rawCode) return; // skip header-only rows with no ruleCode

            const ruleCode = String(rawCode).trim().padStart(2, "0");

            // FareRuleText can be array or single
            const frtRaw = getVal(fr, /fareruletext/i);
            const frtArray = Array.isArray(frtRaw) ? frtRaw : (frtRaw ? [frtRaw] : []);

            frtArray.forEach((frt) => {
                const text = (getVal(frt, /remarktext/i) || "").trim();
                if (!text) return;

                if (!rulesMap.has(ruleCode)) {
                    rulesMap.set(ruleCode, {
                        ruleCode,
                        title: RULE_TITLES[ruleCode] || `Rule ${ruleCode}`,
                        texts: new Set(),
                    });
                }
                rulesMap.get(ruleCode).texts.add(text);
            });
        });

        // Build sorted remarks array
        const remarks = Array.from(rulesMap.values())
            .sort((a, b) => Number(a.ruleCode) - Number(b.ruleCode))
            .map(({ ruleCode, title, texts }) => ({
                ruleCode,
                title,
                text: Array.from(texts).join("\n\n").trim(),
            }));

        return { airlineCode, remarks };
    }

    // ─── Case 1: rawResponse.body is a raw XML string ──────────────────────
    if (typeof rawResponse.body === "string" && rawResponse.body.trim().startsWith("<")) {
        try {
            const xml2js = require("xml2js");
            const parser = new xml2js.Parser({
                explicitArray: false,
                mergeAttrs: true,
                explicitCharkey: false,
                trim: true,
                normalize: true,
                ignoreAttrs: false,
                strict: false,
            });

            let parsedResult = null;
            // xml2js.parseString is sync-via-callback when no async option set
            parser.parseString(rawResponse.body, (err, result) => {
                if (!err) parsedResult = result;
                else console.error("[Mapper Fare] xml2js parse error:", err.message);
            });

            if (parsedResult) {
                const extracted = extractFromParsed(parsedResult);
                if (extracted) {
                    return {
                        status: "success",
                        airlineCode: extracted.airlineCode,
                        remarks: extracted.remarks,
                        penalties: [],
                    };
                }
            }
        } catch (e) {
            console.error("[Mapper Fare] Exception parsing raw XML body:", e.message);
        }
        return { status: "success", airlineCode: "", remarks: [], penalties: [] };
    }

    // ─── Case 2: rawResponse.body is a parsed JS object (legacy) ───────────
    const root = rawResponse.body || rawResponse;
    const extracted = extractFromParsed(root);

    if (!extracted) {
        console.log("[Mapper Fare] Could not navigate to FareRule data.");
        return { status: "success", airlineCode: "", remarks: [], penalties: [] };
    }

    return {
        status: "success",
        airlineCode: extracted.airlineCode,
        remarks: extracted.remarks,
        penalties: [],
    };
}

/**
 * Converts Hitit OrderChangeRS or OrderViewRS (from Cancel/Change) to clean JSON format.
 * @param {Object} rawResponse - Parsed SOAP envelope
 * @returns {Object} Cleaned order status or error info
 */
function convertHititOrderChangeToJson(rawResponse) {
    if (!rawResponse) return null;


    // Robust drill-down
    let root = rawResponse.body || rawResponse;
    let env = getVal(root, /envelope/i) || root;
    let body = getVal(env, /body/i) || env;

    // Check for SOAP Fault
    const fault = getVal(body, /fault/i);
    if (fault) {
        return {
            status: "error",
            message: getVal(fault, /faultstring/i) || "SOAP Fault",
            code: getVal(fault, /faultcode/i)
        };
    }

    // Hitit OrderChange often returns IATA_OrderViewRS
    let rs = getVal(body, /orderviewrs/i) || getVal(body, /orderchangers/i);

    if (!rs) {
        // Fallback: check if the whole response is the RS (already parsed deeply)
        if (getVal(rawResponse, /response/i)) rs = rawResponse;
    }

    if (!rs) {
        // Last resort: return raw if structure is unknown but not an obvious error
        return {
            status: "unknown",
            message: "Could not find expected RS block",
            rawKeys: Object.keys(body || {})
        };
    }

    const error = getVal(rs, /error/i);
    if (error) {
        return {
            status: "error",
            message: getVal(error, /desctext/i) || "API Error",
            code: getVal(error, /code/i)
        };
    }

    const resp = getVal(rs, /response/i);
    if (!resp) return { status: "success", message: "Action completed but no response details found" };

    const order = getVal(resp, /order/i);
    const pnr = getVal(order, /orderid/i);
    const orderStatus = getVal(order, /statuscode/i);

    return {
        status: "success",
        pnr,
        orderStatus: orderStatus || "UNKNOWN",
        message: "Order updated successfully"
    };
}

module.exports = {
    convertHititAirShoppingToJson,
    convertHititOrderViewToJson,
    convertHititOrderFareToJson,
    convertHititOrderChangeToJson,
};
