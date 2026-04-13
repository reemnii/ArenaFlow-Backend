const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;

  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message: err.message || "Server error",
  });
};

module.exports = {
  notFound,
  errorHandler,
};
