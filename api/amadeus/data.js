exports.data = {
  type: "flight-offer",
  id: "10",
  source: "GDS",
  instantTicketingRequired: false,
  nonHomogeneous: false,
  oneWay: false,
  isUpsellOffer: false,
  lastTicketingDate: "2024-11-15",
  lastTicketingDateTime: "2024-11-15",
  numberOfBookableSeats: 4,
  itineraries: [
    {
      duration: "PT21H38M",
      segments: [
        {
          departure: {
            iataCode: "NCE",
            terminal: "1",
            at: "2024-11-25T07:00:00",
          },
          arrival: {
            iataCode: "FRA",
            terminal: "1",
            at: "2024-11-25T08:40:00",
          },
          carrierCode: "AC",
          number: "9397",
          aircraft: {
            code: "321",
          },
          operating: {
            carrierCode: "LH",
          },
          duration: "PT1H40M",
          id: "34",
          numberOfStops: 0,
          blacklistedInEU: false,
        },
        {
          departure: {
            iataCode: "FRA",
            terminal: "1",
            at: "2024-11-25T10:05:00",
          },
          arrival: {
            iataCode: "YYZ",
            terminal: "1",
            at: "2024-11-25T13:20:00",
          },
          carrierCode: "AC",
          number: "841",
          aircraft: {
            code: "333",
          },
          operating: {
            carrierCode: "AC",
          },
          duration: "PT9H15M",
          id: "35",
          numberOfStops: 0,
          blacklistedInEU: false,
        },
        {
          departure: {
            iataCode: "YYZ",
            terminal: "1",
            at: "2024-11-25T20:55:00",
          },
          arrival: {
            iataCode: "JFK",
            terminal: "7",
            at: "2024-11-25T22:38:00",
          },
          carrierCode: "AC",
          number: "8556",
          aircraft: {
            code: "E75",
          },
          operating: {
            carrierCode: "AC",
          },
          duration: "PT1H43M",
          id: "36",
          numberOfStops: 0,
          blacklistedInEU: false,
        },
      ],
    },
    {
      duration: "PT20H40M",
      segments: [
        {
          departure: {
            iataCode: "JFK",
            terminal: "7",
            at: "2024-11-30T10:05:00",
          },
          arrival: {
            iataCode: "YUL",
            at: "2024-11-30T11:32:00",
          },
          carrierCode: "AC",
          number: "8899",
          aircraft: {
            code: "E75",
          },
          operating: {
            carrierCode: "AC",
          },
          duration: "PT1H27M",
          id: "99",
          numberOfStops: 0,
          blacklistedInEU: false,
        },
        {
          departure: {
            iataCode: "YUL",
            at: "2024-11-30T18:55:00",
          },
          arrival: {
            iataCode: "BRU",
            at: "2024-12-01T07:55:00",
          },
          carrierCode: "AC",
          number: "832",
          aircraft: {
            code: "77W",
          },
          operating: {
            carrierCode: "AC",
          },
          duration: "PT7H",
          id: "100",
          numberOfStops: 0,
          blacklistedInEU: false,
        },
        {
          departure: {
            iataCode: "BRU",
            at: "2024-12-01T11:00:00",
          },
          arrival: {
            iataCode: "NCE",
            terminal: "1",
            at: "2024-12-01T12:45:00",
          },
          carrierCode: "AC",
          number: "6365",
          aircraft: {
            code: "319",
          },
          operating: {
            carrierCode: "SN",
          },
          duration: "PT1H45M",
          id: "101",
          numberOfStops: 0,
          blacklistedInEU: false,
        },
      ],
    },
  ],
  price: {
    currency: "PKR",
    total: "858331.00",
    base: "504380.00",
    fees: [
      {
        amount: "0.00",
        type: "SUPPLIER",
      },
      {
        amount: "0.00",
        type: "TICKETING",
      },
    ],
    grandTotal: "858331.00",
  },
  pricingOptions: {
    fareType: ["PUBLISHED"],
    includedCheckedBagsOnly: false,
  },
  validatingAirlineCodes: ["AC"],
  travelerPricings: [
    {
      travelerId: "1",
      fareOption: "STANDARD",
      travelerType: "ADULT",
      price: {
        currency: "PKR",
        total: "288072.00",
        base: "176920.00",
      },
      fareDetailsBySegment: [
        {
          segmentId: "34",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "35",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "36",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "99",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "100",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "101",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
      ],
    },
    {
      travelerId: "2",
      fareOption: "STANDARD",
      travelerType: "ADULT",
      price: {
        currency: "PKR",
        total: "288072.00",
        base: "176920.00",
      },
      fareDetailsBySegment: [
        {
          segmentId: "34",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "35",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "36",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "99",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "100",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "101",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          includedCheckedBags: {
            quantity: 0,
          },
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
      ],
    },
    {
      travelerId: "3",
      fareOption: "STANDARD",
      travelerType: "CHILD",
      price: {
        currency: "PKR",
        total: "243992.00",
        base: "132840.00",
      },
      fareDetailsBySegment: [
        {
          segmentId: "34",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "35",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "36",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "99",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "100",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "101",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
      ],
    },
    {
      travelerId: "4",
      fareOption: "STANDARD",
      travelerType: "HELD_INFANT",
      associatedAdultId: "2",
      price: {
        currency: "PKR",
        total: "38195.00",
        base: "17700.00",
      },
      fareDetailsBySegment: [
        {
          segmentId: "34",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "35",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "36",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "99",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "100",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
        {
          segmentId: "101",
          cabin: "ECONOMY",
          fareBasis: "VLPMD3BQ",
          brandedFare: "BASIC",
          brandedFareLabel: "BASIC",
          class: "V",
          amenities: [
            {
              description: "CHECKED BAG FIRST",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "CHECKED BAG SECOND",
              isChargeable: true,
              amenityType: "BAGGAGE",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "COMPLIMENTARY MEAL",
              isChargeable: false,
              amenityType: "MEAL",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
            {
              description: "BASIC SEAT",
              isChargeable: true,
              amenityType: "BRANDED_FARES",
              amenityProvider: {
                name: "BrandedFare",
              },
            },
          ],
        },
      ],
    },
  ],
  fareRules: {
    rules: [
      {
        category: "EXCHANGE",
        notApplicable: true,
      },
      {
        category: "REFUND",
        notApplicable: true,
      },
      {
        category: "REVALIDATION",
        notApplicable: true,
      },
    ],
  },
};
