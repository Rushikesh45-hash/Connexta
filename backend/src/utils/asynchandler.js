const asynchandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);

      // ensure status code is valid
      let statusCode = error.code;
      if (!statusCode || statusCode < 100 || statusCode > 999) {
        statusCode = 500; // fallback
      }

      res.status(statusCode).json({
        success: false,
        message: error.message || "Something went wrong"
      });
    }
  };
};
export { asynchandler };