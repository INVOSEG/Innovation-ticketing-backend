const Markup = require("../../lib/schema/markup.schema");
const Airlines = require("../airlineLogo/airlineLogo");

const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const options = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
};
exports.createMarkup = async (req, res) => {
  try {
    const {
      api,
      markupType,
      airlineName,
      startDate,
      endDate,
      airlines,
      markupValue,
      status,
    } = req.body;
    const findMarkup = await Markup.findOne({
      // status: "ACTIVE",
      api: { $in: [api, "all"] },
      airlines: { $in: [airlines, "all"] },
    });
    console.log(findMarkup);
    if (findMarkup) {
      return errorResponse(
        res,
        `Markup already exists for this ${api} and is ${findMarkup.status}.`,
        400
      );
    }
    const newMarkup = new Markup({
      api,
      markupType,
      startDate,
      endDate,
      airlines,
      markupValue,
      airlineName,
      status,
    });
    const savedMarkup = await newMarkup.save();
    return successResponse(res, "Markup is created successfully", savedMarkup);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.getAllMarkups = async (req, res) => {
  try {
    const currentDateTime = new Date(); // Current Date & Time
    const activeMarkups = await Markup.find({ status: "ACTIVE" }); // Fetch only active markups

    for (const markup of activeMarkups) {
      const markupEndDate = new Date(markup.endDate);

      // Check if endDate has already passed
      if (markupEndDate.getTime() < currentDateTime.getTime()) {
        console.log(
          `Markup for API: ${markup.api}, Airline: ${markup.airlines} has expired. Marking as INACTIVE.`
        );

        markup.status = "INACTIVE";
        await markup.save();
      }
    }

    // Fetch all markups (both active & inactive)
    const allMarkups = await Markup.find();

    return successResponse(
      res,
      "Markups fetched and updated successfully",
      allMarkups
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.getAllActiveMarkups = async (req, res) => {
  try {
    const currentDateTime = new Date(); // Current Date & Time

    // Fetch only active markups
    const activeMarkups = await Markup.find({ status: "ACTIVE" });

    for (const markup of activeMarkups) {
      const markupEndDate = new Date(markup.endDate);

      // Check if endDate has already passed
      if (markupEndDate.getTime() < currentDateTime.getTime()) {
        console.log(
          `Markup for API: ${markup.api}, Airline: ${markup.airlines} has expired. Marking as INACTIVE.`
        );

        markup.status = "INACTIVE";
        await markup.save();
      }
    }

    // Fetch updated list of active markups
    const markups = await Markup.find({ status: "ACTIVE" });

    if (markups.length === 0) {
      return errorResponse(res, "No active markups found", 404);
    }

    return successResponse(
      res,
      "Markups fetched and updated successfully",
      markups
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.getMarkupById = async (req, res) => {
  try {
    const { id } = req.params;
    const markup = await Markup.findById(id);
    if (!markup) {
      return errorResponse(res, "Markup not found", 404);
    }
    return successResponse(res, "Markup fetched successfully", markup);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.updateMarkup = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMarkup = await Markup.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedMarkup) {
      return errorResponse(res, "Markup not found", 404);
    }
    return successResponse(res, "Markup updated successfully", updatedMarkup);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.deleteMarkup = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMarkup = await Markup.findByIdAndDelete(id);
    if (!deletedMarkup) {
      return errorResponse(res, "Markup not found", 404);
    }
    return successResponse(res, "Markup deleted successfully", deletedMarkup);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.updateMarkupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const findAIdMarkup = await Markup.findById(id);
    if (!findAIdMarkup) {
      return errorResponse(res, "Markup not found", 404);
    }
    if (findAIdMarkup.status === status) {
      return errorResponse(res, "Markup status is already " + status, 400);
    }
    if (status === "ACTIVE") {
      const as = new Date();
      const currentDateTime = new Date(as);
      const currentDate = currentDateTime.toISOString().split("T")[0];
      const currentTime = currentDateTime.toLocaleTimeString();

      // console.log(markupval, currentTime, currentDateTime);
      const markupval = new Date(findAIdMarkup.endDate);
      const markupDate = markupval.toISOString().split("T")[0];
      const markupTime = markupval.toLocaleTimeString("en-US", options);
      const date = new Date("2024-09-25T11:00:21.792Z");
      console.log(date.toLocaleTimeString("en-US", options));
      if (markupDate === currentDate) {
        console.log("Today's date ");

        if (markupTime < timeValue) {
          console.log("Today's date but time has passed, updating to INACTIVE");

          return errorResponse(
            res,
            `The end time ${markupTime} has already passed. Please update the date before activating the markup.`,
            400
          );
        }
      } else if (findAIdMarkup.endDate < currentDateTime) {
        console.log("Date has passed, updating to INACTIVE");

        return errorResponse(
          res,
          `The date ${markupTime} has already passed. Please update the date before activating the markup.`,
          400
        );
      }

      // if (findAIdMarkup.endDate && currentDate === markupDate) {
      //   if (currentTime < markupTime) {
      //     return errorResponse(
      //       res,
      //       `The end time ${markupTime} has not passed. `,
      //       400
      //     );
      //   } else if (currentTime > markupTime) {
      //     return errorResponse(
      //       res,
      //       `The end time ${markupTime} has already passed. Please update the date before activating the markup.`,
      //       400
      //     );
      //   }
      // } else if (markupDate < currentDate) {
      //   return errorResponse(
      //     res,
      //     `The end date ${markupDate} has already passed. Please update the date
      //     before activating the markup.`,
      //     400
      //   );
      // }

      const findActiveMarkup = await Markup.findOne({
        api: findAIdMarkup.api,
        status: "ACTIVE",
        _id: { $ne: id },
      });

      if (findActiveMarkup) {
        return errorResponse(
          res,
          `Another markup with ID ${findActiveMarkup._id} is already active for API: ${findActiveMarkup.api}. Only one markup per API can be active.`,
          400
        );
      }
    }

    const validStatuses = ["ACTIVE", "INACTIVE"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const updatedMarkup = await Markup.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedMarkup) {
      return res.status(404).json({ message: "Markup not found" });
    }

    return successResponse(
      res,
      "Markup status updated successfully",
      updatedMarkup
    );
  } catch (err) {
    console.error("Error updating markup status:", err);
    return errorResponse(res, err);
  }
};
exports.getAllAirlines = async (req, res) => {
  try {
    const { ar, arCode } = req.query; // Get query parameters

    // Ensure Airlines is an array
    if (!Array.isArray(Airlines)) {
      return errorResponse(res, "Airlines data is not available", 500);
    }

    let filteredAirlines = [...Airlines]; // Copy Airlines array

    if (ar) {
      const arLower = ar.toLowerCase(); // Convert input to lowercase
      filteredAirlines = filteredAirlines.filter(
        (airline) => airline.ar && airline.ar.toLowerCase().includes(arLower)
      );
    }

    if (arCode) {
      const arCodeLower = arCode.toLowerCase();
      filteredAirlines = filteredAirlines.filter(
        (airline) =>
          airline.arCode && airline.arCode.toLowerCase().includes(arCodeLower)
      );
    }

    return successResponse(
      res,
      "Airlines fetched successfully",
      filteredAirlines
    );
  } catch (error) {
    console.error("Error fetching airlines:", error);
    return errorResponse(res, error.message, 500);
  }
};
