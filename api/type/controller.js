const Type = require("../../lib/schema/agencytypes.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
exports.createType = async (req, res) => {
  try {
    const { type } = req.body;
    const findType = await Type.findOne({ type: type });
    if (findType) {
      return errorResponse(res, "Type already present in database", 400);
    }
    const newType = new Type({ type });
    await newType.save();
    return successResponse(res, "Type created successfully", newType);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.getAll = async (req, res) => {
  try {
    const types = await Type.find({ type: { $ne: "super_admin" } });
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Types", error });
  }
};
exports.getById = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Type", error });
  }
};

exports.update = async (req, res) => {
  try {
    const { type, agencyId } = req.body;
    const updatedType = await Type.findByIdAndUpdate(
      req.params.id,
      { type },
      { new: true } // Return the updated document
    );
    if (!updatedType) {
      return res.status(404).json({ message: "Type not found" });
    }
    res.status(200).json({ message: "Type updated successfully", updatedType });
  } catch (error) {
    res.status(500).json({ message: "Error updating Type", error });
  }
};
exports.delete = async (req, res) => {
  try {
    const deletedType = await Type.findByIdAndDelete(req.params.id);
    if (!deletedType) {
      return res.status(404).json({ message: "Type not found" });
    }
    res.status(200).json({ message: "Type deleted successfully", deletedType });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Type", error });
  }
};
