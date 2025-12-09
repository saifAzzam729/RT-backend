# Quick Email Setup - Send to Gmail Accounts

## 🚀 Fastest Setup: Resend (Recommended)

**Resend** is the easiest way to send real emails to Gmail accounts. Free tier: **100 emails/day**.

### Step 1: Sign Up
1. Go to https://resend.com/
2. Click "Sign Up" (free account)
3. Verify your email

### Step 2: Get API Key
1. After login, go to **API Keys** in the sidebar
2. Click **"Create API Key"**
3. Name it: "RT-SYR Backend"
4. Copy the API key (starts with `re_`)

### Step 3: Configure .env
Add to your `.env` file:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASSWORD=re_your-api-key-here
EMAIL_FROM="RT-SYR <onboarding@resend.dev>"
```

**Note:** For the first setup, use `onboarding@resend.dev` as the FROM address. Later, you can verify your own domain.

### Step 4: Restart Server
```bash
npm run start:dev
```

### Step 5: Test
Try signing up a new user - the OTP email will be sent to their Gmail account!

---

## Alternative: SendGrid (Also Free)

**SendGrid** also sends real emails. Free tier: **100 emails/day**.

### Step 1: Sign Up
1. Go to https://sendgrid.com/
2. Sign up for free account
3. Verify your email

### Step 2: Create API Key
1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: "RT-SYR Backend"
4. Permissions: **Full Access** (or Mail Send only)
5. Copy the API key

### Step 3: Configure .env
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key-here
EMAIL_FROM="RT-SYR <noreply@sendgrid.net>"
```

### Step 4: Restart Server
```bash
npm run start:dev
```

---

## Alternative: Mailgun (More Emails)

**Mailgun** offers **5,000 emails/month** for free.

### Step 1: Sign Up
1. Go to https://www.mailgun.com/
2. Sign up for free account
3. Verify your email and phone

### Step 2: Get SMTP Credentials
1. Go to **Sending** → **Domain Settings**
2. Use the default sandbox domain (or add your own)
3. Go to **SMTP credentials** tab
4. Copy:
   - SMTP hostname
   - SMTP username
   - SMTP password

### Step 3: Configure .env
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM="RT-SYR <noreply@your-domain.mailgun.org>"
```

### Step 4: Restart Server
```bash
npm run start:dev
```

---

## Testing

After setup, test by:

1. **Start your server:**
   ```bash
   npm run start:dev
   ```

2. **Check logs** - You should see:
   ```
   [EmailService] Email service configured with Resend
   ```

3. **Sign up a new user** with a Gmail address

4. **Check the Gmail inbox** - The OTP email should arrive!

5. **Check server logs** - Should show:
   ```
   ✅ OTP email sent successfully to user@gmail.com
   ```

---

## Troubleshooting

### "Authentication failed"
- Double-check your API key/password
- Make sure there are no extra spaces
- For Resend: API key should start with `re_`
- For SendGrid: API key should start with `SG.`

### "Email not received"
- Check spam folder
- Verify the email address is correct
- Check server logs for errors
- For Resend: Check the dashboard for delivery status

### "Service not configured"
- Make sure all SMTP variables are set in `.env`
- Restart the server after changing `.env`
- Check that variables don't have quotes around values

---

## Which Service to Choose?

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Resend** | 100/day | ⭐ Easiest setup, modern |
| **SendGrid** | 100/day | Reliable, popular |
| **Mailgun** | 5,000/month | More emails, production-ready |

**Recommendation:** Start with **Resend** - it's the easiest to set up!

---

## Current Configuration Check

Your current `.env` should have:
```env
SMTP_HOST=smtp.resend.com  # or smtp.sendgrid.net, smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend  # or "apikey" for SendGrid
SMTP_PASSWORD=your-api-key-here
EMAIL_FROM="RT-SYR <onboarding@resend.dev>"
```

After updating, restart your server and test!




