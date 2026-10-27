# Bubble & Fresh

Bubble & Fresh is a laundry pickup booking app. The React/Vite client provides the public landing page, sign-in and registration, a customer dashboard, and a pickup booking form. The Express API uses MongoDB for users and bookings.

## Requirements

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB connection string

## Run locally

1. Configure the API:

   ```powershell
   Copy-Item server\.env.example server\.env
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Put the generated value in `server\.env` as `JWT_SECRET`. Set `MONGO_URI` if MongoDB is not available at the local default. Do not commit `server\.env`.

2. Start the API in a terminal:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. Start the frontend in a second terminal:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

   Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The frontend API URL defaults to `http://localhost:5000/api`; set `VITE_API_URL` in the client environment to use a different API URL. Set `CLIENT_URL` in the server environment to the frontend origin when it differs from the local default.

## Authentication and account features

- Passwords are hashed with bcrypt on the server.
- Sessions use signed JWTs in `HttpOnly`, `SameSite=Lax` cookies. Set a unique secret of at least 32 characters in `JWT_SECRET`; production deployments also require HTTPS so cookies can use the `Secure` attribute.
- Signup, login, logout, and session lookup are available under `/api/auth`.
- Bookings require authentication and are returned only to their owner at `/api/bookings/mine`. The API validates booking details and calculates prices itself.
- Password reset email and Google sign-in are not enabled because this project does not have an email-delivery or OAuth provider configured. The password help page explains this rather than pretending to send a reset email.

Existing bookings created before account ownership was added do not have an associated user and therefore are not shown in customer dashboards.
