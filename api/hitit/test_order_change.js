require("dotenv").config();
const { doOrderChange } = require("./hititNdcService");

async function testOrderChange() {
    try {
        const params = {
            orderId: "801915",
            ownerCode: "PK",
            currency: "PKR",
            paymentFunctions: [
                {
                    amount: 22520,
                    paymentMethod: {
                        typeCode: "INV"
                    }
                }
            ]
        };

        console.log("Starting DoOrderChange (Ticketing) test...");
        const result = await doOrderChange(params);
        console.log("Result:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testOrderChange();
