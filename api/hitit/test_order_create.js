const { doOrderCreate } = require("./hititNdcService");

async function testOrder() {
    try {
        const params = {
            offerRefId: "MDFlMDc3Y2M4MjhjMGJjZWU2NDdkNTcxMzhhYzJiNjFiYmEyODgxOThkMThkMjA3OWY4YWVkNTBmYjA3ZmMwNzAzN2YyODQ1MDZkMGE3ZGVjNDUzZTA1OWM5NDgxY2I2MjMyNTczZmE0Yjc5YTlhMmQyMDI2OGJkOTA4NDRiNGYxMjYxNjUyZTRhNThlMzM4ZGI2YTY1NjU2NDgyMDk1NTY5NDJhZTk3YTU4N2QwMzk1Njk0ZDIyNTYyNGViMTE3ZTM0ZTM1MDQ2MzMwOTljYjM2MmUxZjdmYWE0M2VjPlZOQkFHPkVDTyBMSUdIVD5LSEk+SVNCPjIwMjYtMDUtMjggMDc6MDA6MDA+MjAyNi0wNS0yOCAwODo1NTowMD5QSz4zMDA+Vj44PkVDT05PTVk+MzIwPlMwaEpTVk5DTXpBdz4tMT44NzlkNGNlYS02MjBmLTQ0NmItYmY0MS1lMWMwOGI4YzAxNDcjMD5PTkVfV0FZPktIST5QSz5JU0I+UEs+LTE+RE9NRVNUSUM+RUNPTElHSFQ+RUNMPkVDTyBMSUdIVD4wPjA+MC4wPlBLUg==-",
            ownerCode: "PK",
            selectedOfferItems: [
                { offerItemRefId: "OfferItem-1", paxRefId: "PAX-ADT1" },
                { offerItemRefId: "OfferItem-1", paxRefId: "PAX-ADT2" },
                { offerItemRefId: "OfferItem-5", paxRefId: "PAX-CHD1" },
                { offerItemRefId: "OfferItem-3", paxRefId: "PAX-INF1" }
            ],
            totalAmount: "64560.00",
            currency: "PKR",
            contactInfoList: [
                {
                    contactInfoID: "Contact-1",
                    emailAddress: "sample@hititcs.com",
                    phone: {
                        areaCodeNumber: "555",
                        countryDialingCode: "92",
                        phoneNumber: "4443322"
                    }
                }
            ],
            paxList: [
                {
                    paxID: "PAX-ADT1",
                    ptc: "ADT",
                    birthdate: "1990-01-15",
                    citizenshipCountryCode: "PK",
                    contactInfoRefID: "Contact-1",
                    identityDoc: {
                        identityDocID: "3740214078980",
                        identityDocTypeCode: "NATIONAL_ID"
                    },
                    individual: {
                        genderCode: "M",
                        givenName: "AHMED",
                        individualID: "IND-ADT1",
                        surname: "KHAN",
                        titleName: "MR"
                    }
                },
                {
                    paxID: "PAX-ADT2",
                    ptc: "ADT",
                    birthdate: "1992-05-20",
                    citizenshipCountryCode: "PK",
                    contactInfoRefID: "Contact-1",
                    identityDoc: {
                        identityDocID: "3740214078981",
                        identityDocTypeCode: "NATIONAL_ID"
                    },
                    individual: {
                        genderCode: "F",
                        givenName: "FATIMA",
                        individualID: "IND-ADT2",
                        surname: "KHAN",
                        titleName: "MRS"
                    }
                },
                {
                    paxID: "PAX-CHD1",
                    ptc: "CHD",
                    birthdate: "2016-08-10",
                    citizenshipCountryCode: "PK",
                    contactInfoRefID: "Contact-1",
                    identityDoc: {
                        identityDocID: "3740214078982",
                        identityDocTypeCode: "NATIONAL_ID"
                    },
                    individual: {
                        genderCode: "M",
                        givenName: "ALI",
                        individualID: "IND-CHD1",
                        surname: "KHAN",
                        titleName: "MSTR"
                    }
                },
                {
                    paxID: "PAX-INF1",
                    ptc: "INF",
                    birthdate: "2025-03-15",
                    citizenshipCountryCode: "PK",
                    contactInfoRefID: "Contact-1",
                    identityDoc: {
                        identityDocID: "3740214078983",
                        identityDocTypeCode: "NATIONAL_ID"
                    },
                    individual: {
                        genderCode: "F",
                        givenName: "SARA",
                        individualID: "IND-INF1",
                        surname: "KHAN",
                        titleName: "MISS"
                    },
                    paxRefID: "PAX-ADT1"
                }
            ]
        };

        console.log("Starting DoOrderCreate test...");
        const result = await doOrderCreate(params);
        console.log("Result:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testOrder();
