exports.data = {
  meta: {
    count: 5,
    links: {
      self: "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=SYD&destinationLocationCode=BKK&adults=2&max=5&departureDate=2024-07-16&returnDate=2024-07-30",
    },
  },
  data: [
    {
      type: "flight-offer",
      id: "1",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: "2024-07-16",
      lastTicketingDateTime: "2024-07-16",
      numberOfBookableSeats: 3,
      itineraries: [
        {
          duration: "PT14H15M",
          segments: [
            {
              departure: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-16T11:35:00",
              },
              arrival: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-16T16:50:00",
              },
              carrierCode: "PR",
              number: "212",
              aircraft: {
                code: "333",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT8H15M",
              id: "5",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-16T19:20:00",
              },
              arrival: {
                iataCode: "BKK",
                at: "2024-07-16T21:50:00",
              },
              carrierCode: "PR",
              number: "732",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT3H30M",
              id: "6",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          duration: "PT16H15M",
          segments: [
            {
              departure: {
                iataCode: "BKK",
                at: "2024-07-30T13:30:00",
              },
              arrival: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-30T18:00:00",
              },
              carrierCode: "PR",
              number: "731",
              aircraft: {
                code: "333",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT3H30M",
              id: "9",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-30T22:10:00",
              },
              arrival: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-31T09:45:00",
              },
              carrierCode: "PR",
              number: "211",
              aircraft: {
                code: "333",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT8H35M",
              id: "10",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "1002.64",
        base: "606.00",
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
        grandTotal: "1002.64",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["PR"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "501.32",
            base: "303.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "5",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "6",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "9",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "10",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "501.32",
            base: "303.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "5",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "6",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "9",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "10",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
    {
      type: "flight-offer",
      id: "2",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: "2024-07-16",
      lastTicketingDateTime: "2024-07-16",
      numberOfBookableSeats: 3,
      itineraries: [
        {
          duration: "PT14H15M",
          segments: [
            {
              departure: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-16T11:35:00",
              },
              arrival: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-16T16:50:00",
              },
              carrierCode: "PR",
              number: "212",
              aircraft: {
                code: "333",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT8H15M",
              id: "5",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-16T19:20:00",
              },
              arrival: {
                iataCode: "BKK",
                at: "2024-07-16T21:50:00",
              },
              carrierCode: "PR",
              number: "732",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT3H30M",
              id: "6",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          duration: "PT28H15M",
          segments: [
            {
              departure: {
                iataCode: "BKK",
                at: "2024-07-30T01:30:00",
              },
              arrival: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-30T05:45:00",
              },
              carrierCode: "PR",
              number: "741",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT3H15M",
              id: "11",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "MNL",
                terminal: "1",
                at: "2024-07-30T22:10:00",
              },
              arrival: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-31T09:45:00",
              },
              carrierCode: "PR",
              number: "211",
              aircraft: {
                code: "333",
              },
              operating: {
                carrierCode: "PR",
              },
              duration: "PT8H35M",
              id: "12",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "1062.64",
        base: "666.00",
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
        grandTotal: "1062.64",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["PR"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "531.32",
            base: "333.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "5",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "6",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "11",
              cabin: "ECONOMY",
              fareBasis: "EBAU",
              class: "E",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "12",
              cabin: "ECONOMY",
              fareBasis: "EBAU",
              class: "E",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "531.32",
            base: "333.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "5",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "6",
              cabin: "ECONOMY",
              fareBasis: "TBAU",
              class: "T",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "11",
              cabin: "ECONOMY",
              fareBasis: "EBAU",
              class: "E",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "12",
              cabin: "ECONOMY",
              fareBasis: "EBAU",
              class: "E",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
    {
      type: "flight-offer",
      id: "3",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: "2024-03-22",
      lastTicketingDateTime: "2024-03-22",
      numberOfBookableSeats: 9,
      itineraries: [
        {
          duration: "PT16H5M",
          segments: [
            {
              departure: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-16T20:45:00",
              },
              arrival: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-17T03:10:00",
              },
              carrierCode: "TR",
              number: "13",
              aircraft: {
                code: "789",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT8H25M",
              id: "3",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-17T08:20:00",
              },
              arrival: {
                iataCode: "BKK",
                at: "2024-07-17T09:50:00",
              },
              carrierCode: "TR",
              number: "624",
              aircraft: {
                code: "32Q",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT2H30M",
              id: "4",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          duration: "PT21H45M",
          segments: [
            {
              departure: {
                iataCode: "BKK",
                at: "2024-07-30T10:50:00",
              },
              arrival: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-30T14:15:00",
              },
              carrierCode: "TR",
              number: "625",
              aircraft: {
                code: "32Q",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT2H25M",
              id: "13",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-31T02:00:00",
              },
              arrival: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-31T11:35:00",
              },
              carrierCode: "TR",
              number: "2",
              aircraft: {
                code: "789",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT7H35M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "1106.76",
        base: "724.00",
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
        grandTotal: "1106.76",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["SQ"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "553.38",
            base: "362.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "3",
              cabin: "ECONOMY",
              fareBasis: "O2TR24",
              class: "O",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "4",
              cabin: "ECONOMY",
              fareBasis: "N2TR24",
              class: "N",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "13",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "553.38",
            base: "362.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "3",
              cabin: "ECONOMY",
              fareBasis: "O2TR24",
              class: "O",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "4",
              cabin: "ECONOMY",
              fareBasis: "N2TR24",
              class: "N",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "13",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
    {
      type: "flight-offer",
      id: "4",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: "2024-03-22",
      lastTicketingDateTime: "2024-03-22",
      numberOfBookableSeats: 9,
      itineraries: [
        {
          duration: "PT20H55M",
          segments: [
            {
              departure: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-16T20:45:00",
              },
              arrival: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-17T03:10:00",
              },
              carrierCode: "TR",
              number: "13",
              aircraft: {
                code: "789",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT8H25M",
              id: "7",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-17T13:10:00",
              },
              arrival: {
                iataCode: "BKK",
                at: "2024-07-17T14:40:00",
              },
              carrierCode: "TR",
              number: "604",
              aircraft: {
                code: "32Q",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT2H30M",
              id: "8",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          duration: "PT21H45M",
          segments: [
            {
              departure: {
                iataCode: "BKK",
                at: "2024-07-30T10:50:00",
              },
              arrival: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-30T14:15:00",
              },
              carrierCode: "TR",
              number: "625",
              aircraft: {
                code: "32Q",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT2H25M",
              id: "13",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-31T02:00:00",
              },
              arrival: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-31T11:35:00",
              },
              carrierCode: "TR",
              number: "2",
              aircraft: {
                code: "789",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT7H35M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "1106.76",
        base: "724.00",
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
        grandTotal: "1106.76",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["SQ"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "553.38",
            base: "362.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "7",
              cabin: "ECONOMY",
              fareBasis: "O2TR24",
              class: "O",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "8",
              cabin: "ECONOMY",
              fareBasis: "N2TR24",
              class: "N",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "13",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "553.38",
            base: "362.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "7",
              cabin: "ECONOMY",
              fareBasis: "O2TR24",
              class: "O",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "8",
              cabin: "ECONOMY",
              fareBasis: "N2TR24",
              class: "N",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "13",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
    {
      type: "flight-offer",
      id: "5",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: "2024-03-22",
      lastTicketingDateTime: "2024-03-22",
      numberOfBookableSeats: 9,
      itineraries: [
        {
          duration: "PT23H",
          segments: [
            {
              departure: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-16T20:45:00",
              },
              arrival: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-17T03:10:00",
              },
              carrierCode: "TR",
              number: "13",
              aircraft: {
                code: "789",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT8H25M",
              id: "1",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-17T15:25:00",
              },
              arrival: {
                iataCode: "BKK",
                at: "2024-07-17T16:45:00",
              },
              carrierCode: "TR",
              number: "610",
              aircraft: {
                code: "789",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT2H20M",
              id: "2",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          duration: "PT21H45M",
          segments: [
            {
              departure: {
                iataCode: "BKK",
                at: "2024-07-30T10:50:00",
              },
              arrival: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-30T14:15:00",
              },
              carrierCode: "TR",
              number: "625",
              aircraft: {
                code: "32Q",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT2H25M",
              id: "13",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
            {
              departure: {
                iataCode: "SIN",
                terminal: "1",
                at: "2024-07-31T02:00:00",
              },
              arrival: {
                iataCode: "SYD",
                terminal: "1",
                at: "2024-07-31T11:35:00",
              },
              carrierCode: "TR",
              number: "2",
              aircraft: {
                code: "789",
              },
              operating: {
                carrierCode: "TR",
              },
              duration: "PT7H35M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "1106.76",
        base: "724.00",
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
        grandTotal: "1106.76",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["SQ"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "553.38",
            base: "362.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "1",
              cabin: "ECONOMY",
              fareBasis: "O2TR24",
              class: "O",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "N2TR24",
              class: "N",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "13",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "553.38",
            base: "362.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "1",
              cabin: "ECONOMY",
              fareBasis: "O2TR24",
              class: "O",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "N2TR24",
              class: "N",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "13",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "X2TR24",
              class: "X",
              includedCheckedBags: {
                weight: 30,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
  ],
  dictionaries: {
    locations: {
      BKK: {
        cityCode: "BKK",
        countryCode: "TH",
      },
      SIN: {
        cityCode: "SIN",
        countryCode: "SG",
      },
      MNL: {
        cityCode: "MNL",
        countryCode: "PH",
      },
      SYD: {
        cityCode: "SYD",
        countryCode: "AU",
      },
    },
    aircraft: {
      321: "AIRBUS A321",
      333: "AIRBUS A330-300",
      789: "BOEING 787-9",
      "32Q": "AIRBUS A321NEO",
    },
    currencies: {
      EUR: "EURO",
    },
    carriers: {
      PR: "PHILIPPINE AIRLINES",
      TR: "SCOOT",
    },
  },
};
