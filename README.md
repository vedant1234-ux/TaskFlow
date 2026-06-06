<div align="center">
  <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; border-radius: 16px; display: inline-block; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 32px;">⚡ TaskFlow</h1>
  </div>
  <h3>Modern, Role-Based Task Management System</h3>
  <p>A comprehensive MERN stack application demonstrating advanced concepts in Role-Based Access Control (RBAC), JWT Authentication, React Context State Management, and MongoDB Aggregation.</p>
</div>

---

## 📖 Table of Contents
1. [System Architecture Overview](#-system-architecture-overview)
2. [Backend Deep Dive (Node.js & Express)](#-backend-deep-dive-nodejs--express)
   - [Database Models](#database-models)
   - [Authentication & Middleware](#authentication--middleware)
   - [Task Controllers & Aggregation](#task-controllers--aggregation)
   - [File Uploads](#file-uploads)
3. [Frontend Deep Dive (React & Vite)](#-frontend-deep-dive-react--vite)
   - [State Management & Axios Interceptors](#state-management--axios-interceptors)
   - [Component Architecture](#component-architecture)
   - [Design System & CSS Styling](#design-system--css-styling)
4. [Security Implementations](#-security-implementations)
5. [Installation & Setup](#-installation--setup)

---

## 🏗️ System Architecture Overview

TaskFlow is a decoupled monolithic application consisting of a React Single Page Application (SPA) on the frontend and an Express.js REST API on the backend. The backend communicates exclusively in JSON and acts as the gatekeeper to the MongoDB database. 

The application has two distinct user roles:
- **Admin**: Has global visibility. Can create tasks for themselves or assign them to standard users. Can view global statistics for all tasks in the system.
- **User**: Has restricted visibility. Can only view, complete, and reply to tasks that they created or were explicitly assigned to them by an Admin.

---

## ⚙️ Backend Deep Dive (Node.js & Express)

### Database Models
We utilize **Mongoose** to define strict schemas for our MongoDB collections.

1. **User Schema (`models/User.js`)**
   - Stores `name`, `email`, `password`, `role`, and `avatar`.
   - **Password Hashing:** Uses a Mongoose `pre('save')` hook to automatically hash passwords using `bcryptjs` before they are written to the database.
   - **Avatar Generation:** Automatically generates a custom SVG avatar via the DiceBear API if the user doesn't upload one.
   - **Security:** The `password` field has `select: false` applied, ensuring it is never accidentally returned in standard API queries.

2. **Task Schema (`models/Task.js`)**
   - Contains a complex schema supporting embedded sub-documents for `attachments` (files) and `replies` (chat messages).
   - **Fields:** `title`, `description`, `status` (pending, in-progress, completed), `priority` (low, medium, high), `dueDate`.
   - **Relationships:** Uses `mongoose.Schema.Types.ObjectId` to link tasks to their owners (`user`) and to the Admin who assigned it (`assignedBy`).
   - **Automation:** A `pre('save')` hook intercepts status changes. If a task status changes to `completed`, the hook automatically flags the boolean `completed: true` and records the exact timestamp in `completedAt`.

### Authentication & Middleware
1. **JWT Generation (`utils/generateToken.js`)**
   - On successful login or registration, the server signs a JWT containing the user's `id` using a secret key. This token is sent back to the client.

2. **Auth Protection (`middleware/authMiddleware.js`)**
   - The `protect` middleware intercepts incoming requests and extracts the `Bearer` token from the `Authorization` header.
   - It decodes the JWT, finds the user in MongoDB, and attaches the user object to the request (`req.user = user`).
   - If the token is invalid, missing, or expired, it immediately rejects the request with a `401 Unauthorized`.

3. **Error Handling (`middleware/errorMiddleware.js`)**
   - Custom error handler intercepts all thrown exceptions in Express routes. It formats the error into a consistent JSON response `({ success: false, message: "..." })` and hides stack traces in production mode.

### Task Controllers & Aggregation
The `taskController.js` handles the core business logic.
- **RBAC Filtering:** In the `getTasks` method, the controller checks `req.user.role`. If the user is *not* an Admin, it forcibly appends `{ user: req.user._id }` to the MongoDB query filter. This makes it impossible for a standard user to query tasks they do not own.
- **Aggregation Pipeline:** The `getTaskStats` method uses a powerful MongoDB Aggregation Pipeline (`$match` and `$group`). Instead of pulling all tasks into Node.js memory and counting them, the database groups tasks by `status` and returns the exact count instantly, heavily optimizing performance.

### File Uploads
- **Multer (`routes/uploadRoutes.js`)**: Configured to handle `multipart/form-data`. Files uploaded from the React frontend are caught by Multer, assigned a unique timestamped filename, and stored in the backend's `/uploads` directory. The route then returns the generated URL to the frontend, which attaches it to the Task document.

---

## 💻 Frontend Deep Dive (React & Vite)

### State Management & Axios Interceptors
1. **AuthContext (`context/AuthContext.jsx`)**
   - Wraps the entire application and maintains global state for the `user`, `token`, and `loading` status.
   - On initial load, it checks `localStorage` for a saved token and pings the `/api/auth/profile` endpoint to silently restore the user session.
   - Exposes `login`, `register`, and `logout` functions to any component that uses the `useAuth` hook.

2. **Axios Interceptor (`api/axios.js`)**
   - Creates a global Axios instance targeting the backend URL.
   - A request interceptor automatically pulls the JWT from local storage and injects it into the `Authorization` header of *every single API request*. This means components never have to worry about manually attaching tokens.

### Component Architecture
1. **Routing (`App.jsx`)**
   - Uses `react-router-dom` for client-side routing.
   - Implements a `<ProtectedRoute>` wrapper that redirects unauthenticated users back to the `/login` page if they attempt to access `/dashboard`.

2. **Layouts (`components/DashboardLayout.jsx` & `Sidebar.jsx`)**
   - The UI follows a standard Sidebar + Main Content layout. 
   - State for `sidebarOpen` is lifted to the Layout component to handle the responsive mobile overlay (closing the sidebar when a user clicks outside).

3. **Task Displays (`components/TaskCard.jsx` & `TaskForm.jsx`)**
   - **TaskCard:** Dynamically renders UI based on the `useAuth` context. For example, if a Task was `assignedBy` an Admin, standard users will *not* see the Edit or Delete buttons on that card. They can only mark it as Complete or add Replies.
   - **TaskForm:** A controlled component that handles both Creating new tasks and Editing existing ones. It dynamically switches fields depending on whether the user is an Admin (allowing them to see an "Assign To" dropdown) or a standard user.

### Design System & CSS Styling
- **No External CSS Frameworks:** Instead of Tailwind or Bootstrap, the app uses a custom Vanilla CSS design system (`index.css`).
- **CSS Variables:** Colors, spacing, radii, and shadows are mapped to CSS variables (e.g., `var(--color-primary)`). This ensures absolute design consistency across hundreds of components.
- **Micro-Animations:** Buttons and cards feature subtle `transform: translateY(-2px)` and box-shadow transitions on hover to make the interface feel responsive and alive.
- **Glassmorphism:** Navigation bars and sidebars use `backdrop-filter: blur(10px)` with semi-transparent backgrounds to achieve a modern, premium "frosted glass" aesthetic.

---

## 🔒 Security Implementations

1. **Helmet.js:** Automatically secures HTTP headers (e.g., preventing clickjacking via X-Frame-Options, enforcing DNS prefetching controls).
2. **Rate Limiting:** `express-rate-limit` prevents brute-force attacks. Global API routes are limited to 100 requests per 15 minutes per IP. Authentication routes (`/api/auth/*`) have a much stricter limit of 20 requests per 15 minutes.
3. **CORS:** Cross-Origin Resource Sharing is strictly configured to only accept incoming traffic from the approved `CLIENT_URL` (the React frontend).
4. **Body Parsing Limits:** Express JSON body parsers are limited to `10mb` to prevent payload overflow attacks.

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd task-manager
```

### 2. Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 4. Database Initialization (Seeding)
To test the application, you need to populate MongoDB with the required User schemas. Run the seeder script from the `server` directory:
```bash
cd server
node seeder.js
```
This script establishes a connection to MongoDB, wipes the collections, and creates two default users:
- **Admin**: `admin@taskflow.com` (password: `admin123`)
- **User**: `demo@taskflow.com` (password: `demo123`)

### 5. Running the Application
Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
Navigate to `http://localhost:5173` in your browser. Use the provided demo buttons on the login screen to explore the RBAC implementations.

---

## 🎮 How to Use the Application

Once both servers are running and you have navigated to `http://localhost:5173`, follow these steps to experience the full workflow:

### 1. The Admin Experience
- **Login:** On the login screen, click the pink **🛡️ Admin Demo** button to auto-fill the admin credentials, then click **Sign In**.
- **Dashboard Overview:** You will see the global statistics showing *all* tasks across the entire system.
- **Create a Task:** Click **Create New Task**. Notice the **Assign To** dropdown menu. You can choose to assign this task to yourself, or to the standard User account. Fill out the details, attach a file if you'd like, and click **Create**.
- **Manage Tasks:** Because you are an Admin, you will see an **Edit (✏️)** and **Delete (🗑️)** icon on every task card you created. 

### 2. The Standard User Experience
- **Login:** Sign out of the Admin account (bottom left corner). On the login screen, click the blue **🚀 User Demo** button to auto-fill the standard user credentials, then click **Sign In**.
- **Dashboard Restrictions:** Notice that the global statistics have changed! You now *only* see numbers for tasks assigned specifically to you.
- **View Assigned Tasks:** You will see the task the Admin assigned to you. Notice that there is a **Assigned by Admin** badge on it. 
- **Restricted Actions:** Because an Admin assigned this to you, you do *not* have permission to Edit or Delete the task (the icons are hidden). However, you *can* click the **Complete** button when you finish the work.

### 3. Task Discussions (Replies)
- As the standard User, click on a Task Card to open the **Task Details Modal**.
- At the bottom, you will see the **Discussion** section. Type a message (e.g., *"I need more details on this"*), attach an image if you'd like, and send the reply.
- Log back in as the **Admin**. Open the exact same task, and you will see the User's reply. You can reply back directly in the thread, creating a real-time discussion on that specific task!
