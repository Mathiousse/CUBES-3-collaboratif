const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const User = require('../models/User');

const app = express();
app.use(cors());
app.use(express.json());

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'auth-test' });
  app.use('/auth', require('../routes/auth'));
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API Tests', () => {
  describe('POST /auth/register', () => {
    it('should register a new customer', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'customer@test.com',
          password: 'password123',
          role: 'CUSTOMER',
          address: '123 Main St'
        });

      expect(response.status).toBe(201);
      expect(response.text).toBe('User registered');

      const user = await User.findOne({ email: 'customer@test.com' });
      expect(user).toBeTruthy();
      expect(user.role).toBe('CUSTOMER');
      expect(user.address).toBe('123 Main St');
    });

    it('should register a new delivery person', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'delivery@test.com',
          password: 'password123',
          role: 'DELIVERY_PERSON'
        });

      expect(response.status).toBe(201);

      const user = await User.findOne({ email: 'delivery@test.com' });
      expect(user).toBeTruthy();
      expect(user.role).toBe('DELIVERY_PERSON');
    });

    it('should not register duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'CUSTOMER'
        });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password456',
          role: 'CUSTOMER'
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('User already exists');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'login@test.com',
          password: 'password123',
          role: 'CUSTOMER',
          address: '456 Oak Ave'
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Invalid credentials');
    });
  });
});

