const logger = function (req, res, next) {
  console.log('👋 Hello from middleware');
  next();
};
module.exports = logger;
