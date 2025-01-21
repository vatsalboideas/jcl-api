exports.response = function (res, error, status, message, data) {
  return res.status(status).json({
    error: error,
    status: status,
    message: message,
    data: data,
  });
};
