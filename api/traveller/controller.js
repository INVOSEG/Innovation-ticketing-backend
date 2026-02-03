const Pax = require("../../lib/schema/traveller.schema");

const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

// Create a new Pax
exports.createPax = async (req, res) => {
  try {
    console.log(req.body);
    const { code, dob, cnicExpiry, passportExpiry } = req.body;
    req.body.code = code.toUpperCase();
    if (dob) req.body.dob = new Date(dob).toISOString().split("T")[0];
    if (cnicExpiry)
      req.body.cnicExpiry = new Date(cnicExpiry).toISOString().split("T")[0];
    if (passportExpiry)
      req.body.passportExpiry = new Date(passportExpiry)
        .toISOString()
        .split("T")[0];

    const pax = new Pax(req.body);
    await pax.save();
    return successResponse(res, "Traveller created successfully", pax);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error);
  }
};

exports.getAllPax = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      code,
      firstname,
      lastname,
      cnic,
      passportNumber,
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};
    let cn = String(cnic);
    console.log(typeof cn);
    if (code) filter.code = new RegExp(code, "i");
    if (firstname) filter.firstname = new RegExp(firstname, "i");
    if (lastname) filter.lastname = new RegExp(lastname, "i");
    if (passportNumber) filter.passportNumber = new RegExp(passportNumber, "i");
    console.log(cnic);
    if (cn) {
      if (!isNaN(cn)) {
        console.log("in if");
        filter.cnic = cn;
      } else {
        console.log("in else");
        filter.cnic = { $regex: String(cn), $options: "i" };
      }
    }

    const paxList = await Pax.find(filter)
      .sort({ code: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPax = await Pax.countDocuments(filter);

    return successResponse(res, "Traveller list fetched successfully", {
      paxList,
      pagination: {
        totalPax,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPax / limit),
      },
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.message);
  }
};

// Get a single Pax by ID
exports.getPaxById = async (req, res) => {
  try {
    const pax = await Pax.findById(req.params.id);
    if (!pax) {
      return errorResponse(res, "Traveller not found", 404);
    }
    return successResponse(res, "Traveller fetched successfully", pax);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Update a Pax
exports.updatePax = async (req, res) => {
  try {
    console.log(req.params.id);
    req.body.code = req.body.code.toUpperCase();
    const pax = await Pax.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pax) {
      return errorResponse(res, "Traveller not found", 404);
    }
    console.log(pax);
    return successResponse(res, "Traveller updated successfully", pax);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, "Duplicate entry detected", 400);
    }
    return errorResponse(res, error);
  }
};

// Delete a Pax
exports.deletePax = async (req, res) => {
  try {
    const pax = await Pax.findByIdAndDelete(req.params.id);
    if (!pax) {
      return errorResponse(res, "Traveller not found", 404);
    }
    return successResponse(res, "Traveller deleted successfully", null);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Search Pax by customId or other fields
exports.searchPax = async (req, res) => {
  try {
    const { query } = req.query;
    console.log(query);
    req.body.code = query.toUpperCase();
    const results = await Pax.find({
      $or: [
        { firstname: new RegExp(query, "i") },
        { lastname: new RegExp(query, "i") },
        { code: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ],
    });
    return successResponse(res, "Search results fetched successfully", results);
  } catch (error) {
    return errorResponse(res, error);
  }
};
// Generate the next code for a given prefix
exports.getNextCode = async (req, res) => {
  try {
    const { prefix } = req.query;

    const lastRecord = await Pax.findOne({
      code: { $regex: `^${prefix}` },
    })
      .sort({ code: -1 })
      .exec();

    let nextCode;

    if (lastRecord) {
      const lastNumber = parseInt(lastRecord.code.slice(prefix.length)) || 0;
      nextCode = `${prefix}${String(lastNumber + 1).padStart(2, "0")}`;
    } else {
      // If no records exist, start with 01
      nextCode = `${prefix}01`;
    }

    // Send the generated code as a response
    return successResponse(res, "Next code generated successfully", {
      nextCode,
      ok: "😊",
    });
  } catch (error) {
    return errorResponse(res, { error, ok: " 😔" });
  }
};
