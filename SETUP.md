# Perfect Date App - Setup Guide

## 🚀 Getting Started

This app integrates with **Google Calendar** and **Gmail** to automatically create calendar events and send confirmation emails.

---

## 📋 Prerequisites

1. **Node.js** - Download from [nodejs.org](https://nodejs.org/)
2. **Google Account** - For Calendar API
3. **Gmail Account** - For sending emails

---

## 🔧 Step 1: Gmail Setup (App Password)

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Find **App passwords** (appears after 2FA is enabled)
5. Select **Mail** and **Windows Computer**
6. Copy the generated **App Password** (16 characters)
7. Save it - you'll need this for `.env`

---

## 🔑 Step 2: Google Calendar API Setup

### 2a. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a **New Project**
3. Name it "Perfect Date App"
4. Click **Create**

### 2b. Enable Calendar API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click it → **Enable**

### 2c. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Choose **Desktop application**
4. Download the JSON file
5. Open the JSON and copy:
   - `client_id`
   - `client_secret`

### 2d. Get Refresh Token

1. Create a test file `get-auth-token.js`:

```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET',
    'http://localhost:3000'
);

const scopes = ['https://www.googleapis.com/auth/calendar'];
const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
console.log('Visit this URL:', url);
```

2. Run `node get-auth-token.js`
3. Visit the URL in browser
4. Authorize the app
5. Copy the code from redirect URL
6. Use code to get refresh token (see code below)

---

## 📝 Step 3: Create `.env` File

Create a `.env` file in the project root:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-16-chars

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_REDIRECT_URL=http://localhost:3000

PORT=3000
```

---

## 💾 Step 4: Install Dependencies

```bash
npm install
```

---

## 🎯 Step 5: Run the Server

```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
Email service: Gmail configured
Google Calendar API: Connected
```

---

## ✅ Step 6: Test It Out

1. Open `http://localhost:3000` in your browser
2. Go through the date selection:
   - Click "Yes"
   - Select date & time
   - Pick foods
   - Pick adventures
3. Enter your email
4. Click "See Summary"
5. Check your:
   - **Email inbox** - Confirmation email
   - **Google Calendar** - New event created with reminders!

---

## 🐛 Troubleshooting

### "Gmail authentication failed"
- Check your **App Password** is correct (16 chars, no spaces)
- Make sure **2-Step Verification** is enabled on Google Account

### "Google Calendar API error"
- Verify `GOOGLE_REFRESH_TOKEN` is correct
- Make sure Calendar API is enabled in Google Cloud Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### "CORS errors"
- Make sure server is running on `http://localhost:3000`
- Frontend should call `/api/save-date` endpoint

### "Dotenv not loading"
- Rename `.env.example` to `.env`
- Put `.env` in the **project root** (same folder as `server.js`)
- Restart the server after creating `.env`

---

## 📱 Environment Variables Explained

| Variable | What it is | Where to get it |
|----------|-----------|-----------------|
| `EMAIL_USER` | Gmail address | Your Gmail email |
| `EMAIL_PASSWORD` | App Password | Google Account → Security → App passwords |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Client Secret | Google Cloud Console → Credentials |
| `GOOGLE_REFRESH_TOKEN` | Refresh Token | Generated from OAuth flow |
| `GOOGLE_REDIRECT_URL` | Callback URL | `http://localhost:3000` |

---

## 🚀 Deployment (Optional)

To deploy to the internet:

1. Use **Heroku**, **Vercel**, **Railway**, or similar
2. Set environment variables in deployment platform
3. Update `GOOGLE_REDIRECT_URL` to your deployed URL
4. Keep `.env` file **local only** - never commit it!

---

## ❓ Questions?

- Email service issues → Check Gmail App Password
- Calendar issues → Check Google Cloud Console
- Frontend issues → Check browser console (F12)

Enjoy! 💕
