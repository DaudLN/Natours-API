const { createLogger, transports } = require('winston');

const logger = createLogger({
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: console.log((info) => `${info.level}: ${info.message}`),
    })
  );
}

module.exports = logger;
