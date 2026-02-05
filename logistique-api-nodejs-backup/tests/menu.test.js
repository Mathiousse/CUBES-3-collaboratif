const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/logistics-test';

const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
}));

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  
  app.get('/menu-items', async (req, res) => {
    const items = await MenuItem.find();
    res.json(items);
  });
});

afterAll(async () => {
  await MenuItem.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await MenuItem.deleteMany({});
  await MenuItem.create([
    { name: 'Classic Burger', description: 'A delicious beef burger', price: 12.99 },
    { name: 'Vegan Burger', description: 'A plant-based burger', price: 14.99 },
    { name: 'Fries', description: 'Crispy golden fries', price: 4.50 }
  ]);
});

describe('Logistics API Tests', () => {
  describe('GET /menu-items', () => {
    it('should return all menu items', async () => {
      const response = await request(app).get('/menu-items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it('should return menu items with correct structure', async () => {
      const response = await request(app).get('/menu-items');

      expect(response.status).toBe(200);
      
      const burger = response.body.find(item => item.name === 'Classic Burger');
      expect(burger).toBeTruthy();
      expect(burger.description).toBe('A delicious beef burger');
      expect(burger.price).toBe(12.99);
    });

    it('should return empty array when no menu items exist', async () => {
      await MenuItem.deleteMany({});
      
      const response = await request(app).get('/menu-items');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});

