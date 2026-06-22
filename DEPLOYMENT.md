# 🚀 FREE Deployment Guide (Vercel + Render)

## Prerequisites
- GitHub account (free at github.com)
- Vercel account (free, sign up with GitHub)
- Render account (free, sign up with GitHub)
- Your Gmail & Google Calendar credentials set up (from SETUP.md)

---

## Step-by-Step Deployment

### **Step 1: Create GitHub Repository**

```bash
cd "c:\Users\91975\OneDrive\Desktop\dateing Website"
git init
git add .
git commit -m "Initial dating website deployment"
git remote add origin https://github.com/YOUR-USERNAME/dating-website.git
git branch -M main
git push -u origin main
```

> Replace `YOUR-USERNAME` with your GitHub username
> If you don't have git installed, download from git-scm.com

**Verify:** Go to `github.com/YOUR-USERNAME/dating-website` - you should see all your files

---

### **Step 2: Deploy Frontend to Vercel (Frontend only)**

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub repos
4. Click **"New Project"**
5. Select your **`dating-website`** repo
6. Click **"Deploy"** - takes ~1-2 min ✅

**You now have:** A live frontend URL like `https://dating-website.vercel.app`

> ⚠️ **Note:** API calls won't work yet (backend not deployed)

---

### **Step 3: Deploy Backend to Render (Backend only)**

1. Go to **[render.com](https://render.com)**
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Authorize Render to access your repos
4. Click **"New +"** → **"Web Service"**
5. Select **`dating-website`** repo
6. **Fill in:**
   - **Name:** `dating-website-api`
   - **Runtime:** `Node`
   - **Root Directory:** *(leave blank)*
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

7. Click **"Advanced"** → **"Add Environment Variable"**
   - Add all variables from your `.env` file:
     ```
     GMAIL_USER=your-email@gmail.com
     GMAIL_PASS=your-app-password
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-secret
     GOOGLE_REFRESH_TOKEN=your-refresh-token
     REDIRECT_URI=https://developers.google.com/oauthplayground
     ```

8. Click **"Create Web Service"** - takes ~2-3 min ✅

**You now have:** A live backend URL like `https://dating-website-api.onrender.com`

---

### **Step 4: Connect Frontend to Backend**

Now your frontend needs to know where the backend is.

**Open your `script.js` and find all fetch calls:**

Replace:
```javascript
const response = await fetch('/api/send-date-notification', {
```

With:
```javascript
const response = await fetch('https://dating-website-api.onrender.com/api/send-date-notification', {
```

> **Search for:** `fetch('/api/`
> **Replace all with:** `fetch('https://dating-website-api.onrender.com/api/`

Also update in `index.html` if there are any fetch calls there.

**Commit and push:**
```bash
git add .
git commit -m "Update API endpoints to production backend"
git push origin main
```

Vercel will automatically redeploy! ✅

---

### **Step 5: Test Your Live Site**

1. Go to your Vercel frontend URL: `https://dating-website.vercel.app`
2. Click "YES" ✅
3. Fill in date and time ✅
4. Check your email for notification ✅
5. Select food and adventure options ✅
6. Check Google Calendar for the event ✅

---

## 🎉 You're Live!

**Your dating website is now deployed at:**
- **Frontend:** `https://your-domain.vercel.app`
- **Backend:** `https://your-backend.onrender.com`

---

## Troubleshooting

### "API calls return 404"
- Verify backend URL in `script.js` matches your Render domain exactly
- Check Render dashboard - service should say "Live"
- Wait 2-3 minutes for Render to finish building

### "Emails not sending"
- Check Gmail credentials are correct in Render environment variables
- Verify Gmail App Password is enabled (not regular password)
- Check Render logs: Dashboard → Your Service → Logs

### "Google Calendar not syncing"
- Verify `GOOGLE_REFRESH_TOKEN` is in Render environment variables
- Check that Google Calendar API is enabled in Google Cloud Console
- Test with a new date to trigger calendar sync

### "Changes not showing on live site"
- Push to GitHub: `git push origin main`
- Wait 30-60 seconds for Vercel to redeploy
- Hard refresh browser: Ctrl+Shift+Delete (Windows)

---

## Upgrade Options (Not Free)

If you need more features:
- **Custom Domain:** ~$12/year (Vercel + Namecheap)
- **Database:** Switch to Render Postgres (~$7/month)
- **More Reliability:** Upgrade to paid Render/Vercel tiers

But this free setup will work great for your dating website!

---

## File Reference

- `vercel.json` - Vercel deployment config
- `server.js` - Backend API server
- `script.js` - Frontend with updated API URLs
- `index.html` - Frontend UI
- `.env` - Local environment variables (DO NOT COMMIT)
- `package.json` - Dependencies
