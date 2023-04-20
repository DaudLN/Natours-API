const limiter = require('limiter');
const status = require('statuses');

function createLimiter(maxRequestsPerMinute) {
  const limiterObj = new limiter.RateLimiter(maxRequestsPerMinute, 'minute');
  return function (req, res, next) {
    limiterObj.removeTokens(1, (err, remainingRequests) => {
      if (err) return next(err);
      res.set('X-RateLimit-Limit', maxRequestsPerMinute);
      res.set('X-RateLimit-Remaining', remainingRequests);
      if (remainingRequests < 1) {
        return res
          .status(status('Too Many Requests'))
          .send('Too many requests, please try again later.');
      }
      next();
    });
  };
}

module.exports = createLimiter;
