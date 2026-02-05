const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  deliveryPersonId: { type: String, default: null },
  items: [{ 
    menuItemId: Number,
    name: String, 
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryAddressDetails: {
    street: String,
    city: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'AWAITING_PICKUP', 'IN_TRANSIT', 'DELIVERED'],
    default: 'PENDING'
  },
  stripePaymentIntentId: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Order', OrderSchema);

