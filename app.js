require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { sequelize } = require('./models');

const app = express();
const port = process.env.PORT || 4000;

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
app.use('/api/v1/instagram', instagramRoutes);
app.use('/api/v1/work-data', workDataRoutes);
app.use('/api/v1/work-detail-data', workDetailDataRoutes);
app.use('/api/v1/career-form', careerFormRoutes);

//upload folder configuration

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// start server

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
