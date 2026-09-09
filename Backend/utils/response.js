/**
 * Standard API response helpers.
 */

const successResponse = (res, data, message = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const body = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };
