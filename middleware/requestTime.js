const requestTime = function (req, res, next) {
  req.requestTime = new Date().toLocaleString('EAT', 'YYYY-MM-DD');
  console.log(`⏰ Requested at ${req.requestTime}`);
  next();
};

module.exports = requestTime;
