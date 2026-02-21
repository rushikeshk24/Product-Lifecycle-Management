# Product Lifecycle Management (PLM)

Full-stack MERN application for managing product lifecycles: Design → Development → Testing → Released.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT
- **Frontend:** React (Vite), React Router
- **Auth:** JWT-based (Admin, Developer, Tester roles)

## Features

- **User authentication** – Register, login, role-based access (Admin, Developer, Tester)
- **Product management** – Create, update, view, delete (Admin/Developer)
- **Lifecycle stages** – Design → Development → Testing → Released
- **Version control** – Semver versions and history per product
- **Activity logs** – Track actions (login, product create/update/stage/version/delete); Admin can view all logs

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # Auth, products, activity logs
│   │   ├── middleware/   # Auth, roles, error handler, activity logger
│   │   ├── models/       # User, Product, ActivityLog
│   │   ├── routes/       # API routes + validation
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Layout, sidebar, header
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Login, Register, Dashboard, Products, etc.
│   │   ├── services/     # API client (axios)
│   │   ├── styles/       # Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, CLIENT_URL
npm install
npm run dev
```

Server runs at `http://localhost:5000`. Health: `GET /health`. API base: `/api`.

### Frontend

```bash
cd frontend
cp .env.example .env
# Optional: set VITE_API_URL if API is not at same origin (e.g. http://localhost:5000/api)
npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxy forwards `/api` to the backend when `VITE_API_URL` is not set.

### Production

- **Backend:** `NODE_ENV=production`, set `MONGODB_URI`, strong `JWT_SECRET`, `CLIENT_URL` to your frontend origin.
- **Frontend:** Set `VITE_API_URL` to your backend API URL, then `npm run build`. Serve the `dist/` folder (e.g. Nginx, Vercel).

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|--------------|
| POST   | /api/auth/register | No  | Register (name, email, password, role) |
| POST   | /api/auth/login    | No  | Login (email, password) |
| GET    | /api/auth/me       | Yes | Current user |
| GET    | /api/products      | Yes | List products (query: stage, search, page, limit) |
| GET    | /api/products/stages | No | Lifecycle stages list |
| GET    | /api/products/:id | Yes | Product by ID |
| POST   | /api/products     | Yes | Create (Admin/Developer) |
| PUT    | /api/products/:id | Yes | Update (Admin/Developer) |
| DELETE | /api/products/:id | Yes | Delete (Admin only) |
| GET    | /api/activity-logs | Yes | List logs (Admin, query: page, limit) |
| GET    | /api/activity-logs/entity/:id | Yes | Logs for one product |

## Roles

- **Admin:** Full access; delete products; view all activity logs.
- **Developer:** Create/update products; view products and own activity.
- **Tester:** View products only.

## License

MIT
