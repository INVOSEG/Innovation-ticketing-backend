let dataa = {
  OTA_AirLowFareSearchRQ: {
    ResponseVersion: "v4",
    ResponseType: "GIR",
    Version: "3",
    POS: {
      Source: [
        {
          PseudoCityCode: "B8H8",
          RequestorID: { Type: "1", ID: "1", CompanyName: { Code: "TN" } },
        },
      ],
    },
    OriginDestinationInformation: [
      {
        RPH: "1",
        DepartureDateTime: "2026-07-05T00:00:00",
        OriginLocation: {
          LocationCode: "LHE",
        },
        DestinationLocation: {
          LocationCode: "SYD",
        },
      },
      {
        RPH: "2",
        DepartureDateTime: "2026-08-10T00:00:00",
        OriginLocation: {
          LocationCode: "IST",
        },
        DestinationLocation: {
          LocationCode: "KHI",
        },
      },
    ],
    TravelPreferences: {
      TPA_Extensions: {
        DataSources: { NDC: "Enable", ATPCO: "Enable", LCC: "Enable" },
        PreferNDCSourceOnTie: { Value: true },
      },
      CabinPref: [{ Cabin: "Economy", PreferLevel: "Preferred" }],
      VendorPref: [
        // { Code: "EK", PreferLevel: "Preferred" },
        // { Code: "QR", PreferLevel: "Preferred" },
        { Code: "PK", PreferLevel: "Unacceptable", Type: "Operating" },
      ],
      Baggage: { CarryOnInfo: true },
      ETicketDesired: true,
    },
    TravelerInfoSummary: {
      AirTravelerAvail: [
        { PassengerTypeQuantity: [{ Code: "ADT", Quantity: 1 }] },
      ],
      PriceRequestInformation: {
        CurrencyCode: "PKR",
        NegotiatedFareCode: [{ Code: "PKK45", Supplier: [{ Code: "BA" }] }],
        TPA_Extensions: {
          BrandedFareIndicators: {
            MultipleBrandedFares: true,
            ReturnBrandAncillaries: true,
          },
        },
      },
    },
    AvailableFlightsOnly: true,
    TPA_Extensions: {
      IntelliSellTransaction: { RequestType: { Name: "50ITINS" } },
    },
  },
};
// const bookingData = {
//   CreatePassengerNameRecordRS: {
//     ApplicationResults: {
//       status: "Complete",
//       Success: [
//         {
//           timeStamp: "2025-11-15T19:04:13.791Z",
//         },
//       ],
//       Warning: [
//         {
//           type: "BusinessLogic",
//           timeStamp: "2025-11-15T19:04:12.899Z",
//           SystemSpecificResults: [
//             {
//               Message: [
//                 {
//                   code: "WARN.SWS.HOST.ERROR_IN_RESPONSE",
//                   content: "SpecialServiceLLSRQ: .FRMT.NOT ENT BGNG WITH",
//                 },
//                 {
//                   content: "3CTCE/SHOAIBJAMIL43@GMAIL.COM-1.1",
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           type: "BusinessLogic",
//           timeStamp: "2025-11-15T19:04:13.473Z",
//           SystemSpecificResults: [
//             {
//               Message: [
//                 {
//                   code: "WARN.SWS.HOST.WARNING_RESPONSE",
//                   content: "EndTransactionLLSRQ: TTY REQ PEND",
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//     ItineraryRef: {
//       ID: "MGNXHJ",
//     },
//     AirBook: {
//       OriginDestinationOption: {
//         FlightSegment: [
//           {
//             ArrivalDateTime: "12-17T03:25",
//             DepartureDateTime: "12-17T01:50",
//             eTicket: true,
//             FlightNumber: "6085",
//             NumberInParty: "001",
//             ResBookDesigCode: "N",
//             Status: "QF",
//             DestinationLocation: {
//               LocationCode: "RUH",
//             },
//             MarketingAirline: {
//               Code: "SV",
//               FlightNumber: "6085",
//             },
//             OriginLocation: {
//               LocationCode: "MCT",
//             },
//           },
//           {
//             ArrivalDateTime: "12-17T11:45",
//             DepartureDateTime: "12-17T08:50",
//             eTicket: true,
//             FlightNumber: "6662",
//             NumberInParty: "001",
//             ResBookDesigCode: "N",
//             Status: "QF",
//             DestinationLocation: {
//               LocationCode: "DXB",
//             },
//             MarketingAirline: {
//               Code: "SV",
//               FlightNumber: "6662",
//             },
//             OriginLocation: {
//               LocationCode: "RUH",
//             },
//           },
//           {
//             ArrivalDateTime: "01-01T11:50",
//             DepartureDateTime: "01-01T10:40",
//             eTicket: true,
//             FlightNumber: "0563",
//             NumberInParty: "001",
//             ResBookDesigCode: "N",
//             Status: "QF",
//             DestinationLocation: {
//               LocationCode: "RUH",
//             },
//             MarketingAirline: {
//               Code: "SV",
//               FlightNumber: "0563",
//             },
//             OriginLocation: {
//               LocationCode: "DXB",
//             },
//           },
//           {
//             ArrivalDateTime: "01-01T19:10",
//             DepartureDateTime: "01-01T13:20",
//             eTicket: true,
//             FlightNumber: "0736",
//             NumberInParty: "001",
//             ResBookDesigCode: "N",
//             Status: "QF",
//             DestinationLocation: {
//               LocationCode: "LHE",
//             },
//             MarketingAirline: {
//               Code: "SV",
//               FlightNumber: "0736",
//             },
//             OriginLocation: {
//               LocationCode: "RUH",
//             },
//           },
//         ],
//       },
//     },
//     AirPrice: [
//       {
//         PriceQuote: {
//           MiscInformation: {
//             BaggageInfo: {
//               SubCodeProperties: [
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 1,
//                   AncillaryFeeGroupCode: "BG",
//                   AncillaryService: {
//                     SubGroupCode: "CY",
//                     Text: "CARRY ON HAND BAGGAGE",
//                   },
//                   CommercialNameofBaggageItemType:
//                     "CARRYON HAND BAGGAGE ALLOWANCE",
//                   EMD_Type: "4",
//                   ExtendedSubCodeKey: "0LNABF3",
//                   RFIC: "C",
//                 },
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 2,
//                   AncillaryFeeGroupCode: "BG",
//                   AncillaryService: {
//                     SubGroupCode: "CY",
//                     Text: "CARRY ON HAND BAGGAGE",
//                   },
//                   CommercialNameofBaggageItemType:
//                     "CARRYON HAND BAGGAGE ALLOWANCE",
//                   EMD_Type: "4",
//                   ExtendedSubCodeKey: "0LNABWY",
//                   RFIC: "C",
//                 },
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 3,
//                   AncillaryFeeGroupCode: "BG",
//                   AncillaryService: {
//                     SubGroupCode: "CY",
//                     Text: "CARRY ON HAND BAGGAGE",
//                   },
//                   CommercialNameofBaggageItemType:
//                     "CARRY7KG 15LB UPTO41LI 105LCM",
//                   DescriptionOne: {
//                     Code: "07",
//                     Text: "UP TO 15 POUNDS/7 KILOGRAMS",
//                   },
//                   DescriptionTwo: {
//                     Code: "4R",
//                     Text: "UP TO 41 LINEAR INCHES/105 LINEAR CENTIMETERS",
//                   },
//                   EMD_Type: "2",
//                   ExtendedSubCodeKey: "0M2ACWY",
//                   RFIC: "C",
//                   SizeWeightInfo: {
//                     MaximumSizeInAlternate: {
//                       Units: "C",
//                       content: "105",
//                     },
//                     MaximumSize: {
//                       Units: "I",
//                       content: "41",
//                     },
//                     MaximumWeightInAlternate: {
//                       Units: "K",
//                       content: "7",
//                     },
//                     MaximumWeight: {
//                       Units: "L",
//                       content: "15",
//                     },
//                   },
//                 },
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 4,
//                   AncillaryFeeGroupCode: "BG",
//                   CommercialNameofBaggageItemType: "PRE PAID BAGGAGE",
//                   EMD_Type: "2",
//                   ExtendedSubCodeKey: "0AAACSV",
//                   RFIC: "C",
//                   SSR_Code: "XBAG",
//                 },
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 5,
//                   AncillaryFeeGroupCode: "BG",
//                   CommercialNameofBaggageItemType: "FREE BAGGAGE ALLOWANCE",
//                   EMD_Type: "4",
//                   ExtendedSubCodeKey: "0DFAASV",
//                 },
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 6,
//                   AncillaryFeeGroupCode: "BG",
//                   CommercialNameofBaggageItemType:
//                     "UPTO50LB 23KG AND62LI 158LCM",
//                   DescriptionOne: {
//                     Code: "23",
//                     Text: "UP TO 50 POUNDS/23 KILOGRAMS",
//                   },
//                   DescriptionTwo: {
//                     Code: "6U",
//                     Text: "UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
//                   },
//                   EMD_Type: "4",
//                   ExtendedSubCodeKey: "0GOACSV",
//                   SizeWeightInfo: {
//                     MaximumSizeInAlternate: {
//                       Units: "C",
//                       content: "158",
//                     },
//                     MaximumSize: {
//                       Units: "I",
//                       content: "62",
//                     },
//                     MaximumWeightInAlternate: {
//                       Units: "K",
//                       content: "23",
//                     },
//                     MaximumWeight: {
//                       Units: "L",
//                       content: "50",
//                     },
//                   },
//                 },
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 7,
//                   AncillaryFeeGroupCode: "BG",
//                   AncillaryService: {
//                     SubGroupCode: "CY",
//                     Text: "CARRY ON HAND BAGGAGE",
//                   },
//                   CommercialNameofBaggageItemType:
//                     "ATE 5KG-115CM /UP TO 5KG-45INS",
//                   EMD_Type: "4",
//                   ExtendedSubCodeKey: "0LNABSV",
//                 },
//                 {
//                   SolutionSequenceNmbr: 1,
//                   RPH: 8,
//                   AncillaryFeeGroupCode: "BG",
//                   AncillaryService: {
//                     SubGroupCode: "CY",
//                     Text: "CARRY ON HAND BAGGAGE",
//                   },
//                   CommercialNameofBaggageItemType:
//                     "CARRY7KG 15LB UPTO45LI 115LCM",
//                   DescriptionOne: {
//                     Code: "07",
//                     Text: "UP TO 15 POUNDS/7 KILOGRAMS",
//                   },
//                   DescriptionTwo: {
//                     Code: "4U",
//                     Text: "UP TO 45 LINEAR INCHES/115 LINEAR CENTIMETERS",
//                   },
//                   EMD_Type: "4",
//                   ExtendedSubCodeKey: "0M3ACSV",
//                   SizeWeightInfo: {
//                     MaximumSizeInAlternate: {
//                       Units: "C",
//                       content: "115",
//                     },
//                     MaximumSize: {
//                       Units: "I",
//                       content: "45",
//                     },
//                     MaximumWeightInAlternate: {
//                       Units: "K",
//                       content: "7",
//                     },
//                     MaximumWeight: {
//                       Units: "L",
//                       content: "15",
//                     },
//                   },
//                 },
//               ],
//             },
//             HeaderInformation: [
//               {
//                 SolutionSequenceNmbr: "1",
//                 DepartureDate: "2025-12-17",
//                 Text: [
//                   "WHEN TICKETING FOP MUST NOT BE GTR",
//                   "VALIDATING CARRIER - SV",
//                   "BAG ALLOWANCE     -MCTDXB-01P/SV/EACH PIECE UP TO 50 POUND",
//                   "S/23 KILOGRAMS AND UP TO 62 LINEAR INCHES/158 LINEAR CENTI",
//                   "METERS",
//                   "2NDCHECKED BAG FEE-MCTDXB-PKR29610/SV",
//                   "BAG ALLOWANCE     -DXBLHE-01P/SV/EACH PIECE UP TO 50 POUND",
//                   "S/23 KILOGRAMS AND UP TO 62 LINEAR INCHES/158 LINEAR CENTI",
//                   "METERS",
//                   "2NDCHECKED BAG FEE-DXBLHE-PKR54150/SV",
//                   "CARRY ON ALLOWANCE",
//                   "MCTRUH-01P/07KG/WY",
//                   "01/UP TO 15 POUNDS/7 KILOGRAMS AND UP TO 41 LINEAR INCHES/",
//                   "105 LINEAR CENTIMETERS",
//                   "RUHDXB-10KG/F3",
//                   "DXBRUH RUHLHE-01P/SV",
//                   "01/UP TO 15 POUNDS/7 KILOGRAMS AND UP TO 45 LINEAR INCHES/",
//                   "115 LINEAR CENTIMETERS",
//                   "CARRY ON CHARGES",
//                   "MCTRUH-WY-CARRY ON FEES UNKNOWN-CONTACT CARRIER",
//                   "DXBRUH RUHLHE-SV-CARRY ON FEES UNKNOWN-CONTACT CARRIER",
//                   "ADDITIONAL ALLOWANCES AND/OR DISCOUNTS MAY APPLY DEPENDING ON",
//                   "FLYER-SPECIFIC FACTORS /E.G. FREQUENT FLYER STATUS/MILITARY/",
//                   "CREDIT CARD FORM OF PAYMENT/EARLY PURCHASE OVER INTERNET,ETC./",
//                 ],
//                 ValidatingCarrier: {
//                   Code: "SV",
//                 },
//               },
//             ],
//             SolutionInformation: [
//               {
//                 SolutionSequenceNmbr: "1",
//                 BaseFareCurrencyCode: "OMR",
//                 CurrencyCode: "PKR",
//                 GrandTotalBaseFareAmount: "257370",
//                 GrandTotalEquivFareAmount: "350.000",
//                 GrandTotalTaxes: "34857",
//                 RequiresRebook: "false",
//                 TicketNumber: "0",
//                 TotalAmount: "292227",
//               },
//             ],
//           },
//           PricedItinerary: {
//             AlternativePricing: "false",
//             CurrencyCode: "PKR",
//             MultiTicket: false,
//             TotalAmount: "292227",
//             AirItineraryPricingInfo: [
//               {
//                 SolutionSequenceNmbr: "1",
//                 BaggageProvisions: [
//                   {
//                     RPH: "1",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "2",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2025-12-17",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2025-12-17",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "DXB",
//                           RPH: 2,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "6085",
//                         },
//                         {
//                           RPH: 2,
//                           content: "6662",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "MCT",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "RUH",
//                           RPH: 2,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "6",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "N",
//                         },
//                         {
//                           RPH: 2,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "SV",
//                     NumPiecesBDI: "1",
//                     NumPiecesITR: ["1"],
//                     ProvisionType: "A",
//                     SubCodeInfo: {
//                       SubCodeForAllowance: [
//                         {
//                           RPH: 1,
//                           content: "0GOACSV",
//                         },
//                       ],
//                       SubCodeForChargesOthers: "0DFAASV",
//                     },
//                   },
//                   {
//                     RPH: "2",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "2",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2025-12-17",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2025-12-17",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "DXB",
//                           RPH: 2,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "6085",
//                         },
//                         {
//                           RPH: 2,
//                           content: "6662",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "MCT",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "RUH",
//                           RPH: 2,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "6",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "N",
//                         },
//                         {
//                           RPH: 2,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "SV",
//                     Commissionable: "N",
//                     FeeApplicationIndicator: "4",
//                     FeeNotGuaranteedIndicator: "N",
//                     Interlineable: "Y",
//                     PassengerType: {
//                       Code: "ADT",
//                     },
//                     PriceInformation: {
//                       Base: {
//                         Amount: "105.00",
//                         CurrencyCode: "USD",
//                       },
//                       Equiv: {
//                         Amount: "29610",
//                         CurrencyCode: "PKR",
//                       },
//                       TaxIndicator: "X",
//                       Total: "29610",
//                     },
//                     ProvisionType: "C",
//                     RefundReissue: "N",
//                     SubCodeInfo: {
//                       SubCodeForChargesOthers: "0AAACSV",
//                     },
//                   },
//                   {
//                     RPH: "3",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "2",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2025-12-17",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2025-12-17",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "DXB",
//                           RPH: 2,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "6085",
//                         },
//                         {
//                           RPH: 2,
//                           content: "6662",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "MCT",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "RUH",
//                           RPH: 2,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "6",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "N",
//                         },
//                         {
//                           RPH: 2,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "SV",
//                     Commissionable: "N",
//                     FeeApplicationIndicator: "4",
//                     FeeNotGuaranteedIndicator: "N",
//                     Interlineable: "Y",
//                     PassengerType: {
//                       Code: "ADT",
//                     },
//                     PriceInformation: {
//                       Base: {
//                         Amount: "105.00",
//                         CurrencyCode: "USD",
//                       },
//                       Equiv: {
//                         Amount: "29610",
//                         CurrencyCode: "PKR",
//                       },
//                       TaxIndicator: "X",
//                       Total: "29610",
//                     },
//                     ProvisionType: "P",
//                     RefundReissue: "N",
//                     SubCodeInfo: {
//                       SubCodeForChargesOthers: "0AAACSV",
//                     },
//                   },
//                   {
//                     RPH: "4",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "2",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2026-01-01",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2026-01-01",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "LHE",
//                           RPH: 2,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "563",
//                         },
//                         {
//                           RPH: 2,
//                           content: "736",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "DXB",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "RUH",
//                           RPH: 2,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "3",
//                         },
//                         {
//                           RPH: 2,
//                           content: "4",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "Q",
//                         },
//                         {
//                           RPH: 2,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "SV",
//                     NumPiecesBDI: "1",
//                     NumPiecesITR: ["1"],
//                     ProvisionType: "A",
//                     SubCodeInfo: {
//                       SubCodeForAllowance: [
//                         {
//                           RPH: 1,
//                           content: "0GOACSV",
//                         },
//                       ],
//                       SubCodeForChargesOthers: "0DFAASV",
//                     },
//                   },
//                   {
//                     RPH: "5",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "2",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2026-01-01",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2026-01-01",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "LHE",
//                           RPH: 2,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "563",
//                         },
//                         {
//                           RPH: 2,
//                           content: "736",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "DXB",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "RUH",
//                           RPH: 2,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "3",
//                         },
//                         {
//                           RPH: 2,
//                           content: "4",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "Q",
//                         },
//                         {
//                           RPH: 2,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "SV",
//                     Commissionable: "N",
//                     FeeApplicationIndicator: "4",
//                     FeeNotGuaranteedIndicator: "N",
//                     Interlineable: "Y",
//                     PassengerType: {
//                       Code: "ADT",
//                     },
//                     PriceInformation: {
//                       Base: {
//                         Amount: "192.00",
//                         CurrencyCode: "USD",
//                       },
//                       Equiv: {
//                         Amount: "54150",
//                         CurrencyCode: "PKR",
//                       },
//                       TaxIndicator: "X",
//                       Total: "54150",
//                     },
//                     ProvisionType: "C",
//                     RefundReissue: "N",
//                     SubCodeInfo: {
//                       SubCodeForChargesOthers: "0AAACSV",
//                     },
//                   },
//                   {
//                     RPH: "6",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "2",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2026-01-01",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2026-01-01",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "LHE",
//                           RPH: 2,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "563",
//                         },
//                         {
//                           RPH: 2,
//                           content: "736",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "DXB",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "RUH",
//                           RPH: 2,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "3",
//                         },
//                         {
//                           RPH: 2,
//                           content: "4",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "Q",
//                         },
//                         {
//                           RPH: 2,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "SV",
//                     Commissionable: "N",
//                     FeeApplicationIndicator: "4",
//                     FeeNotGuaranteedIndicator: "N",
//                     Interlineable: "Y",
//                     PassengerType: {
//                       Code: "ADT",
//                     },
//                     PriceInformation: {
//                       Base: {
//                         Amount: "192.00",
//                         CurrencyCode: "USD",
//                       },
//                       Equiv: {
//                         Amount: "54150",
//                         CurrencyCode: "PKR",
//                       },
//                       TaxIndicator: "X",
//                       Total: "54150",
//                     },
//                     ProvisionType: "P",
//                     RefundReissue: "N",
//                     SubCodeInfo: {
//                       SubCodeForChargesOthers: "0AAACSV",
//                     },
//                   },
//                   {
//                     RPH: "7",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "1",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2025-12-17",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "6085",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "MCT",
//                           RPH: 1,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "6",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "N",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "WY",
//                     NumPiecesBDI: "1",
//                     NumPiecesITR: ["1"],
//                     ProvisionType: "B",
//                     SubCodeInfo: {
//                       SubCodeForAllowance: [
//                         {
//                           RPH: 1,
//                           content: "0M2ACWY",
//                         },
//                       ],
//                       SubCodeForChargesOthers: "0LNABWY",
//                     },
//                     WeightLimit: {
//                       Units: "K",
//                       content: "7",
//                     },
//                   },
//                   {
//                     RPH: "8",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "1",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2025-12-17",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "DXB",
//                           RPH: 1,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "6662",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "2",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "F3",
//                     ProvisionType: "B",
//                     SubCodeInfo: {
//                       SubCodeForChargesOthers: "0LNABF3",
//                     },
//                     WeightLimit: {
//                       Units: "K",
//                       content: "10",
//                     },
//                   },
//                   {
//                     RPH: "9",
//                     Associations: {
//                       CarrierCode: [
//                         {
//                           RPH: 1,
//                           content: "SV",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SV",
//                         },
//                       ],
//                       CountForSegmentAssociatedID: "2",
//                       DepartureDate: [
//                         {
//                           RPH: 1,
//                           content: "2026-01-01",
//                         },
//                         {
//                           RPH: 2,
//                           content: "2026-01-01",
//                         },
//                       ],
//                       DestinationLocation: [
//                         {
//                           LocationCode: "RUH",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "LHE",
//                           RPH: 2,
//                         },
//                       ],
//                       FlightNumber: [
//                         {
//                           RPH: 1,
//                           content: "563",
//                         },
//                         {
//                           RPH: 2,
//                           content: "736",
//                         },
//                       ],
//                       OriginLocation: [
//                         {
//                           LocationCode: "DXB",
//                           RPH: 1,
//                         },
//                         {
//                           LocationCode: "RUH",
//                           RPH: 2,
//                         },
//                       ],
//                       PNR_Segment: [
//                         {
//                           RPH: 1,
//                           content: "3",
//                         },
//                         {
//                           RPH: 2,
//                           content: "4",
//                         },
//                       ],
//                       ResBookDesigCode: [
//                         {
//                           RPH: 1,
//                           content: "Q",
//                         },
//                         {
//                           RPH: 2,
//                           content: "Q",
//                         },
//                       ],
//                       StatusCode: [
//                         {
//                           RPH: 1,
//                           content: "SS",
//                         },
//                         {
//                           RPH: 2,
//                           content: "SS",
//                         },
//                       ],
//                     },
//                     CarrierWhoseBaggageProvisionsApply: "SV",
//                     NumPiecesBDI: "1",
//                     NumPiecesITR: ["1"],
//                     ProvisionType: "B",
//                     SubCodeInfo: {
//                       SubCodeForAllowance: [
//                         {
//                           RPH: 1,
//                           content: "0M3ACSV",
//                         },
//                       ],
//                       SubCodeForChargesOthers: "0LNABSV",
//                     },
//                   },
//                 ],
//                 FareCalculation: {
//                   Text: "MCT SV RUH418.54SV DXB327.97SV X/RUH SV LHE163.61NUC910.12END ROE0.3845",
//                 },
//                 FareCalculationBreakdown: [
//                   {
//                     Branch: {
//                       PCC: "B8H8",
//                       FirstJointCarrier: "SV",
//                     },
//                     Departure: {
//                       CityCode: "MCT",
//                       AirportCode: "MCT",
//                       AirlineCode: "SV",
//                       GenericInd: "X",
//                       ArrivalCityCode: "RUH",
//                       ArrivalAirportCode: "RUH",
//                     },
//                     FareBasis: {
//                       Code: "NAOCWYB4",
//                       FareAmount: "418.54",
//                       FarePassengerType: "ADT",
//                       FareType: "P",
//                       FilingCarrier: "SV",
//                       GlobalInd: "EH",
//                       TripTypeInd: "O",
//                       Market: "MCTRUH",
//                       Cabin: "Y",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                     RuleCategoryIndicator: [
//                       "1",
//                       "4",
//                       "5",
//                       "9",
//                       "10",
//                       "16",
//                       "18",
//                       "23",
//                     ],
//                   },
//                   {
//                     Branch: {
//                       PCC: "B8H8",
//                       FirstJointCarrier: "SV",
//                     },
//                     Departure: {
//                       CityCode: "RUH",
//                       AirportCode: "RUH",
//                       AirlineCode: "SV",
//                       GenericInd: "O",
//                       ArrivalCityCode: "DXB",
//                       ArrivalAirportCode: "DXB",
//                     },
//                     FareBasis: {
//                       Code: "QAO6F3C4",
//                       FareAmount: "327.97",
//                       FarePassengerType: "ADT",
//                       FareType: "P",
//                       FilingCarrier: "SV",
//                       GlobalInd: "EH",
//                       TripTypeInd: "O",
//                       Market: "RUHDXB",
//                       Cabin: "Y",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                     RuleCategoryIndicator: [
//                       "1",
//                       "4",
//                       "5",
//                       "9",
//                       "10",
//                       "16",
//                       "18",
//                     ],
//                   },
//                   {
//                     Departure: {
//                       CityCode: "DXB",
//                       AirportCode: "DXB",
//                       AirlineCode: "SV",
//                       GenericInd: "X",
//                       ArrivalCityCode: "RUH",
//                       ArrivalAirportCode: "RUH",
//                     },
//                     FareBasis: {
//                       Code: "QAOXAEB4",
//                       FilingCarrier: "SV",
//                       Cabin: "Y",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                   },
//                   {
//                     Branch: {
//                       PCC: "B8H8",
//                       FirstJointCarrier: "SV",
//                     },
//                     Departure: {
//                       CityCode: "RUH",
//                       AirportCode: "RUH",
//                       AirlineCode: "SV",
//                       GenericInd: "O",
//                       ArrivalCityCode: "LHE",
//                       ArrivalAirportCode: "LHE",
//                     },
//                     FareBasis: {
//                       Code: "QAOXAEB4",
//                       FareAmount: "163.61",
//                       FarePassengerType: "ADT",
//                       FareType: "P",
//                       FilingCarrier: "SV",
//                       GlobalInd: "EH",
//                       TripTypeInd: "O",
//                       Market: "DXBLHE",
//                       Cabin: "Y",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                     RuleCategoryIndicator: [
//                       "1",
//                       "4",
//                       "5",
//                       "9",
//                       "10",
//                       "12",
//                       "16",
//                       "18",
//                     ],
//                   },
//                 ],
//                 ItinTotalFare: {
//                   NonRefundableInd: "O",
//                   BaggageInfo: {
//                     NonUS_DOT_Disclosure: {
//                       Text: [
//                         "BAG ALLOWANCE     -MCTDXB-01P/SV/EACH PIECE UP TO 50 POUND",
//                         "S/23 KILOGRAMS AND UP TO 62 LINEAR INCHES/158 LINEAR CENTI",
//                         "METERS",
//                         "2NDCHECKED BAG FEE-MCTDXB-PKR29610/SV",
//                         "BAG ALLOWANCE     -DXBLHE-01P/SV/EACH PIECE UP TO 50 POUND",
//                         "S/23 KILOGRAMS AND UP TO 62 LINEAR INCHES/158 LINEAR CENTI",
//                         "METERS",
//                         "2NDCHECKED BAG FEE-DXBLHE-PKR54150/SV",
//                         "CARRY ON ALLOWANCE",
//                         "MCTRUH-01P/07KG/WY",
//                         "01/UP TO 15 POUNDS/7 KILOGRAMS AND UP TO 41 LINEAR INCHES/",
//                         "105 LINEAR CENTIMETERS",
//                         "RUHDXB-10KG/F3",
//                         "DXBRUH RUHLHE-01P/SV",
//                         "01/UP TO 15 POUNDS/7 KILOGRAMS AND UP TO 45 LINEAR INCHES/",
//                         "115 LINEAR CENTIMETERS",
//                         "CARRY ON CHARGES",
//                         "MCTRUH-WY-CARRY ON FEES UNKNOWN-CONTACT CARRIER",
//                         "DXBRUH RUHLHE-SV-CARRY ON FEES UNKNOWN-CONTACT CARRIER",
//                         "ADDITIONAL ALLOWANCES AND/OR DISCOUNTS MAY APPLY DEPENDING ON",
//                         "FLYER-SPECIFIC FACTORS /E.G. FREQUENT FLYER STATUS/MILITARY/",
//                         "CREDIT CARD FORM OF PAYMENT/EARLY PURCHASE OVER INTERNET,ETC./",
//                       ],
//                     },
//                   },
//                   BaseFare: {
//                     Amount: "350.000",
//                     CurrencyCode: "OMR",
//                   },
//                   Construction: {
//                     Amount: "910.12",
//                     CurrencyCode: "NUC",
//                     RateOfExchange: "0.384500",
//                   },
//                   Endorsements: {
//                     Text: ["TKT VALD 1Y FRM ISSUE DATE"],
//                   },
//                   EquivFare: {
//                     Amount: "257370",
//                     CurrencyCode: "PKR",
//                   },
//                   Taxes: {
//                     TotalAmount: "34857",
//                     Tax: [
//                       {
//                         Amount: "736",
//                         TaxCode: "I2",
//                         TaxName: "SECURITY FEE",
//                         TicketingTaxCode: "I2",
//                       },
//                       {
//                         Amount: "7354",
//                         TaxCode: "OM",
//                         TaxName: "AIRPORT TAX",
//                         TicketingTaxCode: "OM",
//                       },
//                       {
//                         Amount: "9784",
//                         TaxCode: "IO",
//                         TaxName: "AIRPORT BUILDING CHARGE FOR  D",
//                         TicketingTaxCode: "IO",
//                       },
//                       {
//                         Amount: "2404",
//                         TaxCode: "E3",
//                         TaxName: "SECURITY CHARGES INTERNATIONAL",
//                         TicketingTaxCode: "E3",
//                       },
//                       {
//                         Amount: "5760",
//                         TaxCode: "AE4",
//                         TaxName: "PASSENGER SERVICE CHARGE INTER",
//                         TicketingTaxCode: "AE",
//                       },
//                       {
//                         Amount: "384",
//                         TaxCode: "TP",
//                         TaxName: "PASSENGER SECURITY AND SAFETY",
//                         TicketingTaxCode: "TP",
//                       },
//                       {
//                         Amount: "768",
//                         TaxCode: "ZR",
//                         TaxName: "INTERNATIONAL ADVANCED PASSENG",
//                         TicketingTaxCode: "ZR",
//                       },
//                       {
//                         Amount: "3456",
//                         TaxCode: "F62",
//                         TaxName: "PASSENGER FACILITIES CHARGE",
//                         TicketingTaxCode: "F6",
//                       },
//                       {
//                         Amount: "1839",
//                         TaxCode: "YRF",
//                         TaxName: "SERVICE FEE - CARRIER-IMPOSED",
//                         TicketingTaxCode: "YR",
//                       },
//                       {
//                         Amount: "1618",
//                         TaxCode: "S6",
//                         TaxName: "INFRASTRUCTURE CHARGE",
//                         TicketingTaxCode: "S6",
//                       },
//                       {
//                         Amount: "754",
//                         TaxCode: "T2",
//                         TaxName: "GACA SERVICES CHARGE",
//                         TicketingTaxCode: "T2",
//                       },
//                     ],
//                   },
//                   TotalFare: {
//                     Amount: "292227",
//                     CurrencyCode: "PKR",
//                   },
//                 },
//                 PassengerTypeQuantity: {
//                   Code: "ADT",
//                   Quantity: "1",
//                 },
//                 PTC_FareBreakdown: [
//                   {
//                     BrandedFareInformation: {
//                       BrandCode: "NBASICE",
//                       BrandName: "BASIC ECO",
//                       ProgramCode: "CFFSV",
//                       ProgramName: "INTFF",
//                     },
//                     Cabin: "Y",
//                     FareBasis: {
//                       Code: "NAOCWYB4",
//                       FareAmount: "418.54",
//                       FarePassengerType: "ADT",
//                       FareType: "P",
//                       FilingCarrier: "SV",
//                       GlobalInd: "EH",
//                       Market: "MCTRUH",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                   },
//                   {
//                     BrandedFareInformation: {
//                       BrandCode: "NSEMIFLEXE",
//                       BrandName: "SEMI FLEX ECO",
//                       ProgramCode: "CFFSV",
//                       ProgramName: "INTFF",
//                     },
//                     Cabin: "Y",
//                     FareBasis: {
//                       Code: "QAO6F3C4",
//                       FareAmount: "327.97",
//                       FarePassengerType: "ADT",
//                       FareType: "P",
//                       FilingCarrier: "SV",
//                       GlobalInd: "EH",
//                       Market: "RUHDXB",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                   },
//                   {
//                     Cabin: "Y",
//                     FareBasis: {
//                       Code: "QAOXAEB4",
//                       FilingCarrier: "SV",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                   },
//                   {
//                     BrandedFareInformation: {
//                       BrandCode: "NBASICE",
//                       BrandName: "BASIC ECO",
//                       ProgramCode: "CFFSV",
//                       ProgramName: "INTFF",
//                     },
//                     Cabin: "Y",
//                     FareBasis: {
//                       Code: "QAOXAEB4",
//                       FareAmount: "163.61",
//                       FarePassengerType: "ADT",
//                       FareType: "P",
//                       FilingCarrier: "SV",
//                       GlobalInd: "EH",
//                       Market: "DXBLHE",
//                     },
//                     FreeBaggageAllowance: "PC001",
//                   },
//                 ],
//               },
//             ],
//           },
//         },
//       },
//     ],
//     TravelItineraryRead: {
//       TravelItinerary: {
//         CustomerInfo: {
//           Address: {
//             AddressLine: [
//               {
//                 Id: "8",
//                 type: "N",
//                 content: "BLOCL L,JOHAR TOWN LAHORE",
//               },
//               {
//                 Id: "9",
//                 type: "C",
//                 content: "LAHORE",
//               },
//               {
//                 Id: "10",
//                 type: "Z",
//                 content: "12345",
//               },
//             ],
//           },
//           ContactNumbers: {
//             ContactNumber: [
//               {
//                 LocationCode: "LHE",
//                 Phone: "98765432123-A-1.1",
//                 RPH: "001",
//                 Id: "7",
//               },
//             ],
//           },
//           PersonName: [
//             {
//               WithInfant: "false",
//               NameNumber: "01.01",
//               NameReference: "A41",
//               PassengerType: "ADT",
//               RPH: "1",
//               elementId: "pnr-3.1",
//               Email: [
//                 {
//                   Id: "6",
//                   content: "SHOAIBJAMIL43@GMAIL.COM",
//                 },
//               ],
//               GivenName: "DANIYAL MR",
//               Surname: "HUMAYUN",
//             },
//           ],
//         },
//         ItineraryInfo: {
//           ItineraryPricing: {
//             PriceQuote: [
//               {
//                 RPH: "1",
//                 MiscInformation: {
//                   SignatureLine: [
//                     {
//                       ExpirationDateTime: "00:00",
//                       Source: "SYS",
//                       Status: "ACTIVE",
//                       Text: "B8H8 B8H8*AWT 0004/16NOV25",
//                     },
//                   ],
//                 },
//                 PricedItinerary: [
//                   {
//                     DisplayOnly: false,
//                     InputMessage: "WPFCA¥P1ADT¥RQ",
//                     RPH: "1",
//                     StatusCode: "A",
//                     TaxExempt: false,
//                     ValidatingCarrier: "SV",
//                     StoredDateTime: "2025-11-16T00:04",
//                     AirItineraryPricingInfo: {
//                       ItinTotalFare: [
//                         {
//                           BaseFare: {
//                             Amount: "350.000",
//                             CurrencyCode: "OMR",
//                           },
//                           EquivFare: {
//                             Amount: "257370",
//                             CurrencyCode: "PKR",
//                           },
//                           Taxes: {
//                             Tax: {
//                               Amount: "34857",
//                               TaxCode: "XT",
//                             },
//                             TaxBreakdownCode: [
//                               {
//                                 TaxPaid: false,
//                                 content: "736I2",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "7354OM",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "9784IO",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "2404E3",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "5760AE",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "384TP",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "768ZR",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "3456F6",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "1839YR",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "1618S6",
//                               },
//                               {
//                                 TaxPaid: false,
//                                 content: "754T2",
//                               },
//                             ],
//                           },
//                           TotalFare: {
//                             Amount: "292227",
//                             CurrencyCode: "PKR",
//                           },
//                           Totals: {
//                             BaseFare: {
//                               Amount: "350.000",
//                             },
//                             EquivFare: {
//                               Amount: "257370",
//                             },
//                             Taxes: {
//                               Tax: {
//                                 Amount: "34857",
//                               },
//                             },
//                             TotalFare: {
//                               Amount: "292227",
//                             },
//                           },
//                         },
//                       ],
//                       PassengerTypeQuantity: [
//                         {
//                           Code: "ADT",
//                           Quantity: "01",
//                         },
//                       ],
//                       PTC_FareBreakdown: [
//                         {
//                           Endorsements: {
//                             Endorsement: [
//                               {
//                                 type: "PRICING_PARAMETER",
//                                 Text: "WPFCA$P1ADT$RQ",
//                               },
//                               {
//                                 type: "WARNING",
//                                 Text: "WHEN TICKETING FOP MUST NOT BE GTR",
//                               },
//                               {
//                                 type: "WARNING",
//                                 Text: "VALIDATING CARRIER - SV",
//                               },
//                               {
//                                 type: "SYSTEM_ENDORSEMENT",
//                                 Text: "TKT VALD 1Y FRM ISSUE DATE",
//                               },
//                             ],
//                           },
//                           FareBasis: [
//                             {
//                               Code: "NAOCWYB4/QAO6F3C4/QAOXAEB4/QAOXAEB4",
//                             },
//                           ],
//                           FareCalculation: {
//                             Text: [
//                               "MCT SV RUH418.54SV DXB327.97SV X/RUH SV LHE163.61NUC910.12END ROE0.3845",
//                             ],
//                           },
//                           FareSource: "ATPC",
//                           FlightSegment: [
//                             {
//                               ConnectionInd: "O",
//                               DepartureDateTime: "12-17T01:50",
//                               FlightNumber: "6085",
//                               ResBookDesigCode: "N",
//                               SegmentNumber: "1",
//                               Status: "OK",
//                               BaggageAllowance: {
//                                 Number: "01P",
//                               },
//                               FareBasis: {
//                                 Code: "NAOCWYB4",
//                               },
//                               MarketingAirline: {
//                                 Code: "SV",
//                                 FlightNumber: "6085",
//                               },
//                               OriginLocation: {
//                                 LocationCode: "MCT",
//                               },
//                               ValidityDates: {
//                                 NotValidAfter: "2025-12-17",
//                                 NotValidBefore: "2025-12-17",
//                               },
//                             },
//                             {
//                               ConnectionInd: "X",
//                               DepartureDateTime: "12-17T08:50",
//                               FlightNumber: "6662",
//                               ResBookDesigCode: "Q",
//                               SegmentNumber: "2",
//                               Status: "OK",
//                               BaggageAllowance: {
//                                 Number: "01P",
//                               },
//                               FareBasis: {
//                                 Code: "QAO6F3C4",
//                               },
//                               MarketingAirline: {
//                                 Code: "SV",
//                                 FlightNumber: "6662",
//                               },
//                               OriginLocation: {
//                                 LocationCode: "RUH",
//                               },
//                               ValidityDates: {
//                                 NotValidAfter: "2025-12-17",
//                                 NotValidBefore: "2025-12-17",
//                               },
//                             },
//                             {
//                               ConnectionInd: "O",
//                               DepartureDateTime: "01-01T10:40",
//                               FlightNumber: "563",
//                               ResBookDesigCode: "Q",
//                               SegmentNumber: "3",
//                               Status: "OK",
//                               BaggageAllowance: {
//                                 Number: "01P",
//                               },
//                               FareBasis: {
//                                 Code: "QAOXAEB4",
//                               },
//                               MarketingAirline: {
//                                 Code: "SV",
//                                 FlightNumber: "563",
//                               },
//                               OriginLocation: {
//                                 LocationCode: "DXB",
//                               },
//                               ValidityDates: {
//                                 NotValidAfter: "2026-01-01",
//                                 NotValidBefore: "2026-01-01",
//                               },
//                             },
//                             {
//                               ConnectionInd: "X",
//                               DepartureDateTime: "01-01T13:20",
//                               FlightNumber: "736",
//                               ResBookDesigCode: "Q",
//                               SegmentNumber: "4",
//                               Status: "OK",
//                               BaggageAllowance: {
//                                 Number: "01P",
//                               },
//                               FareBasis: {
//                                 Code: "QAOXAEB4",
//                               },
//                               MarketingAirline: {
//                                 Code: "SV",
//                                 FlightNumber: "736",
//                               },
//                               OriginLocation: {
//                                 LocationCode: "RUH",
//                               },
//                               ValidityDates: {
//                                 NotValidAfter: "2026-01-01",
//                                 NotValidBefore: "2026-01-01",
//                               },
//                             },
//                             {
//                               OriginLocation: {
//                                 LocationCode: "LHE",
//                               },
//                             },
//                           ],
//                           FareComponent: [
//                             {
//                               FareBasisCode: "NAOCWYB4",
//                               FareDirectionality: "FROM",
//                               Amount: "41854",
//                               TicketDesignator: "",
//                               GoverningCarrier: "SV",
//                               FareComponentNumber: "1",
//                               Location: {
//                                 Origin: "MCT",
//                                 Destination: "RUH",
//                               },
//                               Dates: {
//                                 DepartureDateTime: "12-17T01:50",
//                                 ArrivalDateTime: "12-17T03:25",
//                               },
//                               FlightSegmentNumbers: {
//                                 FlightSegmentNumber: ["1"],
//                               },
//                             },
//                             {
//                               FareBasisCode: "QAO6F3C4",
//                               FareDirectionality: "FROM",
//                               Amount: "32797",
//                               TicketDesignator: "",
//                               GoverningCarrier: "SV",
//                               FareComponentNumber: "2",
//                               Location: {
//                                 Origin: "RUH",
//                                 Destination: "DXB",
//                               },
//                               Dates: {
//                                 DepartureDateTime: "12-17T08:50",
//                                 ArrivalDateTime: "12-17T11:45",
//                               },
//                               FlightSegmentNumbers: {
//                                 FlightSegmentNumber: ["2"],
//                               },
//                             },
//                             {
//                               FareBasisCode: "QAOXAEB4",
//                               FareDirectionality: "FROM",
//                               Amount: "16361",
//                               TicketDesignator: "",
//                               GoverningCarrier: "SV",
//                               FareComponentNumber: "3",
//                               Location: {
//                                 Origin: "DXB",
//                                 Destination: "LHE",
//                               },
//                               Dates: {
//                                 DepartureDateTime: "01-01T10:40",
//                                 ArrivalDateTime: "01-01T19:10",
//                               },
//                               FlightSegmentNumbers: {
//                                 FlightSegmentNumber: ["3", "4"],
//                               },
//                             },
//                           ],
//                         },
//                       ],
//                     },
//                   },
//                 ],
//                 ResponseHeader: {
//                   Text: [
//                     "FARE - PRICE RETAINED",
//                     "FARE USED TO CALCULATE DISCOUNT",
//                     "FARE NOT GUARANTEED UNTIL TICKETED",
//                   ],
//                 },
//                 PriceQuotePlus: {
//                   DomesticIntlInd: "I",
//                   PricingStatus: "A",
//                   VerifyFareCalc: false,
//                   ItineraryChanged: false,
//                   ManualFare: false,
//                   NegotiatedFare: false,
//                   SystemIndicator: "S",
//                   NUCSuppresion: false,
//                   SubjToGovtApproval: false,
//                   IT_BT_Fare: "BT",
//                   DisplayOnly: false,
//                   DiscountAmount: "0",
//                   PassengerInfo: {
//                     PassengerType: "ADT",
//                     PassengerData: [
//                       {
//                         NameNumber: "01.01",
//                         content: "HUMAYUN/DANIYAL MR",
//                       },
//                     ],
//                   },
//                   TicketingInstructionsInfo: {},
//                 },
//               },
//             ],
//             PriceQuoteTotals: {
//               BaseFare: {
//                 Amount: "350.00",
//               },
//               EquivFare: {
//                 Amount: "257370.00",
//               },
//               Taxes: {
//                 Tax: {
//                   Amount: "34857.00",
//                 },
//               },
//               TotalFare: {
//                 Amount: "292227.00",
//               },
//             },
//           },
//           ReservationItems: {
//             Item: [
//               {
//                 RPH: "1",
//                 FlightSegment: [
//                   {
//                     AirMilesFlown: "0733",
//                     ArrivalDateTime: "12-17T03:25",
//                     ConnectionInd: "O",
//                     DayOfWeekInd: "3",
//                     DepartureDateTime: "2025-12-17T01:50",
//                     SegmentBookedDate: "2025-11-15T13:04:00",
//                     ElapsedTime: "02.35",
//                     eTicket: true,
//                     FlightNumber: "6085",
//                     NumberInParty: "01",
//                     ResBookDesigCode: "N",
//                     SegmentNumber: "0001",
//                     SmokingAllowed: false,
//                     SpecialMeal: false,
//                     Status: "HK",
//                     StopQuantity: "00",
//                     IsPast: false,
//                     CodeShare: true,
//                     Id: "19",
//                     DestinationLocation: {
//                       LocationCode: "RUH",
//                       Terminal: "TERMINAL 3",
//                       TerminalCode: "3",
//                     },
//                     Equipment: {
//                       AirEquipType: "739",
//                     },
//                     MarketingAirline: {
//                       Code: "SV",
//                       FlightNumber: "6085",
//                       ResBookDesigCode: "N",
//                       Banner: "MARKETED BY SAUDIA AIRLINES",
//                     },
//                     OperatingAirline: [
//                       {
//                         Code: "WY",
//                         FlightNumber: "0685",
//                         ResBookDesigCode: "N",
//                         Banner: "OPERATED BY OMAN AIR",
//                       },
//                     ],
//                     OperatingAirlinePricing: {
//                       Code: "WY",
//                     },
//                     DisclosureCarrier: {
//                       Code: "WY",
//                       DOT: true,
//                       Banner: "OMAN AIR",
//                     },
//                     OriginLocation: {
//                       LocationCode: "MCT",
//                     },
//                     SupplierRef: {
//                       ID: "DCSV",
//                     },
//                     UpdatedArrivalTime: "12-17T03:25",
//                     UpdatedDepartureTime: "12-17T01:50",
//                     Cabin: {
//                       Code: "Y",
//                       SabreCode: "Y",
//                       Name: "ECONOMY",
//                       ShortName: "ECONOMY",
//                       Lang: "EN",
//                     },
//                   },
//                 ],
//                 Product: {
//                   ProductDetails: {
//                     productCategory: "AIR",
//                     ProductName: {
//                       type: "AIR",
//                       content: "",
//                     },
//                     Air: {
//                       sequence: 1,
//                       segmentAssociationId: 6,
//                       DepartureAirport: "MCT",
//                       ArrivalAirport: "RUH",
//                       ArrivalTerminalName: "TERMINAL 3",
//                       ArrivalTerminalCode: "3",
//                       OperatingAirlineCode: "WY",
//                       OperatingFlightNumber: "0685",
//                       EquipmentType: "739",
//                       MarketingAirlineCode: "SV",
//                       MarketingFlightNumber: "6085",
//                       MarketingClassOfService: "N",
//                       Cabin: {
//                         code: "Y",
//                         sabreCode: "Y",
//                         name: "ECONOMY",
//                         shortName: "ECONOMY",
//                         lang: "EN",
//                       },
//                       ElapsedTime: 155,
//                       AirMilesFlown: 733,
//                       FunnelFlight: false,
//                       ChangeOfGauge: false,
//                       DisclosureCarrier: {
//                         Code: "WY",
//                         DOT: true,
//                         Banner: "OMAN AIR",
//                       },
//                       AirlineRefId: "DCSV",
//                       Eticket: true,
//                       DepartureDateTime: "2025-12-17T01:50:00",
//                       ArrivalDateTime: "2025-12-17T03:25:00",
//                       FlightNumber: "6085",
//                       ClassOfService: "N",
//                       ActionCode: "HK",
//                       NumberInParty: 1,
//                       inboundConnection: false,
//                       outboundConnection: true,
//                       ScheduleChangeIndicator: false,
//                       SegmentBookedDate: "2025-11-15T13:04:00",
//                     },
//                   },
//                 },
//               },
//               {
//                 RPH: "2",
//                 FlightSegment: [
//                   {
//                     AirMilesFlown: "0543",
//                     ArrivalDateTime: "12-17T11:45",
//                     ConnectionInd: "I",
//                     DayOfWeekInd: "3",
//                     DepartureDateTime: "2025-12-17T08:50",
//                     SegmentBookedDate: "2025-11-15T13:04:00",
//                     ElapsedTime: "01.55",
//                     eTicket: true,
//                     FlightNumber: "6662",
//                     NumberInParty: "01",
//                     ResBookDesigCode: "Q",
//                     SegmentNumber: "0002",
//                     SmokingAllowed: false,
//                     SpecialMeal: false,
//                     Status: "HK",
//                     StopQuantity: "00",
//                     IsPast: false,
//                     CodeShare: true,
//                     Id: "20",
//                     DestinationLocation: {
//                       LocationCode: "DXB",
//                       Terminal: "TERMINAL 1",
//                       TerminalCode: "1",
//                     },
//                     Equipment: {
//                       AirEquipType: "320",
//                     },
//                     MarketingAirline: {
//                       Code: "SV",
//                       FlightNumber: "6662",
//                       ResBookDesigCode: "Q",
//                       Banner: "MARKETED BY SAUDIA AIRLINES",
//                     },
//                     OperatingAirline: [
//                       {
//                         Code: "F3",
//                         FlightNumber: "0505",
//                         ResBookDesigCode: "Q",
//                         Banner: "OPERATED BY FLYADEAL",
//                       },
//                     ],
//                     OperatingAirlinePricing: {
//                       Code: "F3",
//                     },
//                     DisclosureCarrier: {
//                       Code: "F3",
//                       DOT: true,
//                       Banner: "FLYADEAL",
//                     },
//                     OriginLocation: {
//                       LocationCode: "RUH",
//                       Terminal: "TERMINAL 3",
//                       TerminalCode: "3",
//                     },
//                     SupplierRef: {
//                       ID: "DCSV",
//                     },
//                     UpdatedArrivalTime: "12-17T11:45",
//                     UpdatedDepartureTime: "12-17T08:50",
//                     Cabin: {
//                       Code: "Y",
//                       SabreCode: "Y",
//                       Name: "ECONOMY",
//                       ShortName: "ECONOMY",
//                       Lang: "EN",
//                     },
//                   },
//                 ],
//                 Product: {
//                   ProductDetails: {
//                     productCategory: "AIR",
//                     ProductName: {
//                       type: "AIR",
//                       content: "",
//                     },
//                     Air: {
//                       sequence: 2,
//                       segmentAssociationId: 2,
//                       DepartureAirport: "RUH",
//                       DepartureTerminalName: "TERMINAL 3",
//                       DepartureTerminalCode: "3",
//                       ArrivalAirport: "DXB",
//                       ArrivalTerminalName: "TERMINAL 1",
//                       ArrivalTerminalCode: "1",
//                       OperatingAirlineCode: "F3",
//                       OperatingFlightNumber: "0505",
//                       EquipmentType: "320",
//                       MarketingAirlineCode: "SV",
//                       MarketingFlightNumber: "6662",
//                       MarketingClassOfService: "Q",
//                       Cabin: {
//                         code: "Y",
//                         sabreCode: "Y",
//                         name: "ECONOMY",
//                         shortName: "ECONOMY",
//                         lang: "EN",
//                       },
//                       ElapsedTime: 115,
//                       AirMilesFlown: 543,
//                       FunnelFlight: false,
//                       ChangeOfGauge: false,
//                       DisclosureCarrier: {
//                         Code: "F3",
//                         DOT: true,
//                         Banner: "FLYADEAL",
//                       },
//                       AirlineRefId: "DCSV",
//                       Eticket: true,
//                       DepartureDateTime: "2025-12-17T08:50:00",
//                       ArrivalDateTime: "2025-12-17T11:45:00",
//                       FlightNumber: "6662",
//                       ClassOfService: "Q",
//                       ActionCode: "HK",
//                       NumberInParty: 1,
//                       inboundConnection: true,
//                       outboundConnection: false,
//                       ScheduleChangeIndicator: false,
//                       SegmentBookedDate: "2025-11-15T13:04:00",
//                     },
//                   },
//                 },
//               },
//               {
//                 RPH: "3",
//                 FlightSegment: [
//                   {
//                     AirMilesFlown: "0543",
//                     ArrivalDateTime: "01-01T11:50",
//                     ConnectionInd: "O",
//                     DayOfWeekInd: "4",
//                     DepartureDateTime: "2026-01-01T10:40",
//                     SegmentBookedDate: "2025-11-15T13:04:00",
//                     ElapsedTime: "02.10",
//                     eTicket: true,
//                     FlightNumber: "0563",
//                     NumberInParty: "01",
//                     ResBookDesigCode: "Q",
//                     SegmentNumber: "0003",
//                     SmokingAllowed: false,
//                     SpecialMeal: false,
//                     Status: "HK",
//                     StopQuantity: "00",
//                     IsPast: false,
//                     CodeShare: false,
//                     Id: "21",
//                     DestinationLocation: {
//                       LocationCode: "RUH",
//                       Terminal: "TERMINAL 4",
//                       TerminalCode: "4",
//                     },
//                     Equipment: {
//                       AirEquipType: "330",
//                     },
//                     MarketingAirline: {
//                       Code: "SV",
//                       FlightNumber: "0563",
//                       ResBookDesigCode: "Q",
//                       Banner: "MARKETED BY SAUDIA AIRLINES",
//                     },
//                     Meal: [
//                       {
//                         Code: "M",
//                       },
//                     ],
//                     OperatingAirline: [
//                       {
//                         Code: "SV",
//                         FlightNumber: "0563",
//                         ResBookDesigCode: "Q",
//                         Banner: "OPERATED BY SAUDIA AIRLINES",
//                       },
//                     ],
//                     OperatingAirlinePricing: {
//                       Code: "SV",
//                     },
//                     DisclosureCarrier: {
//                       Code: "SV",
//                       DOT: false,
//                       Banner: "SAUDIA AIRLINES",
//                     },
//                     OriginLocation: {
//                       LocationCode: "DXB",
//                       Terminal: "TERMINAL 1",
//                       TerminalCode: "1",
//                     },
//                     SupplierRef: {
//                       ID: "DCSV",
//                     },
//                     UpdatedArrivalTime: "01-01T11:50",
//                     UpdatedDepartureTime: "01-01T10:40",
//                     Cabin: {
//                       Code: "Y",
//                       SabreCode: "Y",
//                       Name: "ECONOMY",
//                       ShortName: "ECONOMY",
//                       Lang: "EN",
//                     },
//                   },
//                 ],
//                 Product: {
//                   ProductDetails: {
//                     productCategory: "AIR",
//                     ProductName: {
//                       type: "AIR",
//                       content: "",
//                     },
//                     Air: {
//                       sequence: 3,
//                       segmentAssociationId: 3,
//                       DepartureAirport: "DXB",
//                       DepartureTerminalName: "TERMINAL 1",
//                       DepartureTerminalCode: "1",
//                       ArrivalAirport: "RUH",
//                       ArrivalTerminalName: "TERMINAL 4",
//                       ArrivalTerminalCode: "4",
//                       EquipmentType: "330",
//                       MarketingAirlineCode: "SV",
//                       MarketingFlightNumber: "563",
//                       MarketingClassOfService: "Q",
//                       Cabin: {
//                         code: "Y",
//                         sabreCode: "Y",
//                         name: "ECONOMY",
//                         shortName: "ECONOMY",
//                         lang: "EN",
//                       },
//                       MealCode: ["M"],
//                       ElapsedTime: 130,
//                       AirMilesFlown: 543,
//                       FunnelFlight: false,
//                       ChangeOfGauge: false,
//                       DisclosureCarrier: {
//                         Code: "SV",
//                         DOT: false,
//                         Banner: "SAUDIA AIRLINES",
//                       },
//                       AirlineRefId: "DCSV",
//                       Eticket: true,
//                       DepartureDateTime: "2026-01-01T10:40:00",
//                       ArrivalDateTime: "2026-01-01T11:50:00",
//                       FlightNumber: "563",
//                       ClassOfService: "Q",
//                       ActionCode: "HK",
//                       NumberInParty: 1,
//                       inboundConnection: false,
//                       outboundConnection: true,
//                       ScheduleChangeIndicator: false,
//                       SegmentBookedDate: "2025-11-15T13:04:00",
//                     },
//                   },
//                 },
//               },
//               {
//                 RPH: "4",
//                 FlightSegment: [
//                   {
//                     AirMilesFlown: "1748",
//                     ArrivalDateTime: "01-01T19:10",
//                     ConnectionInd: "I",
//                     DayOfWeekInd: "4",
//                     DepartureDateTime: "2026-01-01T13:20",
//                     SegmentBookedDate: "2025-11-15T13:04:00",
//                     ElapsedTime: "03.50",
//                     eTicket: true,
//                     FlightNumber: "0736",
//                     NumberInParty: "01",
//                     ResBookDesigCode: "Q",
//                     SegmentNumber: "0004",
//                     SmokingAllowed: false,
//                     SpecialMeal: false,
//                     Status: "HK",
//                     StopQuantity: "00",
//                     IsPast: false,
//                     CodeShare: false,
//                     Id: "22",
//                     DestinationLocation: {
//                       LocationCode: "LHE",
//                       Terminal: "ALLAMA IQBAL TERMINAL",
//                       TerminalCode: "M",
//                     },
//                     Equipment: {
//                       AirEquipType: "773",
//                     },
//                     MarketingAirline: {
//                       Code: "SV",
//                       FlightNumber: "0736",
//                       ResBookDesigCode: "Q",
//                       Banner: "MARKETED BY SAUDIA AIRLINES",
//                     },
//                     Meal: [
//                       {
//                         Code: "M",
//                       },
//                     ],
//                     OperatingAirline: [
//                       {
//                         Code: "SV",
//                         FlightNumber: "0736",
//                         ResBookDesigCode: "Q",
//                         Banner: "OPERATED BY SAUDIA AIRLINES",
//                       },
//                     ],
//                     OperatingAirlinePricing: {
//                       Code: "SV",
//                     },
//                     DisclosureCarrier: {
//                       Code: "SV",
//                       DOT: false,
//                       Banner: "SAUDIA AIRLINES",
//                     },
//                     OriginLocation: {
//                       LocationCode: "RUH",
//                       Terminal: "TERMINAL 4",
//                       TerminalCode: "4",
//                     },
//                     SupplierRef: {
//                       ID: "DCSV",
//                     },
//                     UpdatedArrivalTime: "01-01T19:10",
//                     UpdatedDepartureTime: "01-01T13:20",
//                     Cabin: {
//                       Code: "Y",
//                       SabreCode: "Y",
//                       Name: "ECONOMY",
//                       ShortName: "ECONOMY",
//                       Lang: "EN",
//                     },
//                   },
//                 ],
//                 Product: {
//                   ProductDetails: {
//                     productCategory: "AIR",
//                     ProductName: {
//                       type: "AIR",
//                       content: "",
//                     },
//                     Air: {
//                       sequence: 4,
//                       segmentAssociationId: 4,
//                       DepartureAirport: "RUH",
//                       DepartureTerminalName: "TERMINAL 4",
//                       DepartureTerminalCode: "4",
//                       ArrivalAirport: "LHE",
//                       ArrivalTerminalName: "ALLAMA IQBAL TERMINAL",
//                       ArrivalTerminalCode: "M",
//                       EquipmentType: "773",
//                       MarketingAirlineCode: "SV",
//                       MarketingFlightNumber: "736",
//                       MarketingClassOfService: "Q",
//                       Cabin: {
//                         code: "Y",
//                         sabreCode: "Y",
//                         name: "ECONOMY",
//                         shortName: "ECONOMY",
//                         lang: "EN",
//                       },
//                       MealCode: ["M"],
//                       ElapsedTime: 230,
//                       AirMilesFlown: 1748,
//                       FunnelFlight: false,
//                       ChangeOfGauge: false,
//                       DisclosureCarrier: {
//                         Code: "SV",
//                         DOT: false,
//                         Banner: "SAUDIA AIRLINES",
//                       },
//                       AirlineRefId: "DCSV",
//                       Eticket: true,
//                       DepartureDateTime: "2026-01-01T13:20:00",
//                       ArrivalDateTime: "2026-01-01T19:10:00",
//                       FlightNumber: "736",
//                       ClassOfService: "Q",
//                       ActionCode: "HK",
//                       NumberInParty: 1,
//                       inboundConnection: true,
//                       outboundConnection: false,
//                       ScheduleChangeIndicator: false,
//                       SegmentBookedDate: "2025-11-15T13:04:00",
//                     },
//                   },
//                 },
//               },
//             ],
//           },
//           Ticketing: [
//             {
//               RPH: "01",
//               TicketTimeLimit: "TAW/",
//             },
//           ],
//         },
//         ItineraryRef: {
//           AirExtras: false,
//           ID: "MGNXHJ",
//           InhibitCode: "U",
//           PartitionID: "AA",
//           PrimeHostID: "1B",
//           Header: ["PRICE QUOTE RECORD - AUTOPRICED"],
//           Source: {
//             AAA_PseudoCityCode: "B8H8",
//             CreateDateTime: "2025-11-15T13:04",
//             CreationAgent: "AWT",
//             HomePseudoCityCode: "B8H8",
//             PseudoCityCode: "B8H8",
//             ReceivedFrom: "AL SABOOR TRAVEL",
//             LastUpdateDateTime: "2025-11-15T13:04",
//             SequenceNumber: "1",
//           },
//         },
//         SpecialServiceInfo: [
//           {
//             RPH: "001",
//             Type: "GFX",
//             Id: "23",
//             Service: {
//               SSR_Code: "SSR",
//               SSR_Type: "DOCS",
//               Airline: {
//                 Code: "SV",
//               },
//               PersonName: [
//                 {
//                   NameNumber: "01.01",
//                   content: "HUMAYUN/DANIYAL MR",
//                 },
//               ],
//               Text: [
//                 "HK1/P/PK/DY2357536/PK/27JUN1984/M/22JUL2026/HUMAYUN/DANIYAL MR",
//               ],
//             },
//           },
//           {
//             RPH: "002",
//             Type: "GFX",
//             Id: "24",
//             Service: {
//               SSR_Code: "SSR",
//               SSR_Type: "DOCS",
//               Airline: {
//                 Code: "SV",
//               },
//               PersonName: [
//                 {
//                   NameNumber: "01.01",
//                   content: "HUMAYUN/DANIYAL MR",
//                 },
//               ],
//               Text: ["HK1/DB/27JUN1984/M/HUMAYUN/DANIYAL MR"],
//             },
//           },
//           {
//             RPH: "003",
//             Type: "GFX",
//             Id: "25",
//             Service: {
//               SSR_Code: "SSR",
//               SSR_Type: "CTCM",
//               Airline: {
//                 Code: "SV",
//               },
//               PersonName: [
//                 {
//                   NameNumber: "01.01",
//                   content: "HUMAYUN/DANIYAL MR",
//                 },
//               ],
//               Text: ["HK1/98765432123"],
//             },
//           },
//         ],
//         OpenReservationElements: {
//           OpenReservationElement: [
//             {
//               id: "23",
//               type: "SRVC",
//               elementId: "pnr-23",
//               ServiceRequest: {
//                 actionCode: "HK",
//                 airlineCode: "SV",
//                 code: "DOCS",
//                 serviceCount: "1",
//                 serviceType: "SSR",
//                 ssrType: "GFX",
//                 FreeText:
//                   "/P/PK/DY2357536/PK/27JUN1984/M/22JUL2026/HUMAYUN/DANIYAL MR",
//                 FullText:
//                   "DOCS SV HK1/P/PK/DY2357536/PK/27JUN1984/M/22JUL2026/HUMAYUN/DANIYAL MR",
//                 TravelDocument: {
//                   Type: "P",
//                   DocumentIssueCountry: "PK",
//                   DocumentNumber: "DY2357536",
//                   DocumentNationalityCountry: "PK",
//                   DocumentExpirationDate: "22JUL2026",
//                   DateOfBirth: "27JUN1984",
//                   Gender: "M",
//                   LastName: "HUMAYUN",
//                   FirstName: "DANIYAL MR",
//                   Infant: false,
//                   PrimaryDocHolderInd: false,
//                   HasDocumentData: true,
//                 },
//               },
//               NameAssociation: [
//                 {
//                   LastName: "HUMAYUN",
//                   FirstName: "DANIYAL MR",
//                   ReferenceId: 1,
//                   NameRefNumber: "01.01",
//                 },
//               ],
//             },
//             {
//               id: "24",
//               type: "SRVC",
//               elementId: "pnr-24",
//               ServiceRequest: {
//                 actionCode: "HK",
//                 airlineCode: "SV",
//                 code: "DOCS",
//                 serviceCount: "1",
//                 serviceType: "SSR",
//                 ssrType: "GFX",
//                 FreeText: "/DB/27JUN1984/M/HUMAYUN/DANIYAL MR",
//                 FullText: "DOCS SV HK1/DB/27JUN1984/M/HUMAYUN/DANIYAL MR",
//                 TravelDocument: {
//                   Type: "DB",
//                   DateOfBirth: "27JUN1984",
//                   Gender: "M",
//                   LastName: "HUMAYUN",
//                   FirstName: "DANIYAL MR",
//                   Infant: false,
//                   HasDocumentData: false,
//                 },
//               },
//               NameAssociation: [
//                 {
//                   LastName: "HUMAYUN",
//                   FirstName: "DANIYAL MR",
//                   ReferenceId: 1,
//                   NameRefNumber: "01.01",
//                 },
//               ],
//             },
//             {
//               id: "25",
//               type: "SRVC",
//               elementId: "pnr-25",
//               ServiceRequest: {
//                 actionCode: "HK",
//                 airlineCode: "SV",
//                 code: "CTCM",
//                 serviceCount: "1",
//                 serviceType: "SSR",
//                 ssrType: "GFX",
//                 FreeText: "/98765432123",
//                 FullText: "CTCM SV HK1/98765432123",
//                 PassengerContactMobilePhone: {
//                   PhoneNumber: "98765432123",
//                 },
//               },
//               NameAssociation: [
//                 {
//                   LastName: "HUMAYUN",
//                   FirstName: "DANIYAL MR",
//                   ReferenceId: 1,
//                   NameRefNumber: "01.01",
//                 },
//               ],
//             },
//             {
//               id: "6",
//               type: "PSG_DETAILS_MAIL",
//               elementId: "pnr-6",
//               Email: {
//                 comment: "",
//                 Address: "SHOAIBJAMIL43@GMAIL.COM",
//               },
//               NameAssociation: [
//                 {
//                   LastName: "HUMAYUN",
//                   FirstName: "DANIYAL MR",
//                   ReferenceId: 1,
//                   NameRefNumber: "01.01",
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     },
//   },
//   Links: [
//     {
//       rel: "self",
//       href: "https://api.platform.sabre.com/v2.4.0/passenger/records?mode=create",
//     },
//     {
//       rel: "linkTemplate",
//       href: "https://api.platform.sabre.com/<version>/passenger/records?mode=<mode>",
//     },
//   ],
// };
