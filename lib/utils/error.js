exports.errorResponse = (
  res,
  error,
  statusCode = 500,
  result = null,
  headers = {}
) => {
  // Validate that the status code is a number
  if (typeof statusCode !== "number") {
    console.error("Invalid status code:", statusCode);
    statusCode = 500; // Fallback to a default status code
  }

  // Set custom headers if provided
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Send the error response
  res.status(statusCode).json({
    status: "fail",
    error: typeof error !== "string" ? error.message : error,
    message: error,
    result, // Include additional result information if provided
  });
};
