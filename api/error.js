exports.errorResponse = (res, error, statusCode = 500) => {
  res.status(statusCode).json({
    status: "fail",
    error: typeof error !== "string" ? error.message : error,
    // message: typeof error !== "string" ? error.message : error,
    result: null,
  });
};
