# Internship Tracking

A full-stack internship application tracker with user accounts. Users can sign up, log in, and manage (create/edit/delete) their own internship applications. Data is protected so each user only sees their own internships.

## Features

- **Authentication (JWT)**
  - Sign up + log in
  - Token stored in browser `localStorage`
- **Secure per-user data**
  - All `/internships` routes require `Authorization: Bearer <token>`
  - Internships are associated with the authenticated user and are not shared across accounts
- **Internship tracking**
  - Add internships (company, role, status, link, notes)
  - Edit and delete internships
  - Search by company/role + filter by status

## Tech Stack

- **Frontend:** React + React Router
- **Backend:** Node.js + Express
- **Database:** SQLite

## Project Structure

- `frontend/` — React app
- `backend/` — Express API + SQLite database

## Setup

### 1) Install dependencies

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd ../frontend
npm install
```

### 2) Backend environment variables

Create a file: `backend/.env`

Example:
```env
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
PORT=5000
DB_FILE=data.db
```

> Note: `backend/.env` is ignored by git (not committed).

To generate a strong secret (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Run the App (Development)

### 1) Start backend
```bash
cd backend
npm run dev
```

Backend runs on:
- `http://localhost:5000`

### 2) Start frontend
In a second terminal:
```bash
cd frontend
npm run dev
```

Frontend will print a local dev URL (commonly `http://localhost:5173`).

## API Authentication Notes

All internships endpoints require a JWT:

- Header:
  - `Authorization: Bearer <token>`

If you call the endpoint without a token, it returns:
- `401 Unauthorized`

## Common Troubleshooting

### Port 5000 already in use (EADDRINUSE)
If backend says port 5000 is already in use, kill the process using it:

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Then restart:
```powershell
cd backend
npm run dev
```

## License

For educational use.
