const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerName: { 
    type: String, 
    required: [true, 'Customer name is required'],
    trim: true 
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true 
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'] 
  },
  washType: { 
    type: String, 
    required: [true, 'Wash type is required'] 
  },
  weightKg: { 
    type: Number, 
    required: [true, 'Weight/Quantity is required'],
    min: [1, 'Weight must be at least 1'] 
  },
  pickupDate: { 
    type: String, 
    required: [true, 'Pickup date is required'] 
  },
  timeSlot: { 
    type: String, 
    required: [true, 'Time slot is required'] 
  },
  totalPrice: { 
    type: Number, 
    required: [true, 'Total price is required'] 
  },
  isExpress: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['Booked', 'Picked Up', 'In Washing', 'Delivered'], 
    default: 'Booked' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Booking', bookingSchema);