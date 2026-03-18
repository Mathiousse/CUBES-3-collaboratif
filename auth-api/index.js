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

const User = require('./models/User');

const defaultUsers = [
  { email: 'admin@admin.fr',     password: 'admin123',  name: 'Admin',   role: 'ADMIN' },
  { email: 'client@client.fr',   password: 'client',    name: 'Client',  role: 'CUSTOMER', address: '10 Rue de la Paix, Paris' },
  { email: 'livreur@livreur.fr', password: 'livreur',   name: 'Livreur', role: 'DELIVERY_PERSON' }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Auth-API connected to MongoDB');
    for (const u of defaultUsers) {
      if (!await User.findOne({ email: u.email })) {
        await new User(u).save();
        console.log(`  [seed] created ${u.email}`);
      }
    }
  })
  .catch(err => console.error(err));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-api' }));

app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth-API running on port ${PORT}`));

