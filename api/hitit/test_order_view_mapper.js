const { convertHititOrderViewToJson } = require('./hititMapper');

const mockOrderViewRS = {
    "S:Envelope": {
        "S:Body": {
            "OrderViewRS": {
                "Response": {
                    "Order": {
                        "OrderID": "SPANJT",
                        "StatusCode": "TICKETED",
                        "CreationDateTime": "2026-02-12T06:04:00",
                        "TotalPrice": {
                            "TotalAmount": { "_": "116676", "CurCode": "PKR" }
                        }
                    },
                    "DataLists": {
                        "PaxList": {
                            "Pax": [
                                {
                                    "PaxID": "PAX-1",
                                    "PTC": "ADT",
                                    "BirthDate": "2000-05-19",
                                    "Individual": {
                                        "TitleName": "MR",
                                        "GivenName": "MUHAMMAD SHOAIB",
                                        "Surname": "JAMIL",
                                        "GenderCode": "M"
                                    },
                                    "IdentityDoc": {
                                        "IdentityDocID": "AS58937453",
                                        "IdentityDocTypeCode": "PT",
                                        "ExpiryDate": "2032-07-15",
                                        "IssuingCountryCode": "PK"
                                    }
                                }
                            ]
                        }
                    },
                    "TicketDocInfo": [
                        {
                            "Ticket": {
                                "TicketNumber": "1234567890123",
                                "Coupon": { "CouponStatusCode": "O" }
                            },
                            "PaxRefID": "PAX-1",
                            "DateOfIssue": "2026-02-12"
                        }
                    ]
                }
            }
        }
    }
};

try {
    console.log("Starting OrderView Mapper Verification...");
    const result = convertHititOrderViewToJson(mockOrderViewRS);

    if (!result) {
        console.error("FAIL: Result is null");
        process.exit(1);
    }

    console.log("\n--- Verification Results ---");
    console.log("PNR:", result.pnr);
    console.log("Order Status:", result.orderStatus);

    // Check Travelers key
    if (result.travelers) {
        console.log("SUCCESS: 'travelers' key found.");
        const traveler = result.travelers[0];
        console.log("Traveler GivenName:", traveler.givenName);
        console.log("Traveler TicketNumber:", traveler.ticketNumber);

        if (traveler.givenName === "MUHAMMAD SHOAIB MR JAMIL") {
            console.log("SUCCESS: givenName mapped correctly.");
        } else {
            console.error("FAIL: givenName mismatch. Got:", traveler.givenName);
        }

        if (traveler.ticketNumber === "1234567890123") {
            console.log("SUCCESS: ticketNumber associated correctly.");
        } else {
            console.error("FAIL: ticketNumber not associated.");
        }

        // Check IdentityDocuments
        if (Array.isArray(traveler.identityDocuments)) {
            console.log("SUCCESS: 'identityDocuments' is an array.");
            const doc = traveler.identityDocuments[0];
            console.log("Doc Number:", doc.documentNumber);
            console.log("Doc Type:", doc.documentType);
            console.log("Gender:", doc.gender);

            if (doc.documentType === "PASSPORT") {
                console.log("SUCCESS: documentType mapped to PASSPORT correctly.");
            }
            if (doc.gender === "MALE") {
                console.log("SUCCESS: gender mapped to MALE correctly.");
            }
        } else {
            console.error("FAIL: 'identityDocuments' is not an array.");
        }
    } else {
        console.error("FAIL: 'travelers' key NOT found. Existing keys:", Object.keys(result));
    }

    if (result.passengers) {
        console.error("FAIL: 'passengers' key still exists.");
    }

    console.log("\nFull Result Sample:");
    console.log(JSON.stringify(result, null, 2));

} catch (error) {
    console.error("Error during verification:", error);
    process.exit(1);
}
