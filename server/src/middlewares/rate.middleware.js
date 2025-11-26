// middlewares/rateLimit.middleware.js
const rateLimit = require("express-rate-limit");

module.exports.loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,                  // 5 requests per minute
    message: {
        message: "Too many login attempts, please try again later."
    }
});
