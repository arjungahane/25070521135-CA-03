import { useState } from 'react';
import axios from 'axios';
import './App.css';

const SERVICES = [
  { id: 'wash-fold', name: 'Wash & Fold', price: 40, unit: 'per kg', icon: '🧺' },
  { id: 'wash-iron', name: 'Wash & Iron', price: 60, unit: 'per kg', icon: '👔' },
  { id: 'dry-clean', name: 'Dry Cleaning', price: 120, unit: 'per piece', icon: '🧥' },
  { id: 'heavy-wash', name: 'Blanket / Heavy', price: 200, unit: 'per piece', icon: '🛌' }
];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

function App() {
  const [activeTab, setActiveTab] = useState('book');
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [quantity, setQuantity] = useState(3);
  const [isExpress, setIsExpress] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    pickupDate: new Date().toISOString().split('T')[0],
    timeSlot: TIME_SLOTS[0]
  });

  const [loading, setLoading] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [alert, setAlert] = useState(null);

  // Price calculations
  const basePrice = selectedService.price * quantity;
  const expressFee = isExpress ? 99 : 0;
  const deliveryFee = basePrice > 300 ? 0 : 40;
  const grandTotal = basePrice + expressFee + deliveryFee;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const payload = {
      ...formData,
      washType: selectedService.name,
      weightKg: quantity,
      totalPrice: grandTotal,
      isExpress
    };

    try {
      const res = await axios.post('http://localhost:5000/api/bookings/book', payload);
      setActiveBooking(res.data.booking);
      setAlert({ type: 'success', text: '🎉 Pickup slot booked successfully!' });
      setActiveTab('track');
    } catch (err) {
      console.warn('Backend unavailable, running fallback demo mode:', err);
      // Fallback demo state if backend server isn't running yet
      setActiveBooking({ ...payload, status: 'Booked', _id: 'DEMO-' + Math.floor(1000 + Math.random() * 9000) });
      setAlert({ type: 'success', text: '🎉 Pickup slot booked (Demo Mode)!' });
      setActiveTab('track');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="laundry-app">
      {/* Navbar Header */}
      <nav className="navbar">
        <div className="brand-logo">
          <span>🧼</span> Bubble & Fresh
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            Book Slot
          </button>
          <button 
            className={`nav-link ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            Track Order {activeBooking && '🟢'}
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="hero-banner">
        <h1>Clean Clothes, Zero Effort</h1>
        <p>Book a door-step laundry pickup slot in under 60 seconds.</p>
      </header>

      {/* Main App Container */}
      <main className="main-content">
        {alert && (
          <div style={{
            padding: '14px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: alert.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: alert.type === 'success' ? '#15803d' : '#b91c1c',
            fontWeight: '500'
          }}>
            {alert.text}
          </div>
        )}

        {activeTab === 'book' ? (
          <div className="booking-grid">
            {/* Form Column */}
            <div className="form-column">
              <div className="card-section">
                <h2 className="section-title">1. Select Laundry Service</h2>
                <div className="service-options">
                  {SERVICES.map((s) => (
                    <div
                      key={s.id}
                      className={`service-card ${selectedService.id === s.id ? 'active' : ''}`}
                      onClick={() => setSelectedService(s)}
                    >
                      <div className="service-icon">{s.icon}</div>
                      <div className="service-name">{s.name}</div>
                      <div className="service-price">₹{s.price} {s.unit}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-section">
                <h2 className="section-title">2. Customer & Pickup Slot</h2>
                <form id="booking-form" onSubmit={handleBookingSubmit}>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        name="customerName" 
                        placeholder="e.g. Rahul Sharma" 
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        placeholder="e.g. 9876543210" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Pickup & Delivery Address</label>
                    <textarea 
                      name="address" 
                      rows="2" 
                      placeholder="Flat/House No, Street, Landmark..." 
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Estimated Load (kg / Items)</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Pickup Date</label>
                      <input 
                        type="date" 
                        name="pickupDate" 
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required 
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Preferred Time Slot</label>
                    <div className="time-slots">
                      {TIME_SLOTS.map((slot) => (
                        <div
                          key={slot}
                          className={`slot-pill ${formData.timeSlot === slot ? 'selected' : ''}`}
                          onClick={() => setFormData({ ...formData, timeSlot: slot })}
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="express" 
                      checked={isExpress} 
                      onChange={(e) => setIsExpress(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="express" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                      ⚡ Same-Day Express Delivery (+₹99)
                    </label>
                  </div>
                </form>
              </div>
            </div>

            {/* Price Summary Column */}
            <div className="summary-column">
              <div className="summary-box">
                <h3 style={{ marginBottom: '16px' }}>Order Summary</h3>
                <div className="summary-line">
                  <span>Service</span>
                  <strong>{selectedService.name}</strong>
                </div>
                <div className="summary-line">
                  <span>Quantity / Load</span>
                  <strong>{quantity} units</strong>
                </div>
                <div className="summary-line">
                  <span>Base Rate</span>
                  <span>₹{basePrice}</span>
                </div>
                {isExpress && (
                  <div className="summary-line">
                    <span>Express Fee</span>
                    <span>₹99</span>
                  </div>
                )}
                <div className="summary-line">
                  <span>Delivery Charge</span>
                  <span>{deliveryFee === 0 ? <span style={{ color: 'green' }}>FREE</span> : `₹${deliveryFee}`}</span>
                </div>

                <div className="summary-total">
                  <span>Total Payable:</span>
                  <span>₹{grandTotal}</span>
                </div>

                <button 
                  type="submit" 
                  form="booking-form" 
                  className="btn-primary" 
                  disabled={loading}
                >
                  {loading ? 'Confirming Slot...' : 'Confirm Pickup Slot'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tracker Tab */
          <div className="card-section" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 className="section-title">📦 Active Order Status</h2>
            {activeBooking ? (
              <div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', marginBottom: '20px' }}>
                  <p><strong>Booking ID:</strong> #{activeBooking._id || 'ORD-101'}</p>
                  <p><strong>Customer:</strong> {activeBooking.customerName} ({activeBooking.phone})</p>
                  <p><strong>Service:</strong> {activeBooking.washType}</p>
                  <p><strong>Scheduled Slot:</strong> {activeBooking.pickupDate} ({activeBooking.timeSlot})</p>
                  <p><strong>Total:</strong> ₹{activeBooking.totalPrice}</p>
                </div>

                <div className="tracking-stepper">
                  <div className="step-item completed">
                    <div className="step-icon">✓</div>
                    <div className="step-label">Booked</div>
                  </div>
                  <div className="step-item active">
                    <div className="step-icon">🚚</div>
                    <div className="step-label">Pickup Assigned</div>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">🧺</div>
                    <div className="step-label">In Washing</div>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">✨</div>
                    <div className="step-label">Delivered</div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No active bookings found. Book a slot above to track progress!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;