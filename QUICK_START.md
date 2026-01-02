# Quick Start Guide

## 🚀 Running the Application

### Step 1: Install Dependencies
```bash
npm install
# or
pnpm install
```

### Step 2: Set Up Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` and fill in your values:**

   **Required for all features:**
   - `MONGODB_URI` - Your MongoDB connection string
     - Get from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
     - Or use local MongoDB: `mongodb://localhost:27017/feedback-app`

   **Required for Private Forms (email functionality):**
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASSWORD` - Gmail App Password (see setup below)
   - `NEXT_PUBLIC_BASE_URL` - Your app URL
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`

### Step 3: Gmail App Password Setup (for Private Forms)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new App Password for "Mail"
5. Copy the 16-character password
6. Paste it as `EMAIL_PASSWORD` in `.env.local`

**Note:** You cannot use your regular Gmail password. You MUST use an App Password.

### Step 4: Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

---

## 📝 How to Use Private Forms

### For Admins (Creating Private Forms):

1. **Navigate to Admin Dashboard:**
   - Go to `http://localhost:3000/admin`
   - Click "Create Form"

2. **Create a Private Form:**
   - Fill in the form title and description
   - Select **"Private"** as the form type
   - In the "Email Addresses" field, enter Gmail addresses (comma-separated):
     ```
     user1@gmail.com, user2@gmail.com, user3@gmail.com
     ```
   - Add your questions (MCQ or Text)
   - Click "Create Form"

3. **What Happens Next:**
   - System automatically generates unique access tokens for each email
   - Emails are sent to all recipients with:
     - Form title
     - Access token (12-character code)
     - Link to the form
   - Each token can only be used once

### For Users (Accessing Private Forms):

1. **Receive Email:**
   - Check your inbox for an email with subject: "Access Token for [Form Title]"
   - The email contains your unique access token

2. **Access the Form:**
   - Go to `http://localhost:3000` (home page)
   - Click on the private form you want to access
   - You'll see a lock screen asking for your access token
   - Enter the token from your email
   - Click "Access Form"

3. **Submit Feedback:**
   - Once access is granted, complete the form
   - Submit your feedback
   - You cannot submit again (tracked via localStorage)

---

## 🔑 Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `EMAIL_USER` | ⚠️ For Private Forms | Your Gmail address |
| `EMAIL_PASSWORD` | ⚠️ For Private Forms | Gmail App Password |
| `NEXT_PUBLIC_BASE_URL` | ⚠️ For Private Forms | Your app URL (for email links) |

**Note:** Private forms won't work without email configuration. Public forms will work fine without it.

---

## 🐛 Troubleshooting

### Email Not Sending?
- ✅ Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly
- ✅ Verify you're using a Gmail App Password (not regular password)
- ✅ Make sure 2-Step Verification is enabled on your Google account
- ✅ Check the server console for error messages

### MongoDB Connection Issues?
- ✅ Verify your `MONGODB_URI` is correct
- ✅ Check if your IP is whitelisted (for MongoDB Atlas)
- ✅ Ensure MongoDB is running (for local setup)

### Access Token Not Working?
- ✅ Make sure you're using the exact token from the email
- ✅ Check if the token was already used (tokens are one-time use)
- ✅ Verify the form ID matches

---

## 📚 More Information

See `SETUP.md` for detailed documentation about the application architecture and features.

