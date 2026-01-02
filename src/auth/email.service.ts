import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    const smtpConfig = this.configService.get('email.smtp');
    
    if (smtpConfig?.host && smtpConfig?.auth?.user && smtpConfig?.auth?.pass) {
      try {
        // Configure based on SMTP provider
        const host = smtpConfig.host.toLowerCase();
        
        if (host.includes('gmail.com')) {
          // Gmail configuration
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpConfig.auth.user,
              pass: smtpConfig.auth.pass, // Should be App Password
            },
          });
          this.logger.log('Email service configured with Gmail SMTP');
        } else if (host.includes('mailtrap.io')) {
          // Mailtrap (free testing service)
          this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port || 2525,
            secure: false,
            auth: {
              user: smtpConfig.auth.user,
              pass: smtpConfig.auth.pass,
            },
          });
          this.logger.log('Email service configured with Mailtrap (testing)');
        } else if (host.includes('resend.com')) {
          // Resend (free tier: 100 emails/day)
          this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port || 587,
            secure: false,
            auth: {
              user: 'resend',
              pass: smtpConfig.auth.pass, // Resend API key
            },
          });
          this.logger.log('Email service configured with Resend');
        } else if (host.includes('sendgrid.net')) {
          // SendGrid (free tier: 100 emails/day)
          this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port || 587,
            secure: false,
            auth: {
              user: 'apikey',
              pass: smtpConfig.auth.pass, // SendGrid API key
            },
          });
          this.logger.log('Email service configured with SendGrid');
        } else if (host.includes('mailgun.org')) {
          // Mailgun (free tier: 5,000 emails/month)
          this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port || 587,
            secure: false,
            auth: {
              user: smtpConfig.auth.user,
              pass: smtpConfig.auth.pass,
            },
          });
          this.logger.log('Email service configured with Mailgun');
        } else if (host.includes('office365.com') || host.includes('outlook.com') || host.includes('live.com') || host.includes('hotmail.com')) {
          // Office 365 / Outlook / Microsoft 365 SMTP configuration
          // Many GoDaddy email accounts are hosted on Office 365
          this.transporter = nodemailer.createTransport({
            host: smtpConfig.host || 'smtp.office365.com',
            port: smtpConfig.port || 587,
            secure: false, // Use TLS (STARTTLS)
            auth: {
              user: smtpConfig.auth.user, // Full email address (e.g., info@yourdomain.com)
              pass: smtpConfig.auth.pass, // Email password or app password
            },
            tls: {
              ciphers: 'SSLv3',
              rejectUnauthorized: false,
            },
          });
          this.logger.log(`Email service configured with Office 365/Outlook SMTP (${smtpConfig.host || 'smtp.office365.com'}:${smtpConfig.port || 587})`);
        } else if (host.includes('secureserver.net') || host.includes('godaddy.com')) {
          // GoDaddy SMTP configuration (traditional GoDaddy email)
          // GoDaddy uses smtpout.secureserver.net or smtp.secureserver.net
          // Port 465 for SSL or 587 for TLS
          // Note: If you see Outlook errors, your GoDaddy email may be on Office 365
          // In that case, use smtp.office365.com as SMTP_HOST instead
          const port = smtpConfig.port || 587;
          const secure = port === 465;
          
          this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: port,
            secure: secure, // true for 465, false for other ports
            auth: {
              user: smtpConfig.auth.user, // Full email address
              pass: smtpConfig.auth.pass, // Email password
            },
            tls: {
              // Do not fail on invalid certificates
              rejectUnauthorized: false,
            },
          });
          this.logger.log(`Email service configured with GoDaddy SMTP (${smtpConfig.host}:${port})`);
        } else {
          // Generic SMTP configuration
          this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port || 587,
            secure: smtpConfig.secure === true || smtpConfig.port === 465,
            auth: {
              user: smtpConfig.auth.user,
              pass: smtpConfig.auth.pass,
            },
          });
          this.logger.log(`Email service configured with ${smtpConfig.host}`);
        }
        
        this.isConfigured = true;
      } catch (error) {
        this.logger.error('Failed to configure email service', error);
        this.isConfigured = false;
      }
    } else {
      this.logger.warn('Email service not configured - SMTP settings missing. Running in DEV MODE.');
      this.logger.warn('OTP codes will be logged to console instead of being sent via email.');
      this.isConfigured = false;
    }
  }

  async sendOTP(email: string, otp: string, fullName?: string) {
    if (!this.isConfigured || !this.transporter) {
      this.logger.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      return;
    }

    const from = this.configService.get<string>('email.from');
    
    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Email Verification - RT-SYR',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Hello ${fullName || 'there'},</p>
            <p>Thank you for signing up with RT-SYR. Please use the following code to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account with RT-SYR, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">RT-SYR - Recruitments & Tenders</p>
          </div>
        `,
      });
      this.logger.log(`✅ OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP email to ${email}`, error.message);
      
      // Provide helpful error messages
      if (error.code === 'EAUTH') {
        this.logger.error(
          'Authentication failed. Please check:\n' +
          '1. SMTP credentials are correct (username and password)\n' +
          '2. For Gmail: Use App Password (not regular password)\n' +
          '3. For Office 365/Outlook (GoDaddy hosted on Office 365):\n' +
          '   - Use SMTP_HOST=smtp.office365.com\n' +
          '   - Use SMTP_PORT=587\n' +
          '   - Use full email address in SMTP_USER\n' +
          '   - Use email password (or app password if 2FA enabled) in SMTP_PASSWORD\n' +
          '4. For GoDaddy (traditional): Use full email address in SMTP_USER and email password in SMTP_PASSWORD\n' +
          '5. For SendGrid: Use API key in SMTP_PASSWORD\n' +
          '6. For Resend: Use API key in SMTP_PASSWORD\n' +
          '7. If you see Outlook errors with GoDaddy email, your account is on Office 365 - use Office 365 SMTP settings'
        );
      }
      
      // Fallback to dev mode - don't throw error, just log
      this.logger.warn(`[FALLBACK] Using DEV MODE - OTP for ${email}: ${otp}`);
      // Don't throw - allow the application to continue
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
