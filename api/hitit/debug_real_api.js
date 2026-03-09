
require("dotenv").config();
const { doAirShopping } = require("./hititNdcService");
const { convertHititAirShoppingToJson } = require("./hititMapper");
const fs = require('fs');

async function runDebug() {
    console.log("Starting Debug Request...");

    // Future date format: YYYY-MM-DD
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];

    const params = {
        tripType: "OneWay",
        currency: "PKR",
        cabinClass: "Y",
        paxList: [
            { paxID: "PAX-1", ptc: "ADT" }
        ],
        originDestCriteria: [
            {
                originCode: "KHI",
                destCode: "ISB",
                departureDate: dateStr
            }
        ]
    };

    try {
        console.log(`Sending request for date: ${dateStr}`);
        const result = await doAirShopping(params);

        console.log("\n--- Raw Result Keys ---");
        console.log(Object.keys(result));

        // Save raw result to file for inspection
        fs.writeFileSync('debug_raw_result.json', JSON.stringify(result, null, 2));
        console.log("Saved raw result to 'debug_raw_result.json'");

        const mapped = convertHititAirShoppingToJson(result);
        console.log("\n--- Mapped Result ---");
        console.log(JSON.stringify(mapped, null, 2));

    } catch (error) {
        console.error("Error running debug:", error);
    }
}

runDebug();
