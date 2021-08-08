function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // JWT Auth Error
    return res.status(500).json({ message: 'the user is not authorized' });
  }

  if (err.name === 'ValidationError') {
    //Validation Error
    return res.status(500).json({ message: err });
  }

  //Default Error
  return res.status(500).json(err);
}

module.exports = errorHandler;
