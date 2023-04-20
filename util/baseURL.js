module.exports = (req) => `${req.protocol}://${req.get('host')}/api/v1`;
