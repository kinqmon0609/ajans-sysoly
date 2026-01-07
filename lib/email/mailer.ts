import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Email service configuration
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'nodemailer'; // 'nodemailer' or 'resend'

// Nodemailer configuration
const nodemailerTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Resend configuration
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Send email using configured service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const from = options.from || process.env.EMAIL_FROM || 'noreply@example.com';

  try {
    if (EMAIL_SERVICE === 'resend' && resend) {
      await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } else {
      // Use Nodemailer
      await nodemailerTransport.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    }
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * Render email template with variables
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return rendered;
}

