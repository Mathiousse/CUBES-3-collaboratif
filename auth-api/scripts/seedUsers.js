const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth';

const defaultUsers = [
  { email: 'admin@admin.fr',   password: 'admin123',  name: 'Admin',   role: 'ADMIN' },
  { email: 'client@client.fr', password: 'client',    name: 'Client',  role: 'CUSTOMER',        address: '10 Rue de la Paix, Paris' },
  { email: 'livreur@livreur.fr', password: 'livreur', name: 'Livreur', role: 'DELIVERY_PERSON' }
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const userData of defaultUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`  [skip] ${userData.email} already exists`);
        continue;
      }
      const user = new User(userData);
      await user.save();
      console.log(`  [created] ${userData.email} (${userData.role})`);
    }

    console.log('\nDefault credentials:');
    console.log('  admin@admin.fr     / admin123');
    console.log('  client@client.fr   / client');
    console.log('  livreur@livreur.fr / livreur');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seedUsers();
