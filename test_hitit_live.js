require("dotenv").config();
const { doAirShopping, doOrderCreate, doOrderCancel } = require("./api/hitit/hititNdcService");
const { convertHititAirShoppingToJson, convertHititOrderViewToJson } = require("./api/hitit/hititMapper");

async function runLiveTest() {
    try {
        console.log("--- STEP 1: Search (AirShopping) ---");
        const searchParams = {
            originDestCriteria: [
                { originCode: "KHI", destCode: "ISB", departureDate: "2026-05-28" }
            ],
            paxList: [
                { paxID: "PAX1", ptc: "ADT" }
            ],
            currency: "PKR",
            cabinClass: "Y"
        };
        const searchRaw = await doAirShopping(searchParams);
        console.log("Raw Search Response Sample:", JSON.stringify(searchRaw).substring(0, 5000));
        const searchJson = convertHititAirShoppingToJson(searchRaw);

        if (!searchJson || searchJson.status === "error" || !Array.isArray(searchJson) || searchJson.length === 0) {
            console.error("Search failed or no offers found:", searchJson?.message || "No offers");
            return;
        }

        const pickedItin = searchJson[0];
        const pickedBrand = pickedItin.brandedFare.data[0];

        const selectedOffer = {
            offerId: pickedBrand.offerId,
            ownerCode: pickedBrand.ownerCode || "PK",
            offerItems: pickedBrand.offerItems,
            totalAmount: pickedBrand.fare
        };

        console.log(`[Test] Selected Offer: ${selectedOffer.offerId}, Fare: ${selectedOffer.totalAmount}`);

        console.log("\n--- STEP 2: Create Order (OrderCreate) ---");
        const createParams = {
            offerRefId: selectedOffer.offerId,
            ownerCode: selectedOffer.ownerCode || "PK",
            selectedOfferItems: selectedOffer.offerItems,
            totalAmount: selectedOffer.totalAmount,
            paxList: [
                {
                    paxID: "PAX1",
                    ptc: "ADT",
                    individual: {
                        givenName: "HUZAIFA",
                        surname: "AHMED",
                        genderCode: "M",
                        titleName: "MR"
                    },
                    birthdate: "1995-01-01",
                    contactInfoRefID: "Contact-1"
                }
            ],
            contactInfoList: [
                {
                    contactInfoID: "Contact-1",
                    emailAddress: "huzaifa@alsaboor.com",
                    phone: {
                        areaCodeNumber: "300",
                        countryDialingCode: "92",
                        phoneNumber: "1234567"
                    }
                }
            ],
            currency: "PKR"
        };

        const createRaw = await doOrderCreate(createParams);
        const createJson = convertHititOrderViewToJson(createRaw);

        if (!createJson || createJson.status === "error") {
            console.error("OrderCreate failed:", createJson?.message || "Unknown error");
            return;
        }

        const pnr = createJson.pnr;
        console.log(`Order created successfully! PNR: ${pnr}`);

        console.log("\n--- STEP 3: Cancel Order (OrderCancel) ---");
        // We do a COMMIT cancel to really close it
        const cancelResult = await doOrderCancel({ orderId: pnr, action: "COMMIT" });
        console.log("Cancel Result Status:", cancelResult.status === 200 || cancelResult.ok ? "SUCCESS" : "FAILED");
        console.log("Cancel Response:", JSON.stringify(cancelResult.body, null, 2));

    } catch (error) {
        console.error("Live test crashed:", error);
    }
}

runLiveTest();
