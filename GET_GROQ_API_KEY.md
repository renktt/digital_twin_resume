# 🚀 Quick Start: Get Your Groq API Key

## Step 1: Sign Up for Groq
1. Visit: **https://console.groq.com/**
2. Click "Sign Up" or "Get Started"
3. Sign up with:
   - Google account (recommended - instant)
   - GitHub account
   - Or email/password

## Step 2: Create API Key
1. After login, go to: **https://console.groq.com/keys**
2. Click **"Create API Key"**
3. Give it a name (e.g., "Portfolio Digital Twin")
4. Click **"Submit"**
5. **IMPORTANT**: Copy the API key immediately (you won't see it again!)

## Step 3: Add to Your Project
1. Open `.env.local` in your resume project
2. Find the line:
   ```
   GROQ_API_KEY="your_groq_api_key_here"
   ```
3. Replace `your_groq_api_key_here` with your actual key:
   ```
   GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```
4. Save the file

## Step 4: Test It!
```bash
npm run dev
```

Then:
1. Open http://localhost:3000
2. Click the chatbot icon (bottom right)
3. Type: "Tell me about your skills"
4. You should get an intelligent AI response!

## Example API Key Format
```
GROQ_API_KEY="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"
```

## Free Tier Limits
Groq offers generous free tier:
- **6,000 requests per minute**
- **30,000 requests per day**
- **14,400 tokens per minute**

Perfect for your portfolio! No credit card required.

## Troubleshooting

### Can't access Groq Console?
- Try incognito/private browser window
- Clear browser cache
- Use different browser (Chrome recommended)

### API Key not working?
- Make sure you copied the entire key
- Check for extra spaces or quotes
- Verify the key starts with `gsk_`
- Restart your dev server after adding key

### Need Help?
- Groq Documentation: https://console.groq.com/docs
- Groq Discord: https://discord.gg/groq

## What's Next?

Once your API key is set up, your Digital Twin will:
- ✅ Answer questions intelligently using Groq AI
- ✅ Remember conversations using Redis
- ✅ Respond in < 1 second (10x faster than OpenAI!)
- ✅ Use your actual resume and project data
- ✅ Work with both chat and voice interfaces

Enjoy your super-fast, intelligent Digital Twin! 🎉
