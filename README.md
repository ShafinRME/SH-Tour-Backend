# 🌍 SH-Tour — Server Side

> **"Explore Bangladesh, One Tour at a Time."**

This is the backend REST API for **SH-Tour** — a full-stack tour management platform. It handles authentication, tour management, booking, SSLCommerz payment processing, OTP verification, PDF invoice generation, admin analytics, and automated booking notifications.

🌐 **Live API:** [https://sh-tour-backend-production.up.railway.app](https://sh-tour-backend-production.up.railway.app)
🔗 **Frontend Repo:** [https://github.com/ShafinRME/SH-Tour-Frontend](https://github.com/ShafinRME/SH-Tour-Frontend)

---

## 🚀 Features

- JWT-based authentication with access & refresh token rotation
- Google OAuth 2.0 via Passport.js
- Role-based access control (User / Admin / Super Admin)
- OTP-based email verification using Redis
- Full tour & division CRUD with Cloudinary image uploads
- Booking management system
- SSLCommerz payment gateway integration
- PDF invoice generation and download
- Admin booking notification email on every successful payment
- Environment-aware email strategy (Gmail SMTP locally, Resend HTTP API in production)
- Admin analytics — bookings, payments, users, tours
- Secure environment variable management

---

## 🧰 Tech Stack

### Backend
| Technology | Link |
|---|---|
| Node.js | [nodejs.org](https://nodejs.org) |
| Express.js v5 | [expressjs.com](https://expressjs.com) |
| TypeScript | [typescriptlang.org](https://typescriptlang.org) |

### Database
| Technology | Link |
|---|---|
| MongoDB Atlas | [mongodb.com](https://www.mongodb.com) |
| Mongoose | [mongoosejs.com](https://mongoosejs.com) |
| Redis (Redis Cloud) | [redis.io](https://redis.io) |

### Others
| Technology | Link |
|---|---|
| Passport.js | [passportjs.org](https://passportjs.org) |
| Google OAuth 2.0 | [developers.google.com](https://developers.google.com) |
| Cloudinary | [cloudinary.com](https://cloudinary.com) |
| Nodemailer | [nodemailer.com](https://nodemailer.com) |
| Resend | [resend.com](https://resend.com) |
| SSLCommerz | [sslcommerz.com](https://sslcommerz.com) |
| PDFKit | [pdfkit.org](https://pdfkit.org) |
| Zod | [zod.dev](https://zod.dev) |
| Railway | [railway.app](https://railway.app) |

---

## 📡 API Endpoints

### Auth — `/api/v1/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Login with email & password |
| POST | `/refresh-token` | Public | Get new access token |
| POST | `/logout` | Public | Logout and clear cookies |
| POST | `/change-password` | Auth | Change current password |
| POST | `/set-password` | Auth | Set password for OAuth users |
| POST | `/forgot-password` | Public | Send password reset email |
| POST | `/reset-password` | Public | Reset password via token |
| GET | `/google` | Public | Initiate Google OAuth |
| GET | `/google/callback` | Public | Google OAuth callback |

### Users — `/api/v1/user`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| GET | `/all-users` | Admin | Get all users |
| GET | `/me` | Auth | Get current user profile |
| GET | `/:id` | Admin | Get single user |
| PATCH | `/:id` | Auth | Update user profile |

### Divisions — `/api/v1/division`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/create` | Admin | Create a new division |
| GET | `/` | Public | Get all divisions |
| GET | `/:slug` | Public | Get single division |
| PATCH | `/:id` | Admin | Update division |
| DELETE | `/:id` | Admin | Delete division |

### Tours — `/api/v1/tour`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/tour-types` | Public | Get all tour types |
| POST | `/create-tour-type` | Admin | Create tour type |
| GET | `/tour-types/:id` | Public | Get single tour type |
| PATCH | `/tour-types/:id` | Admin | Update tour type |
| DELETE | `/tour-types/:id` | Admin | Delete tour type |
| GET | `/` | Public | Get all tours |
| POST | `/create` | Admin | Create a tour |
| GET | `/:slug` | Public | Get single tour |
| PATCH | `/:id` | Admin | Update tour |
| DELETE | `/:id` | Admin | Delete tour |

### Bookings — `/api/v1/booking`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Auth | Create a booking |
| GET | `/` | Admin | Get all bookings |
| GET | `/my-bookings` | Auth | Get user's bookings |
| GET | `/:bookingId` | Auth | Get single booking |
| PATCH | `/:bookingId/status` | Auth | Update booking status |

### Payments — `/api/v1/payment`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/init-payment/:bookingId` | Public | Initialize SSLCommerz payment |
| POST | `/success` | Public | Handle payment success |
| POST | `/fail` | Public | Handle payment failure |
| POST | `/cancel` | Public | Handle payment cancellation |
| POST | `/validate-payment` | Public | Validate IPN payment |
| GET | `/invoice/:paymentId` | Auth | Download payment invoice PDF |

### OTP — `/api/v1/otp`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/send` | Public | Send OTP to email |
| POST | `/verify` | Public | Verify OTP |

### Stats — `/api/v1/stats`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/booking` | Admin | Get booking statistics |
| GET | `/payment` | Admin | Get payment statistics |
| GET | `/user` | Admin | Get user statistics |
| GET | `/tour` | Admin | Get tour statistics |

---

## ⚙️ Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/ShafinRME/SH-Tour-Backend.git
cd SH-Tour-Backend
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

Create a `.env` file in the root directory:
```env
DB_URL=your_mongodb_connection_string
PORT=5000
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d

# BCRYPT
BCRYPT_SALT_ROUND=10

# SSLCommerz
SSL_STORE_ID=your_ssl_store_id
SSL_STORE_PASS=your_ssl_store_pass
SSL_PAYMENT_API=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_API=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
SSL_IPN_URL=http://localhost:5000/api/v1/payment/validate-payment
SSL_SUCCESS_BACKEND_URL=http://localhost:5000/api/v1/payment/success
SSL_FAIL_BACKEND_URL=http://localhost:5000/api/v1/payment/fail
SSL_CANCEL_BACKEND_URL=http://localhost:5000/api/v1/payment/cancel
SSL_SUCCESS_FRONTEND_URL=http://localhost:3000/payment/success
SSL_FAIL_FRONTEND_URL=http://localhost:3000/payment/fail
SSL_CANCEL_FRONTEND_URL=http://localhost:3000/payment/cancel

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail SMTP — used in development only)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your_gmail_address

# Resend (used in production — not required locally)
RESEND_API_KEY=your_resend_api_key

# Admin notification
ADMIN_NOTIFICATION_EMAIL=your_admin_email

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password

# Express Session
EXPRESS_SESSION_SECRET=your_session_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Super Admin
SUPER_ADMIN_EMAIL=your_super_admin_email
SUPER_ADMIN_PASSWORD=your_super_admin_password
```

### 4. Start the development server
```bash
npm run dev
```

The server will run at `http://localhost:5000`

---

## 📧 Email Strategy

This project uses an environment-aware dual email strategy to handle Railway's SMTP port restrictions in production:

| Environment | Provider | Method |
|---|---|---|
| `development` | Gmail SMTP | Nodemailer via port 587 |
| `production` | Resend | HTTP API (bypasses Railway SMTP block) |

**Emails sent:**
- OTP verification email (on OTP request)
- Password reset email (on forgot password)
- Invoice email with PDF attachment (on successful payment) — local only
- Admin booking notification (on every successful payment) — both environments

---

## 🔮 Future Improvements

- Extended user dashboard with booking analytics
- Tour editing and deletion from admin panel
- Guide role with dedicated dashboard
- Stripe payment gateway integration
- Integration with Bangladeshi payment gateways (bKash, Nagad)
- Push notifications for booking status updates
- Custom domain email for production (full user invoice delivery)

---

## 🧩 Problems Solved

- Secure SSLCommerz international payment gateway integration with IPN validation
- OTP-based user verification using Redis with automatic expiry
- Cross-domain cookie handling for production with `secure` and `sameSite` flags
- Google OAuth 2.0 cross-domain authentication with token redirect strategy
- PDF invoice generation and instant download after successful payment
- JWT access & refresh token rotation with blacklist-free stateless auth
- Multer + Cloudinary integration for multiple image uploads per tour
- Super Admin auto-seeding on server startup
- Railway SMTP block bypassed using Resend HTTP API in production
- Environment-aware email switching — Gmail locally, Resend in production with zero config change

---

## 👨‍💻 Author

**Md. Shafin Ahmed**
- GitHub: [@ShafinRME](https://github.com/ShafinRME)
- Live Project: [https://sh-tour-frontend.vercel.app](https://sh-tour-frontend.vercel.app)
