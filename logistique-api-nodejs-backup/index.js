require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Logistique-API connected to MongoDB');
    seedMenuItems();
  });

const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
}));

async function seedMenuItems() {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
        console.log('Seeding menu items...');
        await MenuItem.create([
            { name: 'Classic Burger', description: 'A delicious beef burger', price: 12.99 },
            { name: 'Vegan Burger', description: 'A plant-based burger', price: 14.99 },
            { name: 'Fries', description: 'Crispy golden fries', price: 4.50 }
        ]);
    }
}

app.get('/menu-items', async (req, res) => {
    const items = await MenuItem.find();
    res.json(items);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Logistique-API running on port ${PORT}`));

