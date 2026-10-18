# AI Image Enhancement & Restoration Platform

A clean, student-built web application for restoring and enhancing photos. Built using **React.js**, **Node.js**, **Express**, **MongoDB**, and the **Hugging Face API**.

Designed with a straightforward dark theme and simple workflow without flashy or overwhelming UI elements.

---

## 🌟 Core Features

- **Low-Resolution Upscaling (Super-Resolution 2x)**: Expands image dimensions using high-order Lanczos3 kernels and edge refinement.
- **Deblur & Focus Sharpening**: Restores blurry camera shots and motion blur using adaptive unsharp masking and edge contrast expansion.
- **Historical & Vintage Photo Restoration**: Corrects faded prints, dynamic range, and paper grain/scratches.
- **Interactive Dual-Frame Preview Dashboard**:
  - **Before/After Split Slider**: Drag a divider handle across the exact photo to see pixel-by-pixel enhancement.
  - **Side-by-Side Dual Frame**: Instant side-by-side view with original vs restored image and dimension comparison.
- **1-Click Built-in Sample Presets**: Includes sample photos for quick evaluation (Low-Res Portrait, Blurred Architecture, Historical 1942 print).
- **Authentication (Login & Signup)**:
  - User registration and login using JWT (JSON Web Tokens) and bcrypt password hashing.
  - Saved restoration history linked to user profile.
  - 1-Click "Fill Demo Login" button for instant testing.
- **Database Architecture**:
  - Connects to **MongoDB** via Mongoose.
  - If MongoDB is not running locally, seamlessly switches to an embedded JSON storage fallback so the app always runs without crashing.
- **Hugging Face API Integration**:
  - Add your own Hugging Face access token as `HF_TOKEN` in a local `.env` file to enable API inference.
  - Integrates with Hugging Face restoration networks (`caidas/swin2SR`, `microsoft/swinir`) with graceful local Sharp fallback.

---

## 📁 Project Structure

```
ai-image-restoration/
├── .env.example          # Sample environment configuration
├── package.json          # Root scripts
├── server/
│   ├── config/
│   │   └── db.js         # MongoDB connection with automatic fallback
│   ├── models/
│   │   ├── User.js       # User model with bcrypt password hashing
│   │   └── Restoration.js# Restoration records & metrics
│   ├── routes/
│   │   ├── authRoutes.js # /api/auth/register, /api/auth/login, /api/auth/me
│   │   ├── restorationRoutes.js # /api/restore, /api/history, /api/samples
│   │   └── systemRoutes.js      # /api/system/status
│   ├── services/
│   │   ├── huggingFaceService.js# Hugging Face API router client
│   │   ├── imageProcessorService.js# Sharp Lanczos3, deblur & sharpness metric
│   │   └── storageService.js    # Embedded JSON database fallback
│   ├── public/
│   │   ├── samples/      # Built-in realistic test images
│   │   └── uploads/      # Saved processed images
│   └── server.js         # Express app entry point
└── client/
    ├── index.html        # Clean dark theme HTML
    ├── vite.config.js    # Vite configuration with API proxy
    ├── tailwind.config.js# Tailwind slate palette
    └── src/
        ├── App.jsx       # Main single-page application
        ├── context/
        │   └── AuthContext.jsx # Auth state & token storage
        ├── components/
        │   ├── Navbar.jsx           # Clean header & login trigger
        │   ├── ImageUploader.jsx    # Upload area & sample picker
        │   ├── RestorationControls.jsx # 3 enhancement options & run button
        │   ├── DualFramePreview.jsx # Split slider & side-by-side dashboard
        │   ├── HistoryList.jsx      # Past restorations gallery
        │   └── AuthModal.jsx        # Login & Signup popup
        └── services/
            └── api.js               # Frontend fetch wrapper
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm
- *(Optional)* MongoDB (if not installed, the app automatically runs in embedded fallback mode)

### 1. Install & Build

From the root `ai-image-restoration/` folder:

```bash
# Create a local environment file and set a private, random JWT_SECRET.
cp .env.example .env

# Install server dependencies
cd server
npm install

# Install client dependencies & build frontend
cd ../client
npm install
npm run build

# Return to root
cd ..
```

### 2. Start the Application

```bash
# Start the full-stack app
npm start
```

Visit **`http://localhost:5000`** in your browser.

---

## 🛠️ Running in Development Mode

If you are modifying the React frontend and want hot-reloading:

```bash
# Terminal 1: Start backend server (port 5000)
npm run server

# Terminal 2: Start Vite dev client (port 3000)
npm run client
```

Then open **`http://localhost:3000`**. All `/api` requests will automatically proxy to port 5000.

---

## 🧪 Testing the Features

1. **Test with 1-Click Sample**: Click any of the 3 presets (e.g., *Pixelated Portrait* or *Blurred Architecture*).
2. **Select Task**: Choose *Upscale 2x*, *Deblur & Sharpen*, or *Restore Old Photo*.
3. **Click "Enhance Photo"**: Watch the progress indicator as the image is restored.
4. **Inspect in Dual-Frame**: Drag the blue split-slider divider back and forth to inspect Before vs After details, or switch to *Side by Side* view.
5. **Download**: Click *Download Photo* to save the enhanced output.
6. **Login / Signup**: Click *Login / Signup* in the top navbar and click *Fill Demo Login (1-Click)* to test user authentication.
