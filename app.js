require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const startCleanupCron = require('./utils/cron-jobs');
const ipRangeCheck = require('ip-range-check');
const limiter = require('./utils/rate-limiter');

const app = express();
const port = process.env.PORT || 4000;

const allowedIPs = process.env.ALLOWED_IPS
  ? process.env.ALLOWED_IPS.split(',')
  : ['127.0.0.1', '::1'];
const blockedIPs = process.env.BLOCKED_IPS
  ? process.env.BLOCKED_IPS.split(',')
  : [];

const ipFilterMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  console.log('Client IP:', clientIP);

  // Check if IP is blocked
  if (blockedIPs.some((range) => ipRangeCheck(clientIP, range))) {
    return res.status(403).json({ error: 'Access denied: IP is blocked' });
  }

  // If allowedIPs is not empty, check if IP is allowed
  if (
    allowedIPs.length > 0 &&
    !allowedIPs.some((range) => ipRangeCheck(clientIP, range))
  ) {
    return res
      .status(403)
      .json({ error: 'Access denied: IP not in allowed list' });
  }

  next();
};

// ===== DNS Filtering Middleware =====
const allowedDomains = process.env.ALLOWED_DOMAINS
  ? process.env.ALLOWED_DOMAINS.split(',')
  : [];

const dnsFilterMiddleware = async (req, res, next) => {
  if (allowedDomains.length === 0) {
    return next();
  }

  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    const addresses = await dns.reverse(clientIP);
    console.log('dnsFilterMiddleware: addresses:', addresses);

    const isDomainAllowed = addresses.some((address) =>
      allowedDomains.some((domain) => address.endsWith(domain))
    );

    if (!isDomainAllowed) {
      return res
        .status(403)
        .json({ error: 'Access denied: Domain not allowed' });
    }

    next();
  } catch (error) {
    console.error('DNS lookup error:', error);
    // In case of DNS lookup failure, you can choose to either allow or deny the request
    next();
  }
};

// // Apply rate limiting to all requests
// app.use(limiter);

// // Apply IP filtering to all requests
// app.use(ipFilterMiddleware);

// // Apply DNS filtering to all requests
// app.use(dnsFilterMiddleware);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

// api routes

const mediaRoutes = require('./routers/media.routes');
const contactUsRoutes = require('./routers/contact.routes');
const instagramRoutes = require('./routers/instagramPost.routes');
const workDataRoutes = require('./routers/workData.routes');
const workDetailDataRoutes = require('./routers/workDetailData.routes');
const careerFormRoutes = require('./routers/careerForm.routes');

// use routes

app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/contact-us', contactUsRoutes);
// app.use('/api/v1/instagram', instagramRoutes);
// app.use('/api/v1/work-data', workDataRoutes);
// app.use('/api/v1/work-detail-data', workDetailDataRoutes);
app.use('/api/v1/career-form', careerFormRoutes);

//upload folder configuration

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// start server

startCleanupCron();

app.listen(
  {
    port: port,
  },
  async () => {
    await sequelize.authenticate();
    console.log(`Server running on port ${port}`);
    console.log(`Database Connected!`);
  }
);
