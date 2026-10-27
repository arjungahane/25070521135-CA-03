import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import './App.css';

const SERVICES = [
  { id: 'wash-fold', name: 'Wash & Fold', rate: 40, unit: 'per kg', mark: 'W' },
  { id: 'wash-iron', name: 'Wash & Iron', rate: 60, unit: 'per kg', mark: 'I' },
  { id: 'dry-clean', name: 'Dry Cleaning', rate: 120, unit: 'per item', mark: 'D' },
  { id: 'heavy-wash', name: 'Blanket / Heavy', rate: 200, unit: 'per item', mark: 'H' }
];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(value || 0);

function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response) return 'Something went wrong. Please try again.';
  return 'We could not reach the laundry service. Check your connection and try again.';
}

function formatDate(value) {
  if (!value) return 'Not scheduled';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/terms" element={<PolicyPage type="terms" />} />
      <Route path="/privacy" element={<PolicyPage type="privacy" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/book" element={<BookingPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function ProtectedRoute() {
  const { user, loading, authError } = useAuth();
  if (loading) return <LoadingScreen label="Checking your account" />;
  if (!user && authError) {
    return <main className="not-found"><Brand /><p className="form-message form-error" role="alert">{authError}</p><Link className="button button-primary" to="/login">Go to sign in</Link></main>;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen label="Checking your account" />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function Brand({ light = false }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''}`} to="/" aria-label="Bubble & Fresh home">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>Bubble <b>&</b> Fresh</span>
    </Link>
  );
}

function PublicHeader() {
  const { user } = useAuth();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="header-actions" aria-label="Main navigation">
          <a className="header-text-link" href="#how-it-works">How it works</a>
          {user
            ? <Link className="button button-primary button-small" to="/dashboard">My account</Link>
            : <>
              <Link className="header-text-link" to="/login">Sign in</Link>
              <Link className="button button-primary button-small" to="/signup">Get started</Link>
            </>}
        </nav>
      </div>
    </header>
  );
}

function LandingPage() {
  return (
    <div className="marketing-page">
      <PublicHeader />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> Laundry day, made lighter</span>
            <h1>Fresh clothes.<br /><span>More free time.</span></h1>
            <p>Reliable laundry care, picked up from your doorstep and returned ready to wear. Book a collection in a few simple steps.</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/signup">Book your first pickup <span aria-hidden="true">-&gt;</span></Link>
              <a className="button button-quiet" href="#how-it-works">See how it works</a>
            </div>
            <div className="hero-proof">
              <span className="proof-mark" aria-hidden="true">B</span>
              <span><strong>Care that fits your routine</strong><small>Choose a service, day and time that work for you.</small></span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Laundry pickup and delivery service illustration">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-window">
              <div className="visual-window-top"><span>YOUR LAUNDRY, HANDLED</span><span className="window-dots">•••</span></div>
              <div className="laundry-stack">
                <div className="folded-cloth cloth-blue" />
                <div className="folded-cloth cloth-white" />
                <div className="folded-cloth cloth-green" />
              </div>
              <div className="visual-delivery">
                <span className="delivery-icon" aria-hidden="true">B</span>
                <span><strong>Pickup, your way</strong><small>Choose a time that suits you</small></span>
                <span className="delivery-arrow" aria-hidden="true">-&gt;</span>
              </div>
            </div>
            <div className="floating-note"><span className="note-spark" aria-hidden="true">+</span><span><strong>Simple pricing</strong><small>See your total before you book</small></span></div>
          </div>
        </section>

        <section className="benefit-strip" aria-label="Service benefits">
          <div><span className="benefit-number">01</span><span><strong>Pickup on your schedule</strong><small>Choose a convenient time slot</small></span></div>
          <div><span className="benefit-number">02</span><span><strong>Care for every load</strong><small>From everyday wear to heavy items</small></span></div>
          <div><span className="benefit-number">03</span><span><strong>Know what you pay</strong><small>Clear pricing before confirmation</small></span></div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">A little more time for you</span>
            <h2>Clean laundry, in three easy steps.</h2>
            <p>From booking to doorstep delivery, we keep the process refreshingly simple.</p>
          </div>
          <div className="steps-grid">
            <article className="step-card"><span className="step-index">01</span><h3>Choose your care</h3><p>Select wash and fold, wash and iron, dry cleaning, or heavy-item care.</p></article>
            <article className="step-card"><span className="step-index">02</span><h3>Pick a time</h3><p>Tell us where and when to collect your laundry. Same-day service is available.</p></article>
            <article className="step-card"><span className="step-index">03</span><h3>Get back to your day</h3><p>Follow your booking from your account while we take care of the rest.</p></article>
          </div>
          <div className="bottom-cta"><div><h2>Ready to make laundry easier?</h2><p>Create an account and choose your first pickup slot.</p></div><Link className="button button-light" to="/signup">Get started <span aria-hidden="true">-&gt;</span></Link></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth-page">
      <div className="auth-brand"><Brand /></div>
      <div className="auth-layout">
        <section className="auth-panel">
          <Link className="back-link" to="/"> <span aria-hidden="true">&lt;-</span> Back to home</Link>
          <div className="auth-heading"><span className="eyebrow">BUBBLE & FRESH ACCOUNT</span><h1>{title}</h1><p>{subtitle}</p></div>
          {children}
          <div className="auth-footer">{footer}</div>
        </section>
        <aside className="auth-aside">
          <div className="aside-glow" />
          <div className="aside-content">
            <span className="aside-label">A little more room in your day</span>
            <h2>We take laundry off your list.</h2>
            <p>Book a pickup when it works for you, choose the care your clothes need, and keep every order in one place.</p>
            <div className="aside-list">
              <span><i aria-hidden="true">01</i> Book a pickup in a few steps</span>
              <span><i aria-hidden="true">02</i> See your order history</span>
              <span><i aria-hidden="true">03</i> Check your pickup details</span>
            </div>
            <div className="aside-card"><span className="aside-card-mark">BF</span><span><strong>Good care, right on time.</strong><small>Bubble & Fresh Laundry Service</small></span></div>
          </div>
        </aside>
      </div>
      <p className="auth-legal">By continuing, you agree to use Bubble & Fresh responsibly.</p>
    </main>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your laundry and bookings." footer={<>New to Bubble & Fresh? <Link to="/signup">Create an account</Link></>}>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-message form-error" role="alert">{error}</div>}
        <div className="field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required /></div>
        <div className="field"><div className="field-label-row"><label htmlFor="login-password">Password</label><Link to="/forgot-password">Forgot password?</Link></div><div className="password-input"><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></div>
        <label className="check-label"><input type="checkbox" checked={values.rememberMe} onChange={(event) => setValues({ ...values, rememberMe: event.target.checked })} /><span>Keep me signed in</span></label>
        <button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Signing in...</> : 'Sign in'}</button>
      </form>
    </AuthLayout>
  );
}

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const strength = [
    values.password.length >= 8,
    /[a-z]/.test(values.password),
    /[A-Z]/.test(values.password),
    /\d/.test(values.password)
  ].filter(Boolean).length;
  const strengthLabel = ['Add a password', 'Getting started', 'Fair', 'Good', 'Strong'][strength];

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (values.password !== values.confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    if (strength < 4) {
      setError('Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    if (!values.terms) {
      setError('Please confirm that you agree to the terms to continue.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password
      });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Your laundry routine just got a little easier." footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
      <form className="auth-form signup-form" onSubmit={handleSubmit}>
        {error && <div className="form-message form-error" role="alert">{error}</div>}
        <div className="field"><label htmlFor="signup-name">Full name</label><input id="signup-name" type="text" autoComplete="name" placeholder="Your name" minLength="2" maxLength="100" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required /></div>
        <div className="field"><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" maxLength="254" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required /></div>
        <div className="field"><label htmlFor="signup-phone">Phone number <span className="optional-label">Optional</span></label><input id="signup-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} /></div>
        <div className="field"><label htmlFor="signup-password">Password</label><div className="password-input"><input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a strong password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} minLength="8" required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div><div className="strength-row" aria-live="polite"><div className="strength-bars">{[1, 2, 3, 4].map((step) => <i key={step} className={strength >= step ? `strength-${strength}` : ''} />)}</div><span>{strengthLabel}</span></div><small className="field-hint">Use 8+ characters, including an uppercase letter and a number.</small></div>
        <div className="field"><label htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Enter your password again" value={values.confirmPassword} onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })} required /></div>
        <div className="terms-consent"><label className="check-label terms-label" htmlFor="signup-terms"><input id="signup-terms" type="checkbox" checked={values.terms} onChange={(event) => setValues({ ...values, terms: event.target.checked })} /><span>I agree to the service terms.</span></label><p>Read the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Notice</Link>.</p></div>
        <button className="button button-primary button-wide" type="submit" disabled={loading || !values.terms}>{loading ? <><span className="spinner" /> Creating account...</> : 'Create account'}</button>
      </form>
    </AuthLayout>
  );
}

function ForgotPasswordPage() {
  return (
    <AuthLayout title="Password help" subtitle="We want to help you get back into your account." footer={<>Remembered your password? <Link to="/login">Sign in</Link></>}>
      <div className="form-message form-info" role="status">Password reset emails are not configured for this service yet. Please contact your laundry service administrator to regain access.</div>
      <Link className="button button-primary button-wide auth-info-button" to="/login">Return to sign in</Link>
    </AuthLayout>
  );
}

function PolicyPage({ type }) {
  const isPrivacy = type === 'privacy';
  return (
    <main className="policy-page">
      <div className="policy-header"><Brand /><Link className="back-link" to="/signup">Back to account creation</Link></div>
      <article className="policy-content">
        <span className="eyebrow">BUBBLE & FRESH</span>
        <h1>{isPrivacy ? 'Privacy notice' : 'Terms of service'}</h1>
        <p className="policy-intro">{isPrivacy ? 'A clear overview of the information used to manage your account and pickup bookings.' : 'A few straightforward guidelines for using the Bubble & Fresh booking service.'}</p>
        {isPrivacy ? <>
          <h2>Information used by the service</h2>
          <p>When you create an account, the service stores your name, email address, and optional phone number. A booking also stores its pickup address, selected service, quantity, pickup date and time, express selection, status, and price.</p>
          <h2>How it is used</h2>
          <p>This information is used to sign you in, show your own booking history, and arrange the pickup details you submit. Passwords are stored as salted hashes, and sign-in sessions use an HttpOnly cookie.</p>
          <h2>Account access</h2>
          <p>The application restricts booking history to the signed-in account that created it. For questions about an account or its stored information, contact the laundry service administrator.</p>
        </> : <>
          <h2>Using your account</h2>
          <p>Provide accurate contact and pickup details, and keep your sign-in credentials private. Your account is for managing your own laundry bookings.</p>
          <h2>Pickup requests and prices</h2>
          <p>Choose an available service, pickup date, and time slot. A booking is accepted only when the service confirms it. Prices shown in the booking summary are calculated from the selected service, quantity, and options.</p>
          <h2>Service availability</h2>
          <p>Pickup capacity is limited by date and time slot. If a slot is full, select another available time. Password reset email and third-party sign-in are not currently provided.</p>
        </>}
        <p className="policy-footnote">For help with an account or booking, contact the laundry service administrator.</p>
        <Link className="button button-primary" to="/signup">Back to sign up</Link>
      </article>
      <SiteFooter />
    </main>
  );
}

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('Could not contact the server to end your session. Please try again.');
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Brand />
          <nav className="app-nav" aria-label="Account navigation">
            <NavLink to="/dashboard" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>Overview</NavLink>
            <NavLink to="/book" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>Book a pickup</NavLink>
          </nav>
          <div className="account-actions"><span className="user-avatar" aria-hidden="true">{user?.name?.slice(0, 1).toUpperCase()}</span><span className="account-name">{user?.name}</span><button className="signout-button" onClick={handleLogout}>Sign out</button></div>
        </div>
      </header>
      {logoutError && <div className="global-error" role="alert">{logoutError}</div>}
      <main className="app-main"><Outlet /></main>
      <SiteFooter />
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/bookings/mine')
      .then(({ data }) => {
        if (active) setBookings(data.bookings);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const upcoming = useMemo(() => bookings
    .filter((booking) => booking.pickupDate >= new Date().toISOString().slice(0, 10) && booking.status !== 'Delivered')
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))[0], [bookings]);
  const totalSpent = bookings.reduce((total, booking) => total + booking.totalPrice, 0);
  const activeOrders = bookings.filter((booking) => booking.status !== 'Delivered').length;
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading"><div><span className="eyebrow">YOUR LAUNDRY SPACE</span><h1>Good to see you, {firstName}.</h1><p>Here is what is happening with your laundry.</p></div><Link className="button button-primary" to="/book">Book a pickup <span aria-hidden="true">-&gt;</span></Link></div>
      {error && <div className="form-message form-error" role="alert">{error}</div>}
      <section className="stats-grid" aria-label="Booking overview">
        <article className="stat-card"><span className="stat-label">Total bookings</span><strong>{loading ? '--' : bookings.length}</strong><small>All your pickups</small></article>
        <article className="stat-card"><span className="stat-label">In progress</span><strong>{loading ? '--' : activeOrders}</strong><small>Not yet delivered</small></article>
        <article className="stat-card"><span className="stat-label">Total spent</span><strong>{loading ? '--' : formatMoney(totalSpent)}</strong><small>Across your bookings</small></article>
      </section>
      <section className="dashboard-grid">
        <div className="content-card next-pickup-card">
          <div className="card-heading"><div><span className="eyebrow">UP NEXT</span><h2>Your next pickup</h2></div><span className="card-index">01</span></div>
          {loading ? <LoadingScreen label="Loading your pickups" compact /> : upcoming ? <div className="next-pickup-details"><div className="pickup-date-block"><strong>{new Date(`${upcoming.pickupDate}T00:00:00`).getDate()}</strong><span>{new Date(`${upcoming.pickupDate}T00:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span></div><div className="pickup-info"><strong>{upcoming.washType}</strong><span>{upcoming.timeSlot}</span><small>{formatDate(upcoming.pickupDate)} · {upcoming.weightKg} {upcoming.weightKg === 1 ? 'unit' : 'units'}</small></div><StatusBadge status={upcoming.status} /></div> : <div className="empty-state"><span className="empty-mark">B</span><h3>No pickups booked yet</h3><p>Your next laundry day can be on your schedule.</p><Link className="text-link" to="/book">Choose a pickup time <span aria-hidden="true">-&gt;</span></Link></div>}
        </div>
        <div className="content-card routine-card">
          <span className="eyebrow">A SIMPLE ROUTINE</span><h2>Less laundry to think about.</h2><p>Set up a pickup when you need one. Your bookings and order details stay together here.</p><Link className="button button-outline" to="/book">Schedule a pickup</Link><div className="routine-decoration" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </section>
      <section className="content-card orders-card">
        <div className="card-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h2>Recent bookings</h2></div><span className="card-caption">{bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}</span></div>
        {loading ? <LoadingScreen label="Loading your booking history" compact /> : error ? <p className="empty-copy">Your booking history could not be loaded.</p> : bookings.length ? <div className="booking-list">{bookings.slice(0, 5).map((booking) => <article className="booking-row" key={booking._id}><span className="booking-mark">{booking.washType?.slice(0, 1) || 'B'}</span><span className="booking-service"><strong>{booking.washType}</strong><small>{formatDate(booking.pickupDate)} · {booking.timeSlot}</small></span><span className="booking-price">{formatMoney(booking.totalPrice)}</span><StatusBadge status={booking.status} /></article>)}</div> : <p className="empty-copy">Your completed and upcoming bookings will appear here.</p>}
      </section>
    </div>
  );
}

