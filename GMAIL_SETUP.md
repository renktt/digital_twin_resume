# Gmail Setup for Contact Form

This guide will help you set up Gmail to receive contact form submissions from your portfolio website.

## Prerequisites

- A Gmail account (renantemarzan11@gmail.com)
- 2-Step Verification enabled on your Google account

## Step-by-Step Instructions

### 1. Enable 2-Step Verification (if not already enabled)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google," select **2-Step Verification**
3. Follow the prompts to set it up using your phone number

### 2. Generate Gmail App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. You may need to sign in again
3. Under "Select app," choose **Mail** or **Other (Custom name)**
4. If you choose "Other," enter a name like "Portfolio Contact Form"
5. Click **Generate**
6. Google will display a 16-character password (looks like: `abcd efgh ijkl mnop`)
7. **Copy this password** - you won't be able to see it again!

### 3. Add to Environment Variables

#### For Local Development

1. Open `.env.local` file in your project root
2. Add or update these variables:
   ```env
   GMAIL_USER="renantemarzan11@gmail.com"
   GMAIL_APP_PASSWORD="abcdefghijklmnop"  # Paste your 16-char password (remove spaces)
   ```
3. Save the file
4. Restart your development server (`npm run dev`)

#### For Vercel Production

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project (`rresume`)
3. Go to **Settings** → **Environment Variables**
4. Add two new variables:
   - **Name:** `GMAIL_USER`
     - **Value:** `renantemarzan11@gmail.com`
     - **Environment:** Production, Preview, Development
   
   - **Name:** `GMAIL_APP_PASSWORD`
     - **Value:** Your 16-character app password (without spaces)
     - **Environment:** Production, Preview, Development
5. Click **Save**
6. Redeploy your application

## How It Works

When someone fills out the contact form on your website:

1. ✅ The message is saved to your Upstash Vector database
2. ✅ An email notification is sent to `renantemarzan11@gmail.com`
3. ✅ The email includes:
   - Sender's name
   - Sender's email (clickable to reply)
   - Their message
   - Timestamp

## Email Format Example

```
Subject: New Contact Message from John Doe

New Contact Message

Name: John Doe
Email: john@example.com

Message:
Hi, I'm interested in working with you on a web development project.
Would you be available for a call next week?

---
This message was sent from your portfolio website contact form.
```

## Testing

### Test Locally

1. Make sure environment variables are set in `.env.local`
2. Run `npm run dev`
3. Go to `http://localhost:3000` or `http://localhost:3001`
4. Navigate to the Contact page
5. Fill out and submit the form
6. Check your Gmail inbox for the notification

### Test on Production (Vercel)

1. Ensure environment variables are set in Vercel dashboard
2. Redeploy if needed
3. Visit your production domain
4. Submit a test message through the contact form
5. Check your Gmail inbox

## Troubleshooting

### Email Not Sending

**Error: "Invalid login"**
- ✓ Double-check your Gmail App Password (no spaces, 16 characters)
- ✓ Make sure 2-Step Verification is enabled
- ✓ Generate a new App Password if needed

**Error: "Authentication failed"**
- ✓ Verify `GMAIL_USER` is correct: `renantemarzan11@gmail.com`
- ✓ Regenerate your App Password from Google

**No email received**
- ✓ Check your Gmail spam/junk folder
- ✓ Check Vercel deployment logs for errors
- ✓ Verify environment variables are set correctly in Vercel

**Error in Vercel logs**
- ✓ Check all environment variables are set
- ✓ Redeploy after adding environment variables
- ✓ View real-time logs: Vercel Dashboard → Your Project → Functions → Logs

### Message Saved but Email Not Sent

If you see "Message sent successfully!" but no email arrives:
- Check the Vercel function logs for email errors
- The system is designed to save messages even if email fails
- You can still access messages in your database

## Security Notes

- ✅ **Never commit** `.env.local` to Git (it's in `.gitignore`)
- ✅ **Never share** your Gmail App Password publicly
- ✅ **Use App Passwords** instead of your actual Gmail password
- ✅ **Regenerate** App Passwords if you suspect they're compromised
- ✅ App Passwords can be revoked anytime from Google Account settings

## Additional Resources

- [Google 2-Step Verification](https://support.google.com/accounts/answer/185839)
- [Google App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Nodemailer Documentation](https://nodemailer.com/about/)

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Try generating a new Gmail App Password
5. Test with a simple email client first to verify credentials work

---

**Remember:** After setting up Gmail App Password in both `.env.local` and Vercel, restart your dev server and redeploy to Vercel for changes to take effect.
