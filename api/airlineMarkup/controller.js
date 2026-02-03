const Markup = require("../../lib/schema/airlinemarkup.schema");
const Type = require("../../lib/schema/agencytypes.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
exports.createMarkup = async (req, res) => {
  try {
    const { type, markup, airline } = req.body;
    const find = await Type.findById(type);
    if (!find) {
      return errorResponse(res, "type not found", 400);
    }
    const findType = await Markup.findOne({ type });
    console.log(findType);
    if (findType) {
      return errorResponse(res, "Markp  already present of this agency", 400);
    }
    const newMarkup = new Markup({ type, markup, airline });
    await newMarkup.save();
    return successResponse(res, "Markup created successfully", newMarkup);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.getAll = async (req, res) => {
  try {
    const markup = await Markup.find();
    res.status(200).json(markup);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Markup", error });
  }
};
exports.getById = async (req, res) => {
  try {
    const markup = await Markup.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: "Markup not found" });
    }
    res.status(200).json(markup);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Markup", error });
  }
};

exports.update = async (req, res) => {
  try {
    const { type, markup, airline } = req.body;
    if (type) {
      return errorResponse(res, "cannot update the type", 400);
    }
    const updatedmarkup = await Markup.findByIdAndUpdate(
      req.params.id,
      { type, markup, airline },
      { new: true } // Return the updated document
    );
    if (!updatedmarkup) {
      return res.status(404).json({ message: "Markup not found" });
    }
    res
      .status(200)
      .json({ message: "Markup updated successfully", updatedmarkup });
  } catch (error) {
    res.status(500).json({ message: "Error updating Markup", error });
  }
};
exports.delete = async (req, res) => {
  try {
    const deletedMarkup = await Markup.findByIdAndDelete(req.params.id);
    if (!deletedMarkup) {
      return res.status(404).json({ message: "deletedMarkup not found" });
    }
    res
      .status(200)
      .json({ message: "Markup deleted successfully", deletedMarkup });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Markup", error });
  }
};
