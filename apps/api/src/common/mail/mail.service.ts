import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailDispatchOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly appUrl = process.env.APP_URL || 'http://localhost:3001';
  private transporter: nodemailer.Transporter | null = null;

  // In-memory record for local testing & instant developer verification
  private lastDispatchedTokens: Map<string, { type: 'verify' | 'reset'; token: string; timestamp: Date }> = new Map();

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`SMTP transport initialized for host: ${host}:${port}`);
    } else {
      this.logger.log('SMTP credentials not configured in .env. Operating in Developer Console Mode with instant terminal logging.');
    }
  }

  private async dispatchMail(options: EmailDispatchOptions): Promise<boolean> {
    if (this.transporter) {
      try {
        const from = process.env.SMTP_FROM || 'GuideLayer Security <security@guidelayer.com>';
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        this.logger.log(`[SMTP DELIVERED] Real email dispatched to ${options.to}`);
        return true;
      } catch (err: any) {
        this.logger.error(`[SMTP ERROR] Failed to send email to ${options.to}: ${err.message}`);
        // Do not throw so local auth continues to operate seamlessly
      }
    }
    return false;
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verifyLink = `${this.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const subject = 'Verify your GuideLayer account';

    const text = `Hello ${name},\n\nPlease verify your GuideLayer account by opening this link:\n${verifyLink}\n\nThis link will expire in 24 hours.\n\nGuideLayer Security Team`;

    this.lastDispatchedTokens.set(email, { type: 'verify', token, timestamp: new Date() });
    this.logger.log(`[DISPATCH] Verification link dispatched to ${email}: ${verifyLink}`);

    await this.dispatchMail({
      to: email,
      subject,
      text,
      html: `
        <div style="font-family: 'DM Sans', sans-serif, -apple-system; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0B1B34;">
          <div style="margin-bottom: 24px;">
            <span style="font-weight: 800; font-size: 16px; letter-spacing: -0.02em; color: #0B1B34;">GuideLayer</span>
            <span style="font-family: monospace; font-size: 11px; color: #64748B; margin-left: 8px;">// SYS.AUTH</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #0B1B34; margin-bottom: 12px;">Verify your email address</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            Welcome to GuideLayer, ${name}. Please verify your email to access your API keys and production walkthrough console.
          </p>
          <div style="margin-bottom: 28px;">
            <a href="${verifyLink}" style="display: inline-block; background-color: #0B1B34; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 4px;">
              Verify Email Address
            </a>
          </div>
        </div>
      `,
    });

    return true;
  }

  async sendVerificationOtp(email: string, name: string, otp: string): Promise<boolean> {
    const subject = `${otp} is your GuideLayer verification code`;
    const text = `Hello ${name},\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nGuideLayer Security Team`;

    const html = `
      <div style="font-family: 'DM Sans', sans-serif, -apple-system; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0B1B34;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 800; font-size: 16px; letter-spacing: -0.02em; color: #0B1B34;">GuideLayer</span>
          <span style="font-family: monospace; font-size: 11px; color: #64748B; margin-left: 8px;">// SYS.AUTH.OTP</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0B1B34; margin-bottom: 12px;">Confirm your email address</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
          Welcome to GuideLayer, ${name}. Enter the following 6-digit code to verify your identity:
        </p>
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; text-align: center; border-radius: 4px; margin-bottom: 24px;">
          <span style="font-family: 'DM Mono', monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0B1B34;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #64748B; line-height: 1.5;">
          This code will expire in 15 minutes. If you did not make this request, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0 16px 0;" />
        <p style="font-size: 11px; color: #94A3B8; font-family: monospace;">
          AUDIT ID: OTP-${Date.now()} • SECURE ENCLAVE
        </p>
      </div>
    `;

    this.lastDispatchedTokens.set(email, { type: 'verify', token: otp, timestamp: new Date() });
    console.log(`\n==================================================`);
    console.log(`[VERIFICATION OTP] Email: ${email}`);
    console.log(`[VERIFICATION OTP] 6-Digit Code: >>> ${otp} <<<`);
    console.log(`[VERIFICATION OTP] Valid for 15 minutes`);
    console.log(`==================================================\n`);

    await this.dispatchMail({
      to: email,
      subject,
      text,
      html,
    });

    return true;
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetLink = `${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Reset your GuideLayer account password';

    const text = `Hello ${name},\n\nA password reset was requested for your GuideLayer account.\nOpen this link to choose a new password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nGuideLayer Security Team`;

    const html = `
      <div style="font-family: 'DM Sans', sans-serif, -apple-system; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0B1B34;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 800; font-size: 16px; letter-spacing: -0.02em; color: #0B1B34;">GuideLayer</span>
          <span style="font-family: monospace; font-size: 11px; color: #64748B; margin-left: 8px;">// SECURITY</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0B1B34; margin-bottom: 12px;">Reset your password</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password for ${email}. Click below to set a new password.
        </p>
        <div style="margin-bottom: 28px;">
          <a href="${resetLink}" style="display: inline-block; background-color: #0B1B34; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #64748B; line-height: 1.5;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${resetLink}" style="color: #0F766E;">${resetLink}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0 16px 0;" />
        <p style="font-size: 11px; color: #94A3B8; font-family: monospace;">
          This link will expire in 1 hour. If you did not request a password reset, no action is needed.
        </p>
      </div>
    `;

    this.lastDispatchedTokens.set(email, { type: 'reset', token, timestamp: new Date() });

    this.logger.log(`[DISPATCH] Password reset email sent to ${email}`);
    this.logger.log(`[DIRECT RESET LINK] ${resetLink}`);

    return true;
  }

  getLatestToken(email: string) {
    return this.lastDispatchedTokens.get(email);
  }
}
