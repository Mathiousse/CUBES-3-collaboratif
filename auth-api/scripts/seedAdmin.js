// Seed admin user for Good Food MVP
// Run with: node scripts/seedAdmin.js

const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/goodfood';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@admin.fr' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Updating role to ADMIN...');
      existingAdmin.role = 'ADMIN';
      await existingAdmin.save();
      console.log('✅ Admin role updated');
    } else {
      // Create new admin user (pre-save hook will hash the password)
      const admin = new User({
        email: 'admin@admin.fr',
        password: 'admin123',  // Will be hashed by pre-save hook
        name: 'Admin',
        role: 'ADMIN'
      });
      
      await admin.save();
      console.log('✅ Admin user created');
    }

    console.log('\nAdmin credentials:');
    console.log('  Email: admin@admin.fr');
    console.log('  Password: admin123');
    console.log('\n⚠️  Change this password in production!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
