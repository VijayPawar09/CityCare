class EmailService {
  constructor(emailProvider) {
    this.emailProvider = emailProvider || 'mock';
  }

  async sendVerificationEmail(email, fullName, verificationUrl) {
    const subject = 'Verify Your City Connect Email';
    const textContent = `
      Welcome to City Connect!

      Hi ${fullName},

      Thank you for signing up for City Connect! To complete your registration, please verify your email address by visiting:

      ${verificationUrl}

      This verification link will expire in 24 hours.

      If you didn't create an account with City Connect, please ignore this email.

      Best regards,
      The City Connect Team
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            max-width: 600px;
            margin: auto;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #28a745;
            color: white;
            border-radius: 5px;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to City Connect!</h2>
          <p>Hi ${fullName},</p>
          <p>Thanks for signing up. Please verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <p>If the button doesn’t work, paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link expires in 24 hours.</p>
          <p>Best,<br/>The City Connect Team</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendPasswordResetEmail(email, fullName, resetUrl) {
    const subject = 'Reset Your City Connect Password';
    const textContent = `
      Reset Your Password

      Hi ${fullName},

      We received a request to reset your City Connect password. Click the link below to reset it:

      ${resetUrl}

      If you did not request this, you can safely ignore this email.

      This link will expire in 10 minutes.

      - The City Connect Team
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            max-width: 600px;
            margin: auto;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #007bff;
            color: white;
            border-radius: 5px;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>Hi ${fullName},</p>
          <p>We received a request to reset your City Connect password. Click the button below to proceed:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br/>The City Connect Team</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendWelcomeEmail(email, fullName) {
    const subject = 'Welcome to City Connect!';
    const textContent = `
      Hi ${fullName},

      Welcome to City Connect! We're thrilled to have you on board.

      Explore local services, connect with others, and make the most of your city!

      Best,
      The City Connect Team
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            padding: 20px;
          }
          .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            max-width: 600px;
            margin: auto;
          }
          .header {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .footer {
            font-size: 12px;
            color: #888;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Welcome to City Connect, ${fullName}!</div>
          <p>We're thrilled to have you on board. Discover and connect with local services tailored for your needs.</p>
          <p>Get started by exploring your dashboard and connecting with the community.</p>
          <p>Best,<br/>The City Connect Team</p>
          <div class="footer">
            <p>© 2024 City Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendEmail(to, subject, htmlContent, textContent) {
    if (this.emailProvider === 'mock') {
      return this.mockSendEmail(to, subject, htmlContent, textContent);
    }

    // Add real email provider logic here
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Email provider "${this.emailProvider}" is not implemented. Using mock.`);
      return this.mockSendEmail(to, subject, htmlContent, textContent);
    }

    throw new Error(`Email provider ${this.emailProvider} not implemented`);
  }

  async mockSendEmail(to, subject, htmlContent, textContent) {
    console.log('=== Mock Email ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text Content:', textContent);
    console.log('HTML Content:', htmlContent);
    console.log('==================');
    return { success: true, message: 'Mock email sent' };
  }
}

module.exports = EmailService;

