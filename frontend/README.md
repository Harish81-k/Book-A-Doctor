# MediBook - Healthcare Appointment Booking Platform

A modern, responsive, production-ready healthcare appointment booking web application built with React, Tailwind CSS, Express, and MongoDB.

## Features

### Patient
- Register/Login with role-based access
- Browse and search verified doctors
- Filter by specialization, experience, fee, rating
- Book appointments with time slot selection
- Manage appointments (view, cancel)
- Upload and download medical reports
- Complete payment
**Doctors Page** (Fetching successfully via backend REST API)
![Doctors Page Preview](C:\Users\haris\.gemini\antigravity-ide\brain\05098a3a-6777-4588-93c8-01878356fce6\doctors_page_1783515451210.png)

**Successful Appointment Booking Flow**
After fixing some minor ID mappings (from `id` to `_id`) required by MongoDB, the entire flow—from registering a patient to picking a time slot and successfully booking a doctor—is functioning smoothly. Here is a preview of the dashboard populated with the newly created appointment record fetched strictly from the MongoDB backend:
![Dashboard Pending Appointment](C:\Users\haris\.gemini\antigravity-ide\brain\05098a3a-6777-4588-93c8-01878356fce6\dashboard_appointment_list_1783516773201.png)

**Login Page**
![Login Page Preview](C:\Users\haris\.gemini\antigravity-ide\brain\05098a3a-6777-4588-93c8-01878356fce6\login_page_1783515462635.png)
- Complete payments for bookings
- Real-time chat with doctors
- Leave reviews and ratings
- Receive notifications

### Doctor
- Register and get verified by admin
- Manage appointments (approve, reject, complete)
- View patient list and history
- Update profile with specialization, fee, bio
- View earnings dashboard
- Receive patient reviews
- Chat with patients

### Admin
- Complete platform overview with analytics
- Manage users (block, unblock, delete)
- Verify/revoke doctor verification
- Manage appointments
- Manage specializations
- View all reviews

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Lucide React, Framer Motion, React Hot Toast
- **Backend**: Express, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: Local file uploads with Multer

## Database Schema (MongoDB Collections)

- `users` - User accounts (Patients, Doctors, Admins)
- `profiles` - Extended profiles (mostly embedded or linked via users)
- `specializations` - Medical specializations
- `doctorprofiles` - Doctor-specific details
- `timeslots` - Doctor availability
- `appointments` - Bookings
- `reviews` - Doctor ratings
- `medicalreports` - Patient uploads
- `notifications` - System notifications
- `messages` - Chat messages
- `payments` - Payment records

## Setup

1. Install dependencies for both frontend and backend:
```bash
# In frontend directory
npm install

# In backend directory
npm install
```

2. Set up environment variables:
   - **Frontend** (`frontend/.env`):
     ```
     VITE_API_URL=http://localhost:5000/api
     ```
   - **Backend** (`backend/.env`):
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/book-a-doctor
     JWT_SECRET=supersecretjwtkey_replace_in_production
     NODE_ENV=development
     ```

3. Ensure MongoDB is running locally on port 27017 or update `MONGODB_URI` accordingly.

4. Start the backend server:
```bash
cd backend
npm run dev
```

5. Start the frontend dev server:
```bash
cd frontend
npm run dev
```

## Usage

### For Patients
1. Register as a patient
2. Browse doctors at `/doctors`
3. Click "Book Now" on a doctor profile
4. Select date and time slot
5. Complete payment
6. Manage appointments and chat in the dashboard

### For Doctors
1. Register as a doctor
2. Wait for admin verification
3. Update your profile in the dashboard
4. Manage appointments and patients

### For Admin
1. Access `/admin` after logging in as admin
2. Verify pending doctors
3. Manage users and platform data

## Project Structure

```
backend/
  controllers/
  models/
  routes/
  middleware/
  config/
  uploads/
  server.js

frontend/
  src/
    components/
      Navbar.jsx
      Footer.jsx
    context/
      AuthContext.jsx
    lib/
      api.js
      utils.js
    pages/
      HomePage.jsx
      DoctorsPage.jsx
      DoctorDetailPage.jsx
      LoginPage.jsx
      RegisterPage.jsx
      AboutPage.jsx
      ContactPage.jsx
      ChatPage.jsx
      NotFoundPage.jsx
      patient/
        PatientDashboard.jsx
      doctor/
        DoctorDashboard.jsx
      admin/
        AdminDashboard.jsx
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Other Entities
- Standard RESTful routes (GET, POST, PUT, DELETE) available under:
  - `/api/doctors`
  - `/api/patients`
  - `/api/appointments`
  - `/api/admin`
  - `/api/reviews`
  - `/api/payments`
  - `/api/notifications`
  - `/api/messages`
  - `/api/medical-reports`
  - `/api/specializations`

## Security

- JWT authentication with Bearer tokens
- Password hashing (bcrypt)
- Protected routes using Express Middleware
- Role-based authorization controls

## Deployment

The project is ready for deployment:
- **Frontend**: Vite build (`npm run build`) ready for any static host (Vercel, Netlify).
- **Backend**: Node/Express server ready for deployment (Render, Heroku, AWS).
- **Database**: Cloud MongoDB (MongoDB Atlas).

## License

MIT
