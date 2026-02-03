const Promotion = require("../../lib/schema/notification.schema");
const { UserStatus } = require("../../lib/utils/enum");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const NcheckEndDate = async (req, res, next) => {
  try {
    console.log("here");
    let promotion = null;
    if (req.params.id) {
      promotion = await Promotion.findById(req.params.id);
      if (!promotion) {
        errorResponse(res, "Notification not found", 404);
      }
    }
    const currentDate = new Date();
    if (promotion && promotion.endDate && promotion.endDate <= currentDate) {
      if (promotion.status === UserStatus.ACTIVE) {
        promotion.status = UserStatus.INACTIVE;
        await promotion.save();
        console.log(
          `Notification ${promotion._id} status updated to INACTIVE due to expired endDate.`
        );
      }
    }

    next();
  } catch (error) {
    return errorResponse(res, error);
  }
};

module.exports = NcheckEndDate;