function BookingPage() {
  const { user } = useAuth();
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [quantity, setQuantity] = useState(3);
  const [isExpress, setIsExpress] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [values, setValues] = useState({ customerName: user?.name || '', phone: user?.phone || '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const service = SERVICES.find((item) => item.id === serviceId) || SERVICES[0];
  const basePrice = service.rate * quantity;
  const deliveryFee = basePrice > 300 ? 0 : 40;
  const totalPrice = basePrice + (isExpress ? 99 : 0) + deliveryFee;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/bookings/book', {
        ...values,
        washType: service.name,
        weightKg: quantity,
        pickupDate: date,
        timeSlot,
        isExpress
      });
      setConfirmation(data.booking);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  if (confirmation) {
    return (
      <section className="confirmation-card">
        <span className="confirmation-mark" aria-hidden="true">BF</span>
        <span className="eyebrow">PICKUP CONFIRMED</span>
        <h1>Your laundry is on our list.</h1>
        <p>Booking <strong>#{confirmation._id}</strong> is set for {formatDate(confirmation.pickupDate)}.</p>
        <div className="confirmation-summary"><span>{confirmation.washType} · {confirmation.weightKg} {confirmation.weightKg === 1 ? 'unit' : 'units'}</span><strong>{formatMoney(confirmation.totalPrice)}</strong></div>
        <div className="confirmation-actions"><Link className="button button-primary" to="/dashboard">View your dashboard</Link><button className="button button-outline" onClick={() => setConfirmation(null)}>Book another pickup</button></div>
      </section>
    );
  }

  return (
    <div className="booking-page">
      <div className="page-heading"><span className="eyebrow">BOOK A PICKUP</span><h1>Let's take laundry off your list.</h1><p>Choose your service and pickup details. You will see the full price before confirming.</p></div>
      <div className="booking-layout">
        <form id="booking-form" className="booking-form" onSubmit={handleSubmit}>
          {error && <div className="form-message form-error" role="alert">{error}</div>}
          <section className="content-card form-section"><div className="section-number">01</div><div className="form-section-content"><h2>Choose your care</h2><p>Select the service that fits your load.</p><div className="service-grid">{SERVICES.map((item) => <button key={item.id} type="button" className={`service-option ${serviceId === item.id ? 'selected' : ''}`} aria-pressed={serviceId === item.id} onClick={() => setServiceId(item.id)}><span className="service-mark">{item.mark}</span><span className="service-option-copy"><strong>{item.name}</strong><small>{item.unit}</small></span><span className="service-option-price">{formatMoney(item.rate)}</span></button>)}</div></div></section>
          <section className="content-card form-section"><div className="section-number">02</div><div className="form-section-content"><h2>Pickup details</h2><p>Where should we collect your laundry?</p><div className="field-grid"><div className="field"><label htmlFor="booking-name">Full name</label><input id="booking-name" type="text" autoComplete="name" value={values.customerName} onChange={(event) => setValues({ ...values, customerName: event.target.value })} minLength="2" maxLength="100" required /></div><div className="field"><label htmlFor="booking-phone">Phone number</label><input id="booking-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} required /></div></div><div className="field"><label htmlFor="booking-address">Pickup address</label><textarea id="booking-address" autoComplete="street-address" rows="3" placeholder="House number, street, area and landmark" value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} minLength="8" maxLength="500" required /></div><div className="field-grid"><div className="field"><label htmlFor="booking-quantity">Quantity <span className="optional-label">kg or items</span></label><input id="booking-quantity" type="number" min="1" max="100" step="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} required /></div><div className="field"><label htmlFor="booking-date">Pickup date</label><input id="booking-date" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} required /></div></div><fieldset className="slot-fieldset"><legend>Choose a time slot</legend><div className="slot-grid">{TIME_SLOTS.map((slot) => <button key={slot} type="button" className={`slot-option ${timeSlot === slot ? 'selected' : ''}`} aria-pressed={timeSlot === slot} onClick={() => setTimeSlot(slot)}>{slot}</button>)}</div></fieldset><label className="express-option"><input type="checkbox" checked={isExpress} onChange={(event) => setIsExpress(event.target.checked)} /><span><strong>Same-day express</strong><small>Request faster service for an extra {formatMoney(99)}.</small></span></label></div></section>
        </form>
        <aside className="order-summary"><span className="eyebrow">YOUR ORDER</span><h2>Pickup summary</h2><div className="summary-service"><span className="service-mark">{service.mark}</span><span><strong>{service.name}</strong><small>{quantity} {service.unit.includes('kg') ? 'kg' : quantity === 1 ? 'item' : 'items'}</small></span></div><div className="summary-line"><span>Service</span><span>{formatMoney(basePrice)}</span></div>{isExpress && <div className="summary-line"><span>Express service</span><span>{formatMoney(99)}</span></div>}<div className="summary-line"><span>Pickup & delivery</span><span>{deliveryFee ? formatMoney(deliveryFee) : 'Complimentary'}</span></div><div className="summary-total"><span>Estimated total</span><strong>{formatMoney(totalPrice)}</strong></div><p className="summary-note">Includes service, pickup and delivery, and any selected express fee.</p><button className="button button-primary button-wide" type="submit" form="booking-form" disabled={loading}>{loading ? <><span className="spinner" /> Confirming...</> : 'Confirm pickup'}</button></aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${(status || 'booked').toLowerCase().replace(/\s+/g, '-')}`}>{status || 'Booked'}</span>;
}

function LoadingScreen({ label, compact = false }) {
  return <div className={`loading-state ${compact ? 'loading-compact' : ''}`} role="status"><span className="spinner" /><span>{label}</span></div>;
}

function NotFoundPage() {
  return <main className="not-found"><Brand /><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This page is out of the laundry basket.</h1><p>The page may have moved, or the address might be mistyped.</p><Link className="button button-primary" to="/">Back to home</Link></main>;
}

function SiteFooter() {
  return <footer className="site-footer"><Brand /><span>Thoughtful laundry care, made simple.</span><small>© {new Date().getFullYear()} Bubble & Fresh</small></footer>;
}

export default App;
