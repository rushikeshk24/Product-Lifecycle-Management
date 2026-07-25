# 🚀 Product Lifecycle Management (PLM)

A modern, full-stack **MERN (MongoDB, Express.js, React, Node.js)** application designed to manage the complete product lifecycle—from product creation and design to development, testing, and release. The platform provides **secure authentication, role-based access control, product version management, lifecycle tracking, and comprehensive activity logging**, enabling teams to collaborate efficiently while maintaining complete traceability across every stage of product development.

🌐 **Live Demo:**  
https://product-lifecycle-management-frontend.onrender.com


---

## 📌 Overview

The **Product Lifecycle Management (PLM)** system is a centralized platform that helps organizations manage products throughout their entire lifecycle. It enables administrators, developers, and testers to collaborate seamlessly by providing product versioning, lifecycle management, secure access control, and detailed audit logs.

The project follows a scalable **RESTful architecture** built with the MERN stack and demonstrates enterprise-level software engineering concepts.

---

# ✨ Features

## 🔐 Authentication & Authorization

- JWT-based Authentication
- Secure User Registration & Login
- Role-Based Access Control (Admin, Developer, Tester)
- Protected API Routes
- Password Encryption using bcrypt.js

---

## 📦 Product Management

- Create, Read, Update, and Delete Products
- Manage Product Details
- Search Products
- Product Ownership
- Lifecycle Tracking
- Centralized Product Repository

---

## 🔄 Product Lifecycle Tracking

Manage products through predefined lifecycle stages:

- 🎨 Design
- 💻 Development
- 🧪 Testing
- 🚀 Released

Track the progress of every product from creation to final release.

---

## 📝 Product Version Control

- Semantic Versioning (SemVer)
- Product Revision History
- Version Tracking
- Release Management
- Complete Version History

---

## 📊 Activity Logging

Automatically records system activities such as:

- User Login
- Product Creation
- Product Updates
- Lifecycle Stage Changes
- Version Updates
- Product Deletion

Administrators can review complete audit logs for accountability and traceability.

---

# 🏗️ System Architecture

```text
                 User
                   │
                   ▼
        React Frontend (Vite)
                   │
           REST API Requests
                   │
                   ▼
        Express.js Backend API
                   │
     ┌─────────────┼──────────────┐
     ▼             ▼              ▼
 Authentication  Product API  Activity Logs
     │             │              │
     └─────────────┼──────────────┘
                   ▼
             MongoDB Atlas
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

## Database

- MongoDB Atlas

## Deployment

- Render (Frontend)
- Render (Backend)

---

# 🚀 Getting Started

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas
- npm

---

## Clone Repository

```bash
git clone https://github.com/rushikeshk24/Product-Lifecycle-Management.git

cd Product-Lifecycle-Management
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key
```

---

## Run Backend

```bash
cd backend
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |

---

## Products

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Get All Products |
| GET | `/api/products/:id` | Get Product |
| POST | `/api/products` | Create Product |
| PUT | `/api/products/:id` | Update Product |
| DELETE | `/api/products/:id` | Delete Product |

---

## Activity Logs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/activity-logs` | Get Activity Logs |

---

# 📂 Project Structure

```text
Product-Lifecycle-Management/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# 🎯 Core Functionalities

- ✅ Secure Authentication
- ✅ Role-Based Authorization
- ✅ Product CRUD Operations
- ✅ Lifecycle Management
- ✅ Product Version Control
- ✅ Activity Logging
- ✅ RESTful APIs
- ✅ Responsive UI

---

# 🚀 Future Enhancements

- Approval Workflow
- Product Document Management
- File Uploads
- Email Notifications
- Dashboard Analytics
- Product Search Filters
- Team Collaboration
- Comments & Discussions
- Export Reports (PDF/Excel)
- Dark Mode
- Real-time Notifications

---

# 📸 Screenshots

> Add screenshots after deployment.

```
screenshots/
│
├── login.png
├── dashboard.png
├── products.png
├── product-details.png
├── activity-logs.png
└── create-product.png
```

Example:

```md
## Login

![Login](screenshots/login.png)

## Dashboard

![Dashboard](screenshots/dashboard.png)

## Products

![Products](screenshots/products.png)
```

---

# 🤝 Contributing

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Rushikesh Karlekar**

- GitHub: https://github.com/rushikeshk24
- LinkedIn: https://linkedin.com/in/rushikeshkarlekar

---

⭐ **If you found this project useful, consider giving it a star on GitHub!**
