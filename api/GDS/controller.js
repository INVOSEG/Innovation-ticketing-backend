const GDS = require("../../lib/schema/gds.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

exports.createGDS = async (req, res) => {
  try {
    const { code, title, description } = req.body;
    const newGDS = new GDS({ code, title, description });
    await newGDS.save();
    return successResponse(res, "GDS created successfully", newGDS);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getAllGDS = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", title, code } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;
    let query = {};

    // Apply case-insensitive regex search for partial matches
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    // Apply case-insensitive regex search even for single-character inputs
    if (title) query.title = { $regex: title, $options: "i" };
    if (code) query.code = { $regex: code, $options: "i" };

    const [gdsList, totalCount] = await Promise.all([
      GDS.find(query).skip(skip).limit(limit).lean(),
      GDS.countDocuments(query),
    ]);

    return successResponse(res, "GDS list fetched successfully", {
      data: gdsList,
      totalRecords: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};



exports.getGDSById = async (req, res) => {
  try {
    const { id } = req.params;
    const gds = await GDS.findById(id);
    if (!gds) return errorResponse(res, "GDS not found", 404);
    return successResponse(res, "GDS fetched successfully", gds);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.updateGDS = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, description } = req.body;
    const updatedGDS = await GDS.findByIdAndUpdate(
      id,
      { code, title, description },
      { new: true }
    );
    if (!updatedGDS) return errorResponse(res, "GDS not found", 404);
    return successResponse(res, "GDS updated successfully", updatedGDS);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.deleteGDS = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGDS = await GDS.findByIdAndDelete(id);
    if (!deletedGDS) return errorResponse(res, "GDS not found", 404);
    return successResponse(res, "GDS deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
exports.getNextTitleCode = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title || title.length === 0) {
      return errorResponse(res, "Title is required to generate the code.", 404);
    }

    const prefix = title.charAt(0).toUpperCase(); // Get the first letter of the title

    // Find the last record with the same prefix
    const lastRecord = await GDS.findOne({
      code: { $regex: `^[0-9]+${prefix}$` },
    })
      .sort({ code: -1 })
      .exec();

    let nextCode;

    if (lastRecord) {
      const lastNumber = parseInt(lastRecord.code.match(/\d+/)?.[0] || "0");
      nextCode = `${lastNumber + 1}${prefix}`;
    } else {
      nextCode = `1${prefix}`;
    }

    return successResponse(res, "Next title code generated successfully", {
      nextCode,
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
