exports.successResponse = (
  res,
  message,
  result,
  statusCode = 200,
  headers = {}
) => {
  // Validate that the status code is a number
  if (typeof statusCode !== "number") {
    console.error("Invalid status code:", statusCode);
    statusCode = 200; // Fallback to a default success status code
  }

  // Set custom headers if provided
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Send the success response
  res.status(statusCode).json({
    status: "success",
    message,
    result,
  });
};
