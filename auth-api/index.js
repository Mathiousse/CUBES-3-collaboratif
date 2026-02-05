require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100
});
app.use(limiter);
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Auth-API connected to MongoDB'))
  .catch(err => console.error(err));

app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth-API running on port ${PORT}`));

