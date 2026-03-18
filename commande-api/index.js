require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

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
  .then(() => console.log('Commande-API connected to MongoDB'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'commande-api' }));

app.use('/orders', authMiddleware, require('./routes/orders'));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Commande-API running on port ${PORT}`));

