# Home | Kids Corner (Next.js + MongoDB)

A whimsical kids stationery marketplace with:

- Animated homepage, category, product, and supporting screens
- Phone OTP login (API-driven, ready for SMS provider integration)
- User profile management
- WhatsApp order enquiry from product page
- Client-side cart (add/update/remove) with WhatsApp cart checkout message
- User ticket creation + admin ticket table
- Admin product management (create/edit/delete, stock status, featured toggle)
- Admin category management (create categories with image + accent color)
- 10 starter stationery categories with seeded products
- Product search page with filters (name, category, stock, min/max price, sorting)

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- MongoDB (Mongoose)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Add your MongoDB and WhatsApp/admin values in `.env.local`.

4. Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## OTP Flow

- `POST /api/auth/request-otp` creates OTP and stores hash in MongoDB.
- `POST /api/auth/verify-otp` verifies OTP and creates session cookie.
- In development, OTP is returned in API response (`devOtp`) for testing.

For production SMS delivery, integrate a provider (Twilio/MSG91/etc.) in:

- `app/api/auth/request-otp/route.ts`

## Admin Access

Set admin allowlist in env:

- `ADMIN_PHONES` as comma-separated values (recommended)
- `ADMIN_PHONE` as single fallback

Only these numbers get admin role; all other logins remain normal users.

## Tickets + WhatsApp

- Tickets are always stored in MongoDB and visible in admin dashboard.
- Cart-origin tickets can carry linked product IDs so admin sees item context.
- After ticket creation, a WhatsApp draft message to your configured number is opened for free via `wa.me` (no paid API required).

## Free Hosting Recommendation

- Frontend/API: Vercel free tier
- Database: MongoDB Atlas free tier

Set all env vars in your hosting dashboard before deployment.

