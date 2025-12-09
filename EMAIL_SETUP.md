# Email Configuration Guide

## Recommended: Free SMTP Services

### Option 1: Mailtrap (Best for Development/Testing) ⭐

**Mailtrap** is a free email testing service that captures all emails without sending them. Perfect for development!

1. **Sign up**: Go to https://mailtrap.io/ (free account)
2. **Get credentials**: 
   - Go to Inboxes → Your Inbox → SMTP Settings
   - Copy the credentials

**Configuration:**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
EMAIL_FROM="RT-SYR <noreply@rt-syr.com>"
```

**Benefits:**
- ✅ 100% free for testing
- ✅ No real emails sent
- ✅ View emails in Mailtrap dashboard
- ✅ Perfect for development

---

### Option 2: Resend (Free Tier: 100 emails/day)

**Resend** is a modern email API with a generous free tier.

1. **Sign up**: Go to https://resend.com/ (free tier)
2. **Get API key**: Dashboard → API Keys → Create API Key

**Configuration:**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASSWORD=re_your-api-key-here
EMAIL_FROM="RT-SYR <onboarding@resend.dev>"  # Use your verified domain or onboarding email
```

**Benefits:**
- ✅ 100 emails/day free
- ✅ Modern API
- ✅ Good deliverability
- ✅ Easy setup

---

### Option 3: SendGrid (Free Tier: 100 emails/day)

**SendGrid** is a popular email service with a free tier.

1. **Sign up**: Go to https://sendgrid.com/ (free tier)
2. **Create API key**: Settings → API Keys → Create API Key

**Configuration:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM="RT-SYR <noreply@yourdomain.com>"
```

**Benefits:**
- ✅ 100 emails/day free
- ✅ Reliable service
- ✅ Good documentation

---

### Option 4: Mailgun (Free Tier: 5,000 emails/month)

**Mailgun** offers a generous free tier for production use.

1. **Sign up**: Go to https://www.mailgun.com/ (free tier)
2. **Get credentials**: Sending → Domain Settings → SMTP credentials

**Configuration:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
EMAIL_FROM="RT-SYR <noreply@yourdomain.com>"
```

**Benefits:**
- ✅ 5,000 emails/month free
- ✅ Great for production
- ✅ Good deliverability

---

## Gmail SMTP Setup (Not Recommended - Requires App Password)

If you're using Gmail for sending emails, you need to use an **App Password** instead of your regular Gmail password.

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **App**: Choose "Mail"
3. Select **Device**: Choose "Other (Custom name)" and enter "RT-SYR Backend"
4. Click **Generate**
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

Update your `.env` file with the following:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # Use the App Password (remove spaces)
EMAIL_FROM="RT-SYR <your-email@gmail.com>"
```

**Important Notes:**
- Use the **App Password** (16 characters, no spaces) in `SMTP_PASSWORD`
- Do NOT use your regular Gmail password
- The App Password should be 16 characters without spaces

### Step 4: Verify Configuration

After updating your `.env` file, restart your server. The email service will:
- Log success if configured correctly
- Log warnings if SMTP is not configured (runs in DEV MODE)
- Log helpful error messages if authentication fails

## Alternative Email Providers

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM="RT-SYR <noreply@yourdomain.com>"
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
EMAIL_FROM="RT-SYR <noreply@yourdomain.com>"
```

### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-ses-smtp-username
SMTP_PASSWORD=your-aws-ses-smtp-password
EMAIL_FROM="RT-SYR <noreply@yourdomain.com>"
```

## Quick Start (Recommended: Mailtrap)

For the fastest setup, use **Mailtrap**:

1. Sign up at https://mailtrap.io/ (free)
2. Copy your SMTP credentials from the inbox
3. Add to `.env`:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
EMAIL_FROM="RT-SYR <noreply@rt-syr.com>"
```
4. Restart server
5. Check Mailtrap inbox to see emails!

---

## Development Mode

If SMTP is not configured, the application will run in **DEV MODE**:
- OTP codes will be logged to the console instead of being sent via email
- Look for log messages like: `[DEV MODE] OTP for user@example.com: 123456`

This is useful for local development when you don't want to set up email.

## Troubleshooting

### Error: "535-5.7.8 Username and Password not accepted"

**Solution:**
1. Ensure you're using an App Password, not your regular Gmail password
2. Verify 2-Step Verification is enabled
3. Check that the App Password is correctly copied (no spaces)
4. Make sure the email in `SMTP_USER` matches the Google account where you generated the App Password

### Error: "Connection timeout"

**Solution:**
1. Check your firewall settings
2. Verify the SMTP port (587 for TLS, 465 for SSL)
3. Ensure `SMTP_SECURE` is set correctly:
   - `false` for port 587 (TLS)
   - `true` for port 465 (SSL)

### Error: "Invalid login"

**Solution:**
1. Double-check your credentials
2. For Gmail, ensure you're using an App Password
3. Verify the email address in `SMTP_USER` is correct
4. Check that the App Password hasn't been revoked

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use App Passwords** instead of regular passwords
3. **Rotate App Passwords** periodically
4. **Use environment-specific credentials** (dev, staging, production)
5. **Consider using a dedicated email service** (SendGrid, Mailgun, AWS SES) for production

## Testing Email Configuration

After configuring, test by:
1. Starting the server
2. Attempting to sign up a new user
3. Check server logs for:
   - Success: `Email service configured successfully`
   - Error: Detailed error messages with troubleshooting hints
   - Dev Mode: `[DEV MODE] OTP for...` (if SMTP not configured)

