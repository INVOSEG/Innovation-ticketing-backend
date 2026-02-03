exports.successResponse = (res, message, result, statusCode = 200) => {
  res.status(statusCode).json({
    status: "success",
    error: null,
    message,
    result,
  });
};
