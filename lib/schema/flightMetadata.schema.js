const mongoose = require("mongoose");
const { Schema } = mongoose;

const flightMetadataSchema = new Schema(
    {
        carrierCode: { type: String, required: true },
        flightNumber: { type: String, required: true },
        aircraft: { type: String },
        equipmentType: { type: String },
    },
    {
        timestamps: true,
        // Unique index to ensure we only have one entry per flight number
        index: { carrierCode: 1, flightNumber: 1 },
        unique: true
    }
);

// Compound index for fast lookup
flightMetadataSchema.index({ carrierCode: 1, flightNumber: 1 }, { unique: true });

module.exports = mongoose.model("FlightMetadata", flightMetadataSchema);
