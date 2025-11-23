# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your portfolio application.

## Prerequisites
- A Google account
- Access to Google Cloud Console

## Step-by-Step Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **New Project**
4. Enter a project name (e.g., "Portfolio Auth")
5. Click **Create**

### 2. Enable Google+ API

1. In your new project, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Your Portfolio Name
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. Skip the Scopes section (click **Save and Continue**)
7. Add test users if needed (click **Save and Continue**)
8. Review and click **Back to Dashboard**

### 4. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Application type**: Web application
4. Enter a name (e.g., "Portfolio Web Client")
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3001` (for development)
   - Your production URL (e.g., `https://yourdomain.com`)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3001/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 5. Update Environment Variables

1. Open `.env.local` in your project
2. Update the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-client-id-from-step-4"
GOOGLE_CLIENT_SECRET="your-client-secret-from-step-4"
```

3. Generate a NextAuth secret:
   ```bash
   # On Linux/Mac
   openssl rand -base64 32
   
   # On Windows (PowerShell)
   $randomBytes = New-Object byte[] 32
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($randomBytes)
   [Convert]::ToBase64String($randomBytes)
   ```

4. Update the NEXTAUTH_SECRET:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

5. Update NEXTAUTH_URL for production:
```env
NEXTAUTH_URL="https://yourdomain.com"  # Change for production
```

### 6. Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your application
3. Try to access the chatbot or voice chat
4. You should be redirected to the sign-in page
5. Click "Continue with Google"
6. Sign in with your Google account
7. You should be redirected back and have access to the features

## Production Deployment

When deploying to production:

1. Add your production domain to **Authorized JavaScript origins**
2. Add your production callback URL to **Authorized redirect URIs**
3. Update `NEXTAUTH_URL` in your production environment variables
4. Make sure all environment variables are set in your hosting platform

## Troubleshooting

### Error: redirect_uri_mismatch
- Make sure the redirect URI in Google Console exactly matches your callback URL
- Check that you're using the correct port (3001 in development)

### Error: invalid_client
- Verify your Client ID and Client Secret are correct
- Make sure there are no extra spaces in the environment variables

### Users can't sign in
- Check that the OAuth consent screen is properly configured
- Add test users if the app is not published
- Make sure Google+ API is enabled

### Session not persisting
- Verify NEXTAUTH_SECRET is set correctly
- Check that NEXTAUTH_URL matches your domain

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. Use different OAuth clients for development and production
3. Regularly rotate your Client Secret
4. Keep your NEXTAUTH_SECRET secure and never expose it
5. Use HTTPS in production (required by Google OAuth)

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
