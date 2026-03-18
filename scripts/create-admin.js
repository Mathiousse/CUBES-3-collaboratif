const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../auth-api/models/User');

async function createAdminUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'ADMIN'
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdminUser();
