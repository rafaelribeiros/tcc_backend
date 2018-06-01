class CustomError extends Error {
  constructor(message, status) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'CustomError';
    this.message = message;
    if (typeof status !== 'undefined') this.status = status;
  }
}

module.exports = CustomError;