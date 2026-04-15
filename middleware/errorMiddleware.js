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

  const response = {
    message: err.message || "Server error",
  };

  if (err.errors) {
    response.errors = Array.isArray(err.errors)
      ? err.errors
      : Object.values(err.errors).map((error) => error.message);
  }

  if (err.code === 11000) {
    statusCode = 400;
    response.message = "Duplicate value";
    response.errors = Object.keys(err.keyValue || {}).map(
      (field) => `${field} already exists.`
    );
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
