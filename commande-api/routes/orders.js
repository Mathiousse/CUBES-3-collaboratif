const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/', async (req, res) => {
    if (req.user.role !== 'CUSTOMER') return res.status(403).send('Forbidden');
    try {
        const { items, totalAmount, deliveryAddress, deliveryAddressDetails } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
        });
        const order = new Order({
            customerId: req.user.id,
            items,
            totalAmount,
            deliveryAddress,
            deliveryAddressDetails,
            stripePaymentIntentId: paymentIntent.id
        });
        await order.save();
        res.status(201).json({ order, clientSecret: paymentIntent.client_secret });
    } catch (err) { 
        console.error('Order creation error:', err.message);
        res.status(500).send('Server Error') 
    }
});

router.get('/my-orders', async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'CUSTOMER') {
            orders = await Order.find({ customerId: req.user.id }).sort({ createdAt: -1 });
        } else if (req.user.role === 'DELIVERY_PERSON') {
            orders = await Order.find({ deliveryPersonId: req.user.id }).sort({ createdAt: -1 });
        } else {
            return res.status(403).send('Forbidden');
        }
        res.json(orders);
    } catch (err) { 
        console.error('Get my orders error:', err.message);
        res.status(500).send('Server Error') 
    }
});

router.get('/available', async (req, res) => {
    if (req.user.role !== 'DELIVERY_PERSON') return res.status(403).send('Forbidden');
    try {
        const orders = await Order.find({ status: 'PENDING' });
        res.json(orders);
    } catch (err) { 
        console.error('Get available orders error:', err.message);
        res.status(500).send('Server Error') 
    }
});

router.post('/:id/claim', async (req, res) => {
    if (req.user.role !== 'DELIVERY_PERSON') return res.status(403).send('Forbidden');
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.status !== 'PENDING') return res.status(400).send('Order not available');
        order.deliveryPersonId = req.user.id;
        order.status = 'AWAITING_PICKUP';
        await order.save();
        res.json(order);
    } catch (err) { 
        console.error('Claim order error:', err.message);
        res.status(500).send('Server Error') 
    }
});

router.patch('/:id/status', async (req, res) => {
    if (req.user.role !== 'DELIVERY_PERSON') return res.status(403).send('Forbidden');
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).send('Order not found');
        if (order.deliveryPersonId.toString() !== req.user.id) {
            return res.status(403).send('Not your order');
        }
        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) { 
        console.error('Update status error:', err.message);
        res.status(500).send('Server Error') 
    }
});

module.exports = router;

