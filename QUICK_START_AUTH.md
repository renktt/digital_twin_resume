# 🚀 Quick Start: Google OAuth Setup

## You're Almost Ready!

Google OAuth authentication has been integrated. You just need to configure your Google credentials.

## Step 1: Get Google OAuth Credentials (5 minutes)

### A. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### B. Create a New Project
1. Click project dropdown at top
2. Click "New Project"
3. Name it: "Portfolio Auth"
4. Click "Create"

### C. Enable Required API
1. Go to: **APIs & Services** > **Library**
2. Search: "Google+ API"
3. Click it and press **Enable**

### D. Configure OAuth Consent Screen
1. Go to: **APIs & Services** > **OAuth consent screen**
2. Select: **External**
3. Click: **Create**
4. Fill in:
   - App name: "Your Portfolio"
   - User support email: Your email
   - Developer contact: Your email
5. Click **Save and Continue** (3 times)

### E. Create OAuth Credentials
1. Go to: **APIs & Services** > **Credentials**
2. Click: **Create Credentials** > **OAuth client ID**
3. Select: **Web application**
4. Name: "Portfolio Web Client"
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3001
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
7. Click: **Create**
8. **COPY** the Client ID and Client Secret

## Step 2: Update Your .env.local File

Open `.env.local` and update these two lines:

```env
GOOGLE_CLIENT_ID="paste-your-client-id-here"
GOOGLE_CLIENT_SECRET="paste-your-client-secret-here"
```

**Note:** The other values are already configured!

## Step 3: Start the App

```bash
npm run dev
```

## Step 4: Test It!

1. Open: http://localhost:3001
2. Scroll to "Digital Twin" section
3. Try to use the chatbot → Should prompt to sign in
4. Click "Sign In with Google"
5. Authenticate with your Google account
6. You're in! Try the chatbot and voice features

## That's It! 🎉

You now have Google authentication protecting your AI features.

---

## Already Configured For You ✅

- ✅ NextAuth secret generated
- ✅ All components updated
- ✅ Sign-in page created
- ✅ User profile menu added
- ✅ Protected features wrapped

## Need More Details?

See the full guide: [`docs/GOOGLE_OAUTH_SETUP.md`](./docs/GOOGLE_OAUTH_SETUP.md)

## Having Issues?

### Can't find Google Cloud Console settings?
- Make sure you selected the right project
- Check you're in the correct section (APIs & Services)

### Redirect URI mismatch error?
- Must exactly match: `http://localhost:3001/api/auth/callback/google`
- Check for typos or extra spaces

### Still not working?
- Check browser console (F12) for errors
- Verify both Client ID and Secret are correct
- Make sure there are no extra spaces in .env.local

---

**Total setup time: ~5-10 minutes** ⏱️
