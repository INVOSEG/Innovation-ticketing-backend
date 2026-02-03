const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    api: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Agency ID should always be provided
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true, // User ID should always be provided
    },
    role: {
      type: String,
      required: true, // Role of the user creating the booking
    },
    flightOffers: [
      {
        type: {
          type: String,
          required: true, // Ensure type of offer is always provided
        },
        id: {
          type: String,
          required: true,
        },
        price: {
          currency: {
            type: String,
            required: true,
          },
          total: {
            type: String,
            required: true,
          },
        },
        travelerPricings: [
          {
            travelerId: {
              type: String,
              required: true,
            },
            fareOption: {
              type: String,
              required: true, // Ensure fare option is provided
            },
            travelerType: {
              type: String,
              required: true, // Ensure traveler type is provided
            },
            price: {
              currency: {
                type: String,
                required: true, // Ensure currency is provided
              },
              total: {
                type: String,
                required: true, // Ensure total price is provided
              },
              base: {
                type: String,
                required: true, // Ensure base price is provided
              },
            },
          },
        ],
      },
    ],
    travelers: [
      {
        id: {
          type: String,
          required: true,
        },
        dateOfBirth: {
          type: Date,
          required: true,
        },
        gender: {
          type: String,
          required: true,
        },
        name: {
          firstName: {
            type: String,
            required: true,
          },
          lastName: {
            type: String,
            required: true,
          },
        },
      },
    ],
    contacts: [
      {
        addresseeName: {
          firstName: {
            type: String,
            required: true,
          },
        },
        phones: [
          {
            deviceType: {
              type: String,
              required: true,
            },
            countryCallingCode: {
              type: String,
              required: true,
            },
            number: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    remarks: {
      general: [
        {
          subType: {
            type: String,
            required: true,
          },
          text: {
            type: String,
            required: true, // Ensure text is provided
          },
        },
      ],
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
