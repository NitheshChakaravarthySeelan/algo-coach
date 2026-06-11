import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@algo-coach.com'
const APP_NAME = 'AlgoCoach'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function sendVerificationEmail(email: string, url: string) {
  if (!resend) {
    console.log(`[${APP_NAME}] Mock: verification email to ${email}: ${url}`)
    return { mock: true }
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Verify your email for ${APP_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h1 style="color: #f97316;">${APP_NAME}</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">Or paste this link: <br/>${url}</p>
      </div>
    `,
  })

  if (error) {
    console.error(`[${APP_NAME}] Failed to send verification email to ${email}:`, error)
    throw error
  }

  return { success: true }
}
