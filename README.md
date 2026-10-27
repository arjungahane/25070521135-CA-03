# Bubble & Fresh

Bubble & Fresh is a laundry pickup booking app. The React/Vite client provides the public landing page, sign-in and registration, a customer dashboard, and a pickup booking form. The Express API uses MongoDB for users and bookings.

## Requirements

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB connection string

## Run locally

1. Configure MongoDB and the API:

   ```powershell
   Copy-Item server\.env.example server\.env
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Put the generated value in `server\.env` as `JWT_SECRET`. Set `MONGO_URI` if MongoDB is not available at the local default. Do not commit `server\.env`. The laundry API listens on port `5001` by default so it does not conflict with other local apps.

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

During local development, Vite proxies `/api` requests to `http://127.0.0.1:5001`. Set `VITE_API_URL` in the client environment when deploying the frontend separately from the API, and set `CLIENT_URL` in the server environment to the frontend origin for production.

## Authentication and account features

- Passwords are hashed with bcrypt on the server.
- Sessions use signed JWTs in `HttpOnly`, `SameSite=Lax` cookies. Set a unique secret of at least 32 characters in `JWT_SECRET`; production deployments also require HTTPS so cookies can use the `Secure` attribute.
- Signup, login, logout, and session lookup are available under `/api/auth`.
- Bookings require authentication and are returned only to their owner at `/api/bookings/mine`. The API validates booking details and calculates prices itself.
- Password reset email and Google sign-in are not enabled because this project does not have an email-delivery or OAuth provider configured. The password help page explains this rather than pretending to send a reset email.

Existing bookings created before account ownership was added do not have an associated user and therefore are not shown in customer dashboards.

## Deploy from GitHub

The GitHub repository stores the code; it does not run the API or database. A practical hosted setup is one Render web service for the frontend and API, with MongoDB Atlas as the database.

1. Create a MongoDB Atlas cluster. Add a database user, allow connections from Render (Atlas Network Access `0.0.0.0/0`, or Render's published outbound IPs on a paid plan), and copy the cluster connection string. Replace its password placeholder and include the database name `laundry_db`.
2. In Render, choose **New → Blueprint**, connect `arjungahane/25070521135-CA-03`, and deploy the repository's `render.yaml`.
3. When Render requests `MONGO_URI`, paste the Atlas connection string. Render generates `JWT_SECRET` automatically; leave it private.
4. Wait for the deployment health check to pass, then open the Render service URL. The Express service serves the built React app and `/api` from the same origin. Direct links and browser refresh work on application pages.
5. To publish later changes, push them to the connected GitHub branch; Render automatically builds and deploys the new commit.

The free Render service may sleep when idle and take a short time to wake up. MongoDB Atlas and Render may have separate free-tier limits. For a live production business, use paid hosting, restrict the Atlas network access list, and configure a domain and backup plan.
