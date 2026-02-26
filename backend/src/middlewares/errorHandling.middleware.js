export class ApplicationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);

  // Mongo duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Name or Email already exists",
      field: Object.keys(err.keyValue || {})[0],
    });
  }

  // Custom application errors
  if (err instanceof ApplicationError) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback
  return res.status(500).json({
    success: false,
    message: "Oops! Something went wrong. Please try again later.",
  });
};
