import sgMail from '@sendgrid/mail';
import { env } from '../config/env.config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  constructor() {
    // Initialize SendGrid with API key
    if (env.SENDGRID_API_KEY) {
      sgMail.setApiKey(env.SENDGRID_API_KEY);
      console.log('✅ SendGrid email service initialized');
    } else {
      console.warn(
        '⚠️  SENDGRID_API_KEY not found. Email service will not function.'
      );
    }
  }

  /**
   * Send an email using SendGrid
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!env.SENDGRID_API_KEY) {
      console.error(
        '❌ Cannot send email: SENDGRID_API_KEY not configured'
      );
      throw new Error('Email service not configured');
    }

    try {
      const msg = {
        to: Array.isArray(options.to) ? options.to : options.to,
        from: env.EMAIL_FROM,
        subject: options.subject,
        html: options.html || options.text || '',
        text: options.text,
      };

      const response = await sgMail.send(
        msg as sgMail.MailDataRequired
      );

      console.log(
        `✅ Email sent successfully to: ${
          Array.isArray(options.to)
            ? options.to.join(', ')
            : options.to
        }`
      );

      if (env.NODE_ENV === 'development') {
        console.log('SendGrid Response:', {
          statusCode: response[0].statusCode,
          headers: response[0].headers,
        });
      }
    } catch (error: any) {
      console.error('❌ SendGrid email send error:', {
        error: error.message,
        code: error.code,
        response: error.response?.body,
        recipient: Array.isArray(options.to)
          ? options.to.join(', ')
          : options.to,
        subject: options.subject,
      });
      console.log(env.EMAIL_FROM);

      // Provide helpful error messages
      if (error.code === 401) {
        console.error(
          'Authentication failed. Please check SENDGRID_API_KEY.'
        );
      } else if (error.code === 403) {
        console.error(
          'Forbidden. Your SendGrid account may not have permission to send emails.'
        );
        console.error('Common causes:');
        console.error('1. Sender email not verified in SendGrid');
        console.error('2. API key missing Mail Send permission');
        console.error('3. Free tier limitations');
      }

      if (error.response?.body?.errors) {
        console.error(
          'SendGrid detailed errors:',
          JSON.stringify(error.response.body.errors, null, 2)
        );
      }

      throw error;
    }
  }

  /**
   * Send welcome email to newsletter subscriber
   */
  async sendWelcomeEmail(
    email: string,
    name?: string
  ): Promise<void> {
    const subject = 'Welcome to Mutuals+ Newsletter!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Mutuals+! 🎵</h1>
        <p>Hi ${name || 'there'},</p>
        <p>Thank you for subscribing to the Mutuals+ newsletter!</p>
        <p>You'll now receive updates about:</p>
        <ul>
          <li>Emerging artists, DJs, and designers</li>
          <li>Curated playlists and mixes</li>
          <li>Exclusive events</li>
          <li>Limited merchandise drops</li>
        </ul>
        <p>Stay tuned for amazing content!</p>
        <p style="margin-top: 30px;">
          Best regards,<br/>
          The Mutuals+ Team
        </p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactNotification(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<void> {
    const subject = `New Contact Form Submission: ${
      data.subject || 'No Subject'
    }`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${
          data.subject || 'No Subject'
        }</p>
        <p><strong>Message:</strong></p>
        <p style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #333;">
          ${data.message}
        </p>
      </div>
    `;

    await this.sendEmail({ to: env.EMAIL_INFO, subject, html });
  }

  /**
   * Send artist submission notification to admin
   */
  async sendArtistSubmissionNotification(data: {
    name: string;
    email: string;
    role: string;
    pitchMessage: string;
  }): Promise<void> {
    const subject = `New Artist Submission: ${data.name} (${data.role})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Artist Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Category:</strong> ${data.role}</p>
        <p><strong>Description:</strong></p>
        <p style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #333;">
          ${data.pitchMessage}
        </p>
      </div>
    `;

    await this.sendEmail({
      to: env.EMAIL_SUBMISSIONS,
      subject,
      html,
    });
  }

  /**
   * Send submission confirmation to user
   */
  async sendSubmissionConfirmation(
    email: string,
    name: string,
    type: 'contact' | 'artist'
  ): Promise<void> {
    // Extract first name from full name
    const firstName = name.split(' ')[0];

    const subject =
      type === 'contact'
        ? 'We received your message'
        : 'We received your submission';

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We've received your submission and appreciate you sharing your work with Mutuals+.<br/>
          Our team is currently reviewing entries and typically responds within 2–3 business days.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
          While you're here, stay connected:
        </p>

        <ul style="font-size: 16px; line-height: 1.8; padding-left: 0; list-style: none; margin-bottom: 30px;">
          <li style="margin-bottom: 8px;">🎧 Curated sounds: <a href="https://mutualsplus.com/playlists" style="color: #1ecbe1; text-decoration: none;">Explore Playlists</a></li>
          <li style="margin-bottom: 8px;">📲 Follow us on Instagram & X: <a href="https://instagram.com/mutualsplus" style="color: #1ecbe1; text-decoration: none;">@mutualsplus</a></li>
          <li style="margin-bottom: 8px;">✉️ Editorial drops & events: <a href="https://mutualsplus.com/#newsletter" style="color: #1ecbe1; text-decoration: none;">Subscribe to Newsletter</a></li>
        </ul>

        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
          With respect,<br/>
          <strong>Mutuals+</strong>
        </p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}

export const emailService = new EmailService();
