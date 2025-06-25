
# 🎬 Vidora Backend - Video Sharing Platform API

Welcome to the **Vidora Backend**, the server-side powerhouse for a modern video sharing platform. Built with **Node.js**, **Express**, and **MongoDB Atlas**, this RESTful API supports authentication, video management, and cloud-based storage using **Cloudinary**.

---

## 🚀 Key Features

- 🔐 User Registration & Login (JWT-based)
- 📤 Upload & Manage Videos (Stored in Cloudinary)
- ❤️ Like, Comment, and Subscribe Features
- 📊 Track Views and User Engagement
- 🌐 MongoDB Atlas for Scalable Cloud DB
- 📦 Clean REST API Architecture

---

## 🛠 Tech Stack

| Tech        | Use                        |
|-------------|-----------------------------|
| Express.js  | Web Framework (API Layer)   |
| MongoDB Atlas | Cloud NoSQL Database       |
| Mongoose    | MongoDB ODM                 |
| Cloudinary  | Media Storage (Videos/Thumbnails) |
| CORS        | Cross-Origin Requests       |
| Dotenv      | Environment Variable Loader |
| Multer      | File Upload Middleware      |
| JWT         | Authentication              |

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vidora-backend.git
cd vidora-backend
```

### 2. Install Dependencies

```bash
npm install
```

Make sure the following are in your `package.json`:
- `express`
- `mongoose`
- `cors`
- `dotenv`
- `cloudinary`
- `multer`
- `jsonwebtoken`
- `bcryptjs`

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> Replace all `your_...` placeholders with your actual credentials.

### 4. Run the Development Server

```bash
npm run dev
```

> This starts the server with **nodemon** for live-reloading in development.

---

## ☁ Cloudinary Integration

All uploaded videos and thumbnails are stored in **Cloudinary** for fast, reliable, and scalable media handling.

Ensure Cloudinary config is properly set in your `.env` and integrated using:

```js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

---

## 📬 Postman Testing

You can use **Postman** to test routes:

1. Add Authorization header as `Bearer <your_jwt_token>`
2. Use `form-data` to upload files on upload endpoints

---

## 📌 Future Enhancements

- 🎞 Video Processing (thumbnails, duration, quality)
- 🔍 Advanced Search & Filters
- 🔔 Real-time Notifications (Socket.io)
- 🧪 Jest or Mocha Testing Suites
- 📱 Frontend Integration (React)

---

## 🤝 Contributing

Feel free to contribute to this project:

```bash
git checkout -b feature/new-feature
git commit -m "Added new feature"
git push origin feature/new-feature
```

Then open a Pull Request ✅

---

## 📄 License

Licensed under the **MIT License**.

---

## 📧 Contact

- GitHub: [harshiill](https://github.com/harshiill)
- Email: harshilkhandelwal28@gmail.com

---

> 🛠 Built with Node.js, deployed with MongoDB Atlas, and powered by Cloudinary – Vidora is ready to scale.
