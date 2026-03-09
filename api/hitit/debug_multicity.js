const { doAirShopping } = require('./hititNdcService');
const { convertHititAirShoppingToJson } = require('./hititMapper');
const fs = require('fs');

async function debugMultiCity() {
    const params = {
        tripType: "MultiDestination",
        currency: "PKR",
        cabinClass: "Y",
        paxList: [
            { paxID: "PAX-1", ptc: "ADT" }
        ],
        originDestCriteria: [
            {
                originCode: "KHI",
                destCode: "LHE",
                departureDate: "2026-06-10"
            },
            {
                originCode: "LHE",
                destCode: "ISB",
                departureDate: "2026-06-12"
            },
            {
                originCode: "ISB",
                destCode: "KHI",
                departureDate: "2026-06-15"
            }
        ]
    };

    try {
        console.log("Sending MultiCity Request...");
        const result = await doAirShopping(params);
        fs.writeFileSync('debug_multicity_raw.json', JSON.stringify(result, null, 2));
        console.log("Raw result saved to debug_multicity_raw.json");

        const mapped = convertHititAirShoppingToJson(result);
        console.log("Mapped Result Summary:", JSON.stringify(mapped, null, 2));

    } catch (error) {
        console.error("Debug Error:", error);
    }
}

debugMultiCity();
