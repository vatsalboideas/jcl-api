const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log rate limit violations to a separate file
    new winston.transports.File({
      filename: 'rate-limit-violations.log',
      level: 'warn',
    }),
    // Also log to console in development
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Custom handler for rate limit exceeded
const handleRateLimitExceeded = (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const domain = req.hostname || 'unknown';
  const path = req.path;
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Log the violation with detailed information
  logger.warn({
    message: 'Rate limit exceeded',
    type: 'RATE_LIMIT_VIOLATION',
    details: {
      ip: clientIP,
      domain: domain,
      path: path,
      userAgent: userAgent,
      timestamp: new Date().toISOString(),
      headers: req.headers,
      method: req.method,
    },
  });

  // Send response to client
  res.status(429).json({
    error: 'Too many requests from this IP, please try again later',
    retryAfter: res.getHeader('Retry-After'),
  });
};

// Configure rate limiter with logging
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: handleRateLimitExceeded,
  // Optional: Skip logging for certain trusted IPs
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS
      ? process.env.TRUSTED_IPS.split(',')
      : [];
    return trustedIPs.includes(req.ip);
  },
});

module.exports = limiter;
