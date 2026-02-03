const Promotion = require("../../lib/schema/promotion.schema");
const { UserStatus } = require("../../lib/utils/enum");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

const checkEndDateAll = async (req, res, next) => {
  try {
    const currentDate = new Date(); // Get the current date
    const promotions = await Promotion.find(); // Fetch all promotions

    // Loop through all promotions to check their endDate
    for (const promotion of promotions) {
      if (promotion.endDate && promotion.endDate < currentDate) {
        if (promotion.status === UserStatus.ACTIVE) {
          promotion.status = UserStatus.INACTIVE; // Change status to inactive
          await promotion.save(); // Save the updated promotion
          console.log(
            `Promotion ${promotion._id} status updated to INACTIVE due to expired endDate.`
          );
        }
      }
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return errorResponse(res, error); // Handle error response
  }
};

module.exports = checkEndDateAll;
