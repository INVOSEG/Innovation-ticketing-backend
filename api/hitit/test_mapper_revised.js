const { convertHititAirShoppingToJson } = require('./hititMapper');

// Mock Hitit Response Object (as parsed by xml2js with explicitArray: false)
// Using NS8 (uppercase) and CarrierOffers to match hititMapper.js logic
const mockHititResponse = {
    "S:Envelope": {
        "S:Body": {
            "NS8:IATA_AirShoppingRS": {
                "NS8:Response": {
                    "NS8:DataLists": {
                        "NS8:PaxList": {
                            "NS8:Pax": [
                                { "NS8:PaxID": "PAX-1", "NS8:PTC": "ADT" },
                                { "NS8:PaxID": "PAX-2", "NS8:PTC": "INF" }
                            ]
                        },
                        "NS8:PaxSegmentList": {
                            "NS8:PaxSegment": [
                                {
                                    "NS8:PaxSegmentID": "SEG-1",
                                    "NS8:MarketingCarrierInfo": { "NS8:CarrierDesigCode": "PK", "NS8:CarrierName": "Pakistan International Airlines", "NS8:MarketingCarrierFlightNumberText": "300" },
                                    "NS8:OperatingCarrierInfo": { "NS8:CarrierDesigCode": "PK", "NS8:OperatingCarrierFlightNumberText": "300" },
                                    "NS8:Dep": { "NS8:IATA_LocationCode": "KHI", "NS8:AircraftScheduledDateTime": "2024-12-20T10:00:00" },
                                    "NS8:Arrival": { "NS8:IATA_LocationCode": "ISB", "NS8:AircraftScheduledDateTime": "2024-12-20T12:00:00" },
                                    "NS8:DatedOperatingLeg": { "NS8:CarrierAircraftType": { "NS8:CarrierAircraftTypeName": "Airbus A320" } }
                                },
                                {
                                    "NS8:PaxSegmentID": "SEG-2",
                                    "NS8:MarketingCarrierInfo": { "NS8:CarrierDesigCode": "PK", "NS8:CarrierName": "Pakistan International Airlines", "NS8:MarketingCarrierFlightNumberText": "301" },
                                    "NS8:OperatingCarrierInfo": { "NS8:CarrierDesigCode": "PK", "NS8:OperatingCarrierFlightNumberText": "301" },
                                    "NS8:Dep": { "NS8:IATA_LocationCode": "ISB", "NS8:AircraftScheduledDateTime": "2024-12-25T15:00:00" },
                                    "NS8:Arrival": { "NS8:IATA_LocationCode": "KHI", "NS8:AircraftScheduledDateTime": "2024-12-25T17:00:00" },
                                    "NS8:DatedOperatingLeg": { "NS8:CarrierAircraftType": { "NS8:CarrierAircraftTypeName": "Airbus A320" } }
                                }
                            ]
                        },
                        "NS8:PaxJourneyList": {
                            "NS8:PaxJourney": [
                                { "NS8:PaxJourneyID": "JOURNEY-1", "NS8:PaxSegmentRefID": "SEG-1" },
                                { "NS8:PaxJourneyID": "JOURNEY-2", "NS8:PaxSegmentRefID": "SEG-2" }
                            ]
                        },
                        "NS8:OriginDestList": {
                            "NS8:OriginDest": [
                                { "NS8:OriginDestID": "OD-1", "NS8:PaxJourneyRefID": "JOURNEY-1" },
                                { "NS8:OriginDestID": "OD-2", "NS8:PaxJourneyRefID": "JOURNEY-2" }
                            ]
                        }
                    },
                    "NS8:OffersGroup": {
                        "NS8:CarrierOffers": {
                            "NS8:Offer": {
                                "NS8:OfferID": "OFFER-1",
                                "NS8:JourneyOverview": {
                                    "NS8:JourneyPriceClass": [
                                        { "NS8:PaxJourneyRefID": "JOURNEY-1" },
                                        { "NS8:PaxJourneyRefID": "JOURNEY-2" }
                                    ]
                                },
                                "NS8:OfferItem": [
                                    {
                                        "NS8:OfferItemID": "ITEM-1-ADT",
                                        "NS8:PaxRefID": "PAX-1",
                                        "NS8:Price": {
                                            "NS8:BaseAmount": { "_": "10000", "CurCode": "PKR" },
                                            "NS8:TaxSummary": { "NS8:TotalTaxAmount": { "_": "2000" } },
                                            "NS8:TotalAmount": { "_": "12000" }
                                        },
                                        "NS8:FareDetail": [
                                            {
                                                "NS8:FareComponent": {
                                                    "NS8:PaxSegmentRefID": "SEG-1",
                                                    "NS8:FareBasisCode": "YOW",
                                                    "NS8:RBD": { "NS8:RBD_Code": "Y" },
                                                    "NS8:CabinType": { "NS8:CabinTypeCode": "Y", "NS8:CabinTypeName": "ECONOMY" }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "NS8:OfferItemID": "ITEM-1-INF",
                                        "NS8:PaxRefID": "PAX-2",
                                        "NS8:Price": {
                                            "NS8:BaseAmount": { "_": "2000", "CurCode": "PKR" },
                                            "NS8:TaxSummary": { "NS8:TotalTaxAmount": { "_": "500" } },
                                            "NS8:TotalAmount": { "_": "2500" }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    }
};

try {
    console.log("Starting Mapper Verification...");
    const results = convertHititAirShoppingToJson(mockHititResponse);

    if (results.length === 0) {
        console.error("FAIL: No results returned");
        process.exit(1);
    }

    const result = results[0];
    console.log("\n--- Verification Results ---");
    console.log("Total Results:", results.length);
    console.log("Departure Segments:", result.departure.length);
    console.log("Return Segments:", result.return.length);
    console.log("Total Fare:", result.totalFare);

    // Check Cabin Info
    const firstSeg = result.departure[0];
    console.log("Segment Cabin:", firstSeg.cabin);
    if (firstSeg.cabin.name !== "ECONOMY") {
        console.error("FAIL: Cabin name 'ECONOMY' not found in segment");
    }

    // Check Equipment Type
    console.log("Equipment Type:", firstSeg.equipmentType);
    if (firstSeg.equipmentType !== "Airbus A320") {
        console.error("FAIL: Equipment type 'Airbus A320' not found");
    }

    // Check Infant Info
    console.log("Infant Info:", result.extra.infants);
    if (!result.extra.infants || result.extra.infants.count !== 1) {
        console.error("FAIL: Infant count should be 1");
    }

    if (result.departure.length === 1 && result.return.length === 1) {
        console.log("SUCCESS: Leg splitting worked (1 departure, 1 return)");
    } else {
        console.error("FAIL: Leg splitting failed", { dep: result.departure.length, ret: result.return.length });
    }

    console.log("\nFull Result Sample (first item):");
    console.log(JSON.stringify(result, null, 2));

} catch (error) {
    console.error("Error during verification:", error);
    process.exit(1);
}
