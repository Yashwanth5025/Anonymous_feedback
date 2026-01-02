import nodemailer from 'nodemailer'

// Create transporter - you'll need to configure this with your email service
// For Gmail, you'll need an App Password: https://support.google.com/accounts/answer/185833
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
})

export async function sendAccessTokenEmail(
  email: string,
  formTitle: string,
  accessToken: string,
  formId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const formUrl = `${baseUrl}/feedback/${formId}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Access Token for ${formTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Private Feedback Form Access</h2>
        <p>You have been granted access to provide feedback for: <strong>${formTitle}</strong></p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2563eb;">
            Your Access Token: <code style="background-color: white; padding: 5px 10px; border-radius: 3px;">${accessToken}</code>
          </p>
        </div>
        <p>To access the form:</p>
        <ol>
          <li>Click on the form: <a href="${formUrl}" style="color: #2563eb;">${formTitle}</a></li>
          <li>Enter your access token when prompted</li>
          <li>Complete the feedback form</li>
        </ol>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          <strong>Important:</strong> This token can only be used once. Keep it secure and do not share it with others.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you did not expect this email, please ignore it.
        </p>
      </div>
    `,
    text: `
Private Feedback Form Access

You have been granted access to provide feedback for: ${formTitle}

Your Access Token: ${accessToken}

To access the form:
1. Visit: ${formUrl}
2. Enter your access token when prompted
3. Complete the feedback form

Important: This token can only be used once. Keep it secure and do not share it with others.

If you did not expect this email, please ignore it.
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Generate a unique ID
export function generateUID(): string {
  // Generate a random string of 12 characters (alphanumeric)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let uid = ''
  for (let i = 0; i < 12; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return uid
}

