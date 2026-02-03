const visaSchema = require("../../lib/schema/visa.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const { EVisaStatus } = require("../../lib/utils/enum");

exports.createVisa = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      cnicNumber,
      cnicExpiry,
      passportNumber,
      passportExpiry,
      passportPicture,
      residentCountry,
      cnicPicture,
      visaCountry,
    } = req.body;
    const findVisa = await visaSchema.findOne({
      where: {
        passportNumber: req.body.passportNumber,
      },
    });
    if (findVisa.visaExpiry > new Date()) {
      return errorResponse(res, "Visa has already been issued", 400);
    }
    if (findVisa.status === EVisaStatus.PENDING) {
      return errorResponse(res, "Visa is already  pending", 400);
    }
    const createVisa = await visaSchema.create({
      firstName,
      lastName,
      cnicNumber,
      cnicExpiry,
      passportNumber,
      passportExpiry,
      passportPicture,
      residentCountry,
      cnicPicture,
      visaCountry,
    });
    visaSchema.save(createVisa);
    return successResponse(res, "visa saved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.updateVisa = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, visaNumber, visaExpiry } = req.body;
    const findVisa = await visaSchema.findOne({
      where: {
        _id: id,
      },
    });
    if (!findVisa) {
      return errorResponse(res, " visa details not found", 404);
    }
    const updateVisa = await visaSchema.update(id, {
      status,
      visaNumber,
      visaExpiry,
    });
    return successResponse(res, "visa details updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.getAllVisa = async (req, res) => {
  try {
    const date = new Date();
    const findVisa = await visaSchema.find();
    if (findVisa.length <= 0) {
      return errorResponse(res, "No visa found", 404);
    }
    findVida.map((visa) => {
      if (date > visa.visaExpiry) {
        visaSchema.update(visa._id, {
          status: EVisaStatus.EXPIRED,
        });
      }
    });
    return successResponse(res, "visa details found successfully", findVisa);
  } catch (error) {
    return errorResponse(res, error);
  }
};
