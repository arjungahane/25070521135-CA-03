const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a new booking
router.post('/book', async (req, res) => {
  try {
    const { 
      customerName, 
      phone, 
      address, 
      washType, 
      weightKg, 
      pickupDate, 
      timeSlot, 
      totalPrice, 
      isExpress 
    } = req.body;

    // Check capacity for time slot (Max 5 pickups per slot)
    const existingBookingsCount = await Booking.countDocuments({ pickupDate, timeSlot });
    if (existingBookingsCount >= 5) {
      return res.status(400).json({ 
        message: 'This time slot is fully booked. Please choose a different time slot or date.' 
      });
    }

    const newBooking = new Booking({
      customerName,
      phone,
      address,
      washType,
      weightKg,
      pickupDate,
      timeSlot,
      totalPrice,
      isExpress
    });

    await newBooking.save();

    res.status(201).json({ 
      message: 'Pickup slot booked successfully!', 
      booking: newBooking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Failed to process booking', 
      error: error.message 
    });
  }
});

// Fetch all bookings (for tracking or admin dashboard)
router.get('/all', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve bookings', 
      error: error.message 
    });
  }
});

module.exports = router;