const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.JWT_SECRET = JWT_SECRET;

jest.mock('stripe', () => {
  return jest.fn(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        client_secret: 'test_client_secret'
      })
    }
  }));
});

const app = express();
app.use(cors());
app.use(express.json());

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'orders-test' });
  const authMiddleware = require('../middleware/authMiddleware');
  app.use('/orders', authMiddleware, require('../routes/orders'));
});

afterAll(async () => {
  await Order.deleteMany({});
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
});

function generateToken(userId, role) {
  return jwt.sign({ user: { id: userId, role } }, JWT_SECRET, { expiresIn: '1h' });
}

describe('Order API Tests', () => {
  describe('POST /orders', () => {
    it('should create a new order for a customer', async () => {
      const customerToken = generateToken('customer123', 'CUSTOMER');

      const response = await request(app)
        .post('/orders')
        .set('x-auth-token', customerToken)
        .send({
          items: [
            { name: 'Classic Burger', price: 12.99 },
            { name: 'Fries', price: 4.50 }
          ],
          totalAmount: 17.49,
          deliveryAddress: '123 Main St'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body.order.customerId).toBe('customer123');
      expect(response.body.order.status).toBe('PENDING');
      expect(response.body.order.items.length).toBe(2);
    });

    it('should not allow delivery person to create an order', async () => {
      const deliveryToken = generateToken('delivery123', 'DELIVERY_PERSON');

      const response = await request(app)
        .post('/orders')
        .set('x-auth-token', deliveryToken)
        .send({
          items: [{ name: 'Classic Burger', price: 12.99 }],
          totalAmount: 12.99,
          deliveryAddress: '123 Main St'
        });

      expect(response.status).toBe(403);
      expect(response.text).toBe('Forbidden');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          items: [{ name: 'Classic Burger', price: 12.99 }],
          totalAmount: 12.99,
          deliveryAddress: '123 Main St'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /orders/available', () => {
    beforeEach(async () => {
      await Order.create([
        {
          customerId: 'customer1',
          items: [{ name: 'Burger', price: 12.99 }],
          totalAmount: 12.99,
          deliveryAddress: '123 Main St',
          status: 'PENDING',
          stripePaymentIntentId: 'pi_1'
        },
        {
          customerId: 'customer2',
          items: [{ name: 'Pizza', price: 15.99 }],
          totalAmount: 15.99,
          deliveryAddress: '456 Oak Ave',
          status: 'PENDING',
          stripePaymentIntentId: 'pi_2'
        },
        {
          customerId: 'customer3',
          items: [{ name: 'Salad', price: 9.99 }],
          totalAmount: 9.99,
          deliveryAddress: '789 Pine Rd',
          status: 'AWAITING_PICKUP',
          stripePaymentIntentId: 'pi_3',
          deliveryPersonId: 'delivery1'
        }
      ]);
    });

    it('should return available orders for delivery person', async () => {
      const deliveryToken = generateToken('delivery123', 'DELIVERY_PERSON');

      const response = await request(app)
        .get('/orders/available')
        .set('x-auth-token', deliveryToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every(order => order.status === 'PENDING')).toBe(true);
    });

    it('should not allow customers to view available orders', async () => {
      const customerToken = generateToken('customer123', 'CUSTOMER');

      const response = await request(app)
        .get('/orders/available')
        .set('x-auth-token', customerToken);

      expect(response.status).toBe(403);
      expect(response.text).toBe('Forbidden');
    });
  });

  describe('PUT /orders/:id/claim', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        customerId: 'customer1',
        items: [{ name: 'Burger', price: 12.99 }],
        totalAmount: 12.99,
        deliveryAddress: '123 Main St',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_test'
      });
      orderId = order._id.toString();
    });

    it('should allow delivery person to claim an order', async () => {
      const deliveryToken = generateToken('delivery123', 'DELIVERY_PERSON');

      const response = await request(app)
        .post(`/orders/${orderId}/claim`)
        .set('x-auth-token', deliveryToken);

      expect(response.status).toBe(200);
      expect(response.body.deliveryPersonId).toBe('delivery123');
      expect(response.body.status).toBe('AWAITING_PICKUP');
    });

    it('should not allow customer to claim an order', async () => {
      const customerToken = generateToken('customer123', 'CUSTOMER');

      const response = await request(app)
        .post(`/orders/${orderId}/claim`)
        .set('x-auth-token', customerToken);

      expect(response.status).toBe(403);
      expect(response.text).toBe('Forbidden');
    });

    it('should not allow claiming already claimed order', async () => {
      const deliveryToken = generateToken('delivery123', 'DELIVERY_PERSON');

      await request(app)
        .post(`/orders/${orderId}/claim`)
        .set('x-auth-token', deliveryToken);

      const response = await request(app)
        .post(`/orders/${orderId}/claim`)
        .set('x-auth-token', deliveryToken);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Order not available');
    });
  });
});

