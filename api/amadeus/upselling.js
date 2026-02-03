exports.upselling = {
  meta: {
    count: 5,
  },
  data: [
    {
      type: "flight-offer",
      id: "2",
      source: "GDS",
      instantTicketingRequired: false,
      paymentCardRequired: false,
      lastTicketingDate: "2021-07-04",
      itineraries: [
        {
          segments: [
            {
              departure: {
                iataCode: "CDG",
                terminal: "2F",
                at: "2021-07-04T09:30:00",
              },
              arrival: {
                iataCode: "MAD",
                at: "2021-07-04T11:35:00",
              },
              carrierCode: "AF",
              number: "1300",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT2H5M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          segments: [
            {
              departure: {
                iataCode: "MAD",
                terminal: "2",
                at: "2021-07-11T18:35:00",
              },
              arrival: {
                iataCode: "ORY",
                at: "2021-07-11T20:30:00",
              },
              carrierCode: "AF",
              number: "9433",
              aircraft: {
                code: "318",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT1H55M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "381.86",
        base: "211.00",
        fees: [
          {
            amount: "0.00",
            type: "TICKETING",
          },
        ],
        grandTotal: "381.86",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: false,
        refundableFare: false,
        noRestrictionFare: false,
        noPenaltyFare: false,
      },
      validatingAirlineCodes: ["AF"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "186.96",
            base: "111.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "1.13",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "1.50",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OALG",
              brandedFare: "LIGHT1",
              class: "Q",
              includedCheckedBags: {
                quantity: 0,
              },
              amenities: [
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06A",
                  description: "LIGHT MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: true,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OALG",
              brandedFare: "LIGHT1",
              class: "V",
              includedCheckedBags: {
                quantity: 0,
              },
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "CHILD",
          price: {
            currency: "EUR",
            total: "164.96",
            base: "89.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "1.13",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "1.50",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OALG",
              brandedFare: "LIGHT1",
              class: "Q",
              includedCheckedBags: {
                quantity: 0,
              },
              amenities: [
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06A",
                  description: "LIGHT MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: true,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OALG",
              brandedFare: "LIGHT1",
              class: "V",
              includedCheckedBags: {
                quantity: 0,
              },
            },
          ],
        },
        {
          travelerId: "3",
          fareOption: "STANDARD",
          travelerType: "HELD_INFANT",
          associatedAdultId: "1",
          price: {
            currency: "EUR",
            total: "29.94",
            base: "11.00",
            taxes: [
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OALG",
              brandedFare: "LIGHT1",
              class: "Q",
              includedCheckedBags: {
                quantity: 0,
              },
              amenities: [
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06A",
                  description: "LIGHT MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: true,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OALG",
              brandedFare: "LIGHT1",
              class: "V",
              includedCheckedBags: {
                quantity: 0,
              },
            },
          ],
        },
      ],
      fareRules: {
        currency: "USD",
        rules: [
          {
            category: "EXCHANGE",
            circumstances: "Changes allowed with fee",
            notApplicable: false,
            maxPenaltyAmount: "50.00",
            descriptions: [
              {
                descriptionType: "PENALTY",
                text: "Ticket changes allowed with a $50 fee",
              },
            ],
          },
          {
            category: "REFUND",
            circumstances: "Refundable with penalty",
            notApplicable: false,
            maxPenaltyAmount: "100.00",
            descriptions: [
              {
                descriptionType: "PENALTY",
                text: "Refundable with a $100 fee",
              },
            ],
          },
        ],
      },
    },
    {
      type: "flight-offer",
      id: "3",
      source: "GDS",
      instantTicketingRequired: false,
      paymentCardRequired: false,
      lastTicketingDate: "2021-07-04",
      itineraries: [
        {
          segments: [
            {
              departure: {
                iataCode: "CDG",
                terminal: "2F",
                at: "2021-07-04T09:30:00",
              },
              arrival: {
                iataCode: "MAD",
                at: "2021-07-04T11:35:00",
              },
              carrierCode: "AF",
              number: "1300",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT2H5M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          segments: [
            {
              departure: {
                iataCode: "MAD",
                terminal: "2",
                at: "2021-07-11T18:35:00",
              },
              arrival: {
                iataCode: "ORY",
                at: "2021-07-11T20:30:00",
              },
              carrierCode: "AF",
              number: "9433",
              aircraft: {
                code: "318",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT1H55M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "457.86",
        base: "287.00",
        fees: [
          {
            amount: "0.00",
            type: "TICKETING",
          },
        ],
        grandTotal: "457.86",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: false,
        refundableFare: false,
        noRestrictionFare: false,
        noPenaltyFare: false,
      },
      validatingAirlineCodes: ["AF"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "226.96",
            base: "151.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "1.13",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "1.50",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OBST",
              brandedFare: "STANDARD",
              class: "Q",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06B",
                  description: "STANDARD MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OBST",
              brandedFare: "STANDARD",
              class: "V",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06B",
                  description: "STANDARD MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "CHILD",
          price: {
            currency: "EUR",
            total: "196.96",
            base: "121.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "1.13",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "1.50",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OBST",
              brandedFare: "STANDARD",
              class: "Q",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06B",
                  description: "STANDARD MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OBST",
              brandedFare: "STANDARD",
              class: "V",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06B",
                  description: "STANDARD MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "3",
          fareOption: "STANDARD",
          travelerType: "HELD_INFANT",
          associatedAdultId: "1",
          price: {
            currency: "EUR",
            total: "33.94",
            base: "15.00",
            taxes: [
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OBST",
              brandedFare: "STANDARD",
              class: "Q",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06B",
                  description: "STANDARD MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OBST",
              brandedFare: "STANDARD",
              class: "V",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06B",
                  description: "STANDARD MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
      ],
      fareRules: {
        currency: "USD",
        rules: [
          {
            category: "EXCHANGE",
            circumstances: "Changes allowed with fee",
            notApplicable: false,
            maxPenaltyAmount: "50.00",
            descriptions: [
              {
                descriptionType: "PENALTY",
                text: "Ticket changes allowed with a $50 fee",
              },
            ],
          },
          {
            category: "REFUND",
            circumstances: "Refundable with penalty",
            notApplicable: false,
            maxPenaltyAmount: "100.00",
            descriptions: [
              {
                descriptionType: "PENALTY",
                text: "Refundable with a $100 fee",
              },
            ],
          },
        ],
      },
    },
    {
      type: "flight-offer",
      id: "4",
      source: "GDS",
      instantTicketingRequired: false,
      paymentCardRequired: false,
      lastTicketingDate: "2021-07-04",
      itineraries: [
        {
          segments: [
            {
              departure: {
                iataCode: "CDG",
                terminal: "2F",
                at: "2021-07-04T09:30:00",
              },
              arrival: {
                iataCode: "MAD",
                at: "2021-07-04T11:35:00",
              },
              carrierCode: "AF",
              number: "1300",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT2H5M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          segments: [
            {
              departure: {
                iataCode: "MAD",
                terminal: "2",
                at: "2021-07-11T18:35:00",
              },
              arrival: {
                iataCode: "ORY",
                at: "2021-07-11T20:30:00",
              },
              carrierCode: "AF",
              number: "9433",
              aircraft: {
                code: "318",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT1H55M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "685.86",
        base: "515.00",
        fees: [
          {
            amount: "0.00",
            type: "TICKETING",
          },
        ],
        grandTotal: "685.86",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: false,
        refundableFare: false,
        noRestrictionFare: false,
        noPenaltyFare: false,
      },
      validatingAirlineCodes: ["AF"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "346.96",
            base: "271.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "1.13",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "1.50",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OEFX",
              brandedFare: "FLEX",
              class: "Q",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06D",
                  description: "FLEX MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OEFX",
              brandedFare: "FLEX",
              class: "V",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06D",
                  description: "FLEX MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "CHILD",
          price: {
            currency: "EUR",
            total: "292.96",
            base: "217.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "1.13",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "1.50",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OEFX",
              brandedFare: "FLEX",
              class: "Q",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06D",
                  description: "FLEX MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OEFX",
              brandedFare: "FLEX",
              class: "V",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06D",
                  description: "FLEX MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "3",
          fareOption: "STANDARD",
          travelerType: "HELD_INFANT",
          associatedAdultId: "1",
          price: {
            currency: "EUR",
            total: "45.94",
            base: "27.00",
            taxes: [
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "QS50OEFX",
              brandedFare: "FLEX",
              class: "Q",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06D",
                  description: "FLEX MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "ECONOMY",
              fareBasis: "VS50OEFX",
              brandedFare: "FLEX",
              class: "V",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0C3",
                  description: "CHECKED BAG 1PC OF 23KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0MR",
                  description: "CABIN BAGGAGE 12KG 1PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "050",
                  description: "CHOICE OF STANDARD SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AT",
                  description: "SNACK",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "06D",
                  description: "FLEX MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "058",
                  description: "UPGRADE ELIGIBILITY",
                  isChargeable: true,
                  amenityType: "BRANDED_FARES",
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
    },
    {
      type: "flight-offer",
      id: "5",
      source: "GDS",
      instantTicketingRequired: false,
      paymentCardRequired: false,
      lastTicketingDate: "2021-07-04",
      itineraries: [
        {
          segments: [
            {
              departure: {
                iataCode: "CDG",
                terminal: "2F",
                at: "2021-07-04T09:30:00",
              },
              arrival: {
                iataCode: "MAD",
                at: "2021-07-04T11:35:00",
              },
              carrierCode: "AF",
              number: "1300",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT2H5M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          segments: [
            {
              departure: {
                iataCode: "MAD",
                terminal: "2",
                at: "2021-07-11T18:35:00",
              },
              arrival: {
                iataCode: "ORY",
                at: "2021-07-11T20:30:00",
              },
              carrierCode: "AF",
              number: "9433",
              aircraft: {
                code: "318",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT1H55M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "759.14",
        base: "553.00",
        fees: [
          {
            amount: "0.00",
            type: "TICKETING",
          },
        ],
        grandTotal: "759.14",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: false,
        refundableFare: false,
        noRestrictionFare: false,
        noPenaltyFare: false,
      },
      validatingAirlineCodes: ["AF"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "384.60",
            base: "291.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "11.27",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "9.00",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "BUSINESS",
              fareBasis: "OS50OBNB",
              brandedFare: "BIZLEISURE",
              class: "O",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "BUSINESS",
              fareBasis: "OS50OBNB",
              brandedFare: "BIZLEISURE",
              class: "O",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "CHILD",
          price: {
            currency: "EUR",
            total: "326.60",
            base: "233.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "11.27",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "9.00",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "BUSINESS",
              fareBasis: "OS50OBNB",
              brandedFare: "BIZLEISURE",
              class: "O",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "BUSINESS",
              fareBasis: "OS50OBNB",
              brandedFare: "BIZLEISURE",
              class: "O",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "3",
          fareOption: "STANDARD",
          travelerType: "HELD_INFANT",
          associatedAdultId: "1",
          price: {
            currency: "EUR",
            total: "47.94",
            base: "29.00",
            taxes: [
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "BUSINESS",
              fareBasis: "OS50OBNB",
              brandedFare: "BIZLEISURE",
              class: "O",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "BUSINESS",
              fareBasis: "OS50OBNB",
              brandedFare: "BIZLEISURE",
              class: "O",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "flight-offer",
      id: "6",
      source: "GDS",
      instantTicketingRequired: false,
      paymentCardRequired: false,
      lastTicketingDate: "2021-07-04",
      itineraries: [
        {
          segments: [
            {
              departure: {
                iataCode: "CDG",
                terminal: "2F",
                at: "2021-07-04T09:30:00",
              },
              arrival: {
                iataCode: "MAD",
                at: "2021-07-04T11:35:00",
              },
              carrierCode: "AF",
              number: "1300",
              aircraft: {
                code: "321",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT2H5M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
        {
          segments: [
            {
              departure: {
                iataCode: "MAD",
                terminal: "2",
                at: "2021-07-11T18:35:00",
              },
              arrival: {
                iataCode: "ORY",
                at: "2021-07-11T20:30:00",
              },
              carrierCode: "AF",
              number: "9433",
              aircraft: {
                code: "318",
              },
              operating: {
                carrierCode: "AF",
              },
              duration: "PT1H55M",
              id: "14",
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        },
      ],
      price: {
        currency: "EUR",
        total: "1831.14",
        base: "1625.00",
        fees: [
          {
            amount: "0.00",
            type: "TICKETING",
          },
        ],
        grandTotal: "1831.14",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: false,
        refundableFare: false,
        noRestrictionFare: false,
        noPenaltyFare: false,
      },
      validatingAirlineCodes: ["AF"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: "EUR",
            total: "948.60",
            base: "855.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "11.27",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "9.00",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "BUSINESS",
              fareBasis: "IS50AENB",
              brandedFare: "BIZFLEX",
              class: "I",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "BUSINESS",
              fareBasis: "IS50AENB",
              brandedFare: "BIZFLEX",
              class: "I",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "2",
          fareOption: "STANDARD",
          travelerType: "CHILD",
          price: {
            currency: "EUR",
            total: "777.60",
            base: "684.00",
            taxes: [
              {
                amount: "16.36",
                code: "FR",
              },
              {
                amount: "11.27",
                code: "IZ",
              },
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "9.00",
                code: "O4",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
              {
                amount: "12.03",
                code: "QX",
              },
              {
                amount: "26.00",
                code: "YQ",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "BUSINESS",
              fareBasis: "IS50AENB",
              brandedFare: "BIZFLEX",
              class: "I",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "BUSINESS",
              fareBasis: "IS50AENB",
              brandedFare: "BIZFLEX",
              class: "I",
              includedCheckedBags: {
                quantity: 2,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
        {
          travelerId: "3",
          fareOption: "STANDARD",
          travelerType: "HELD_INFANT",
          associatedAdultId: "1",
          price: {
            currency: "EUR",
            total: "104.94",
            base: "86.00",
            taxes: [
              {
                amount: "14.95",
                code: "JD",
              },
              {
                amount: "0.61",
                code: "OG",
              },
              {
                amount: "3.38",
                code: "QV",
              },
            ],
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: "BUSINESS",
              fareBasis: "IS50AENB",
              brandedFare: "BIZFLEX",
              class: "I",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
            {
              segmentId: "14",
              cabin: "BUSINESS",
              fareBasis: "IS50AENB",
              brandedFare: "BIZFLEX",
              class: "I",
              includedCheckedBags: {
                quantity: 1,
              },
              amenities: [
                {
                  code: "0MS",
                  description: "CABIN BAGGAGE 18KG 2PC 115CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0FM",
                  description: "CHECKED BAG 2PC OF 32KG 158CM",
                  isChargeable: false,
                  amenityType: "BAGGAGE",
                },
                {
                  code: "0B3",
                  description: "MEAL",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "05Z",
                  description: "PRIVACY SEAT",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0BX",
                  description: "BUSINESS LOUNGE ACCESS",
                  isChargeable: false,
                  amenityType: "LOUNGE",
                },
                {
                  code: "06H",
                  description: "BUSINESS CLASS MILES ACCRUAL",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "0AX",
                  description: "BEVERAGE",
                  isChargeable: false,
                  amenityType: "MEAL",
                },
                {
                  code: "059",
                  description: "CHANGEABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "056",
                  description: "REFUNDABLE TICKET",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07G",
                  description: "SKY PRIORITY",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
                {
                  code: "07H",
                  description: "GO SHOW",
                  isChargeable: false,
                  amenityType: "BRANDED_FARES",
                },
              ],
            },
          ],
        },
      ],
      fareRules: {
        currency: "USD",
        rules: [
          {
            category: "EXCHANGE",
            circumstances: "Changes allowed with fee",
            notApplicable: false,
            maxPenaltyAmount: "50.00",
            descriptions: [
              {
                descriptionType: "PENALTY",
                text: "Ticket changes allowed with a $50 fee",
              },
            ],
          },
          {
            category: "REFUND",
            circumstances: "Refundable with penalty",
            notApplicable: false,
            maxPenaltyAmount: "100.00",
            descriptions: [
              {
                descriptionType: "PENALTY",
                text: "Refundable with a $100 fee",
              },
            ],
          },
        ],
      },
    },
  ],
  dictionaries: {
    locations: {
      MAD: {
        cityCode: "MAD",
        countryCode: "ES",
      },
      CDG: {
        cityCode: "PAR",
        countryCode: "FR",
      },
      ORY: {
        cityCode: "PAR",
        countryCode: "FR",
      },
    },
  },
};
