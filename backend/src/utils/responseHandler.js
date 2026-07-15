const sendSuccess = (res, message, data = {}, statusCode = 200) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
    statusCode,
  });

const buildError = (message, errors, statusCode, requestId) => ({
  success: false,
  message,
  errors,
  statusCode,
  requestId,
});

module.exports = { sendSuccess, buildError };

