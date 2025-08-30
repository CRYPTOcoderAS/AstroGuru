const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 1 * 60 * 1000, max = 5) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: `Too many requests. Please try again after ${windowMs / 1000} seconds.`,
      retryAfter: windowMs / 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: `Too many requests from this IP. Please try again after ${windowMs / 1000} seconds.`,
        retryAfter: windowMs / 1000
      });
    }
  });
};

const apiLimiter = createRateLimiter(1 * 60 * 1000, 5);
const authLimiter = createRateLimiter(15 * 60 * 1000, 10);

module.exports = {
  apiLimiter,
  authLimiter,
  createRateLimiter
};
