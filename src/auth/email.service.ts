import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const smtp = this.configService.get('email.smtp');

    if (!smtp?.host || !smtp?.auth?.user || !smtp?.auth?.pass) {
      this.logger.warn('SMTP not configured. Email sending disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: false, // STARTTLS
      auth: {
        user: smtp.auth.user,
        pass: smtp.auth.pass,
      },
    });

    this.logger.log(
      `SMTP configured: ${smtp.host}:${smtp.port} (${smtp.auth.user})`,
    );
  }

  async sendOTP(email: string, otp: string, fullName?: string) {
    if (!this.transporter) {
      this.logger.warn(`[DEV MODE] OTP for ${email}: ${otp}`);
      return;
    }

    // Use the authenticated user's email as the sender to avoid SendAsDenied errors
    const smtp = this.configService.get('email.smtp');
    const authUser = smtp?.auth?.user;
    const from = authUser 
      ? `RT-SYR <${authUser}>`
      : this.configService.get<string>('email.from') || 'RT-SYR <info@rt-syr.com>';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Email Verification - RT-SYR',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>Email Verification</h2>
            <p>Hello ${fullName || 'there'},</p>
            <p>Please use the following code to verify your email:</p>
            <div style="background:#f4f4f4;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:6px;">
              ${otp}
            </div>
            <p>This code expires in <strong>15 minutes</strong>.</p>
            <p>If you didn’t request this, please ignore this email.</p>
            <hr />
            <p style="font-size:12px;color:#666;">RT-SYR – Recruitments & Tenders</p>
          </div>
        `,
      });

      this.logger.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send OTP to ${email}`,
        error?.message || error,
      );

      if (error?.code === 'EAUTH') {
        this.logger.error(
          'SMTP Authentication failed. Check:\n' +
            '• SMTP AUTH enabled in Microsoft 365\n' +
            '• Correct password or App Password\n' +
            '• Full email used as username\n',
        );
      }

      this.logger.warn(`[FALLBACK] OTP for ${email}: ${otp}`);
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
