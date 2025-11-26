// middlewares/error.middleware.js
module.exports.errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    const status = err.statusCode || 500;

    res.status(status).json({
        status,
        message: err.message || "Internal Server Error",
        details: err.details || null,
    });
};
