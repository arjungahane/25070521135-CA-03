const express = require('express');
const Booking = require('../models/Booking');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const SERVICE_RATES = {
  'Wash & Fold': 40,
  'Wash & Iron': 60,
  'Dry Cleaning': 120,
  'Blanket / Heavy': 200
};
const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

router.post('/book', requireAuth, async (req, res) => {
  const {
    customerName,
    phone,
    address,
    washType,
    weightKg,
    pickupDate,
    timeSlot,
    isExpress = false
  } = req.body || {};
  const cleanName = typeof customerName === 'string' ? customerName.trim() : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
  const cleanAddress = typeof address === 'string' ? address.trim() : '';
  const quantity = Number(weightKg);
  const today = new Date().toISOString().slice(0, 10);
  const parsedPickupDate = typeof pickupDate === 'string'
    ? new Date(`${pickupDate}T00:00:00.000Z`)
    : null;

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ message: 'Enter a name between 2 and 100 characters.' });
  }
  if (!/^\+?[0-9\s()-]{7,20}$/.test(cleanPhone) || cleanPhone.replace(/\D/g, '').length < 7) {
    return res.status(400).json({ message: 'Enter a valid phone number.' });
  }
  if (cleanAddress.length < 8 || cleanAddress.length > 500) {
    return res.status(400).json({ message: 'Enter an address between 8 and 500 characters.' });
  }
  if (!Object.hasOwn(SERVICE_RATES, washType)) {
    return res.status(400).json({ message: 'Choose one of the available laundry services.' });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return res.status(400).json({ message: 'Quantity must be a whole number between 1 and 100.' });
  }
  if (typeof pickupDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)
      || Number.isNaN(parsedPickupDate?.getTime())
      || parsedPickupDate.toISOString().slice(0, 10) !== pickupDate || pickupDate < today) {
    return res.status(400).json({ message: 'Choose a valid pickup date that is not in the past.' });
  }
  if (!TIME_SLOTS.includes(timeSlot)) {
    return res.status(400).json({ message: 'Choose an available pickup time slot.' });
  }
  if (typeof isExpress !== 'boolean') {
    return res.status(400).json({ message: 'Express delivery selection is invalid.' });
  }

  try {
    const existingBookingsCount = await Booking.countDocuments({ pickupDate, timeSlot });
    if (existingBookingsCount >= 5) {
      return res.status(409).json({
        message: 'This time slot is fully booked. Please choose another date or time.'
      });
    }

    const basePrice = SERVICE_RATES[washType] * quantity;
    const totalPrice = basePrice + (isExpress ? 99 : 0) + (basePrice > 300 ? 0 : 40);
    const booking = await Booking.create({
      userId: req.userId,
      customerName: cleanName,
      phone: cleanPhone,
      address: cleanAddress,
      washType,
      weightKg: quantity,
      pickupDate,
      timeSlot,
      totalPrice,
      isExpress
    });

    return res.status(201).json({
      message: 'Your pickup slot is booked.',
      booking
    });
  } catch (error) {
    console.error('Booking failed:', error.message);
    return res.status(500).json({ message: 'We could not book this pickup. Please try again.' });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ bookings });
  } catch (error) {
    console.error('Booking lookup failed:', error.message);
    return res.status(500).json({ message: 'We could not load your bookings.' });
  }
});

module.exports = router;
