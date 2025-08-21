// Email Service for sending verification codes
// This is a placeholder service that you can integrate with your preferred email provider

class EmailService {
  constructor() {
    // Initialize your email service configuration here
    // Examples: SendGrid, AWS SES, Nodemailer, etc.
    this.isConfigured = false
  }

  /**
   * Send verification code to user's email
   * @param {string} email - User's email address
   * @param {string} code - 6-digit verification code
   * @param {string} userName - User's name (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async sendVerificationCode(email, code, userName = '') {
    try {
      if (!this.isConfigured) {
        console.warn('Email service not configured. Verification code:', code)
        // In development, show the code in console and create a temporary notification
        // In production, this should always send via email
        
        // For development/testing purposes, we'll show the code
        // You can remove this when you configure a real email service
        if (typeof window !== 'undefined') {
          // Show code in browser console
          console.log('🔐 VERIFICATION CODE FOR TESTING:', code)
          console.log('📧 Email would be sent to:', email)
          
          // Create a temporary notification to show the code
          // This is only for development - remove in production
          const event = new CustomEvent('showVerificationCode', { 
            detail: { code, email } 
          })
          window.dispatchEvent(event)
        }
        
        return true
      }

      const subject = 'PRE Group - Email Verification Code'
      const htmlContent = this.generateVerificationEmailHTML(code, userName)
      const textContent = this.generateVerificationEmailText(code, userName)

      // TODO: Replace with your actual email service implementation
      // Example with SendGrid:
      /*
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      const msg = {
        to: email,
        from: 'noreply@pre-group.com',
        subject: subject,
        text: textContent,
        html: htmlContent,
      }
      
      await sgMail.send(msg)
      */

      // Example with AWS SES:
      /*
      const AWS = require('aws-sdk')
      const ses = new AWS.SES()
      
      const params = {
        Source: 'noreply@pre-group.com',
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Subject: {
            Data: subject
          },
          Body: {
            Html: {
              Data: htmlContent
            },
            Text: {
              Data: textContent
            }
          }
        }
      }
      
      await ses.sendEmail(params).promise()
      */

      console.log(`Verification code sent to ${email}: ${code}`)
      return true
    } catch (error) {
      console.error('Failed to send verification email:', error)
      throw new Error('Failed to send verification email. Please try again.')
    }
  }

  /**
   * Generate HTML email content for verification
   */
  generateVerificationEmailHTML(code, userName) {
    const greeting = userName ? `Hello ${userName},` : 'Hello,'
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PRE Group - Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #222222; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .verification-code { 
            background-color: #ff6b35; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 2rem; 
            font-weight: bold; 
            letter-spacing: 3px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PRE Group</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <p>${greeting}</p>
            <p>Thank you for registering with PRE Group. To complete your registration, please use the verification code below:</p>
            
            <div class="verification-code">${code}</div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
            
            <p>Enter this code in the verification page to continue with your registration.</p>
            
            <p>Best regards,<br>The PRE Group Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 PRE Group. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate plain text email content for verification
   */
  generateVerificationEmailText(code, userName) {
    const greeting = userName ? `Hello ${userName},` : 'Hello,'
    
    return `
${greeting}

Thank you for registering with PRE Group. To complete your registration, please use the verification code below:

VERIFICATION CODE: ${code}

Important:
- This code will expire in 10 minutes
- Do not share this code with anyone
- If you didn't request this code, please ignore this email

Enter this code in the verification page to continue with your registration.

Best regards,
The PRE Group Team

---
This is an automated message. Please do not reply to this email.
© 2024 PRE Group. All rights reserved.
    `
  }

  /**
   * Configure the email service with your credentials
   */
  configure(config) {
    // Example configuration object
    // {
    //   provider: 'sendgrid', // or 'ses', 'nodemailer'
    //   apiKey: 'your-api-key',
    //   fromEmail: 'noreply@pre-group.com',
    //   fromName: 'PRE Group'
    // }
    
    this.config = config
    this.isConfigured = true
    console.log('Email service configured successfully')
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Usage example:
// import { emailService } from '@/services/emailService'
// 
// // Configure the service
// emailService.configure({
//   provider: 'sendgrid',
//   apiKey: process.env.SENDGRID_API_KEY,
//   fromEmail: 'noreply@pre-group.com'
// })
// 
// // Send verification code
// await emailService.sendVerificationCode('user@example.com', '123456', 'John Doe')
