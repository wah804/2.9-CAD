# AUTO VAULT (Cars CRUD API)

This is a full-stack MERN application for managing a collection of cars, built to fulfill the 2.9 Assignment: CRUD API Deployment.

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios, Custom CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Folder Structure
- `/client`: The React frontend application.
- `/server`: The Express backend API and database schemas.

## Local Setup

### 1. Database Connection
You must provide a MongoDB connection string for the backend to work properly.
1. Create a `.env` file inside the `/server` directory.
2. Add your MongoDB Atlas connection string:
   `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/autovault`

### 2. Install Dependencies & Run
You will need two terminal windows to run both the frontend and backend simultaneously.

**Terminal 1 (Backend):**
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:5000`.

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

## Deployment Instructions (Render.com)
This application is configured so the Express server can serve the compiled React frontend, allowing it to be deployed as a single Web Service on Render.

1. Create a new repository on GitHub and push this code.
2. Go to [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory:** (leave blank)
   - **Build Command:** `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command:** `cd server && npm start`
5. In the **Environment Variables** section on Render, add:
   - `MONGODB_URI` (Paste your full MongoDB Atlas connection string here)
6. Click **Deploy**. Render will install both folders, build the React app, and start the Express server.
