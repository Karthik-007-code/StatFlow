/**
 * Centralized error-handling middleware.
 * Catches all errors thrown or passed via next(err) and sends
 * a consistent JSON error response.
 */
const errorHandler = (err, _req, res, _next) => {
  // Default to 500 if no status code has been set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only include stack traces in development
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
