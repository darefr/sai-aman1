/**
 * ============================================================================
 * EMAIL / NOTIFICATIONS (nodemailer, graceful fallback)
 * ============================================================================
 *
 * When SMTP is configured the message is sent. Otherwise it is logged to the
 * server console so the flow never breaks in development or when SMTP is not
 * yet set up. Never throws to the caller — email is best-effort.
 * ============================================================================
 */

import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'
import { env, isSmtpConfigured } from '@/lib/env'
import { baseEmail } from './templates'

export type SendEmailInput = {
  to: string
  subject: string
  /** Pre-rendered inner HTML (wrapped in the branded shell automatically). */
  html: string
  /** Optional plain-text fallback. */
  text?: string
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!isSmtpConfigured()) return null
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: Number(env.SMTP_PORT) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  })
  return transporter
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<{ sent: boolean }> {
  const wrapped = baseEmail(subject, html)
  const tx = getTransporter()

  if (!tx) {
    console.log(
      `[v0][email] SMTP not configured — email not sent.\n  To: ${to}\n  Subject: ${subject}`,
    )
    return { sent: false }
  }

  try {
    await tx.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html: wrapped,
      text: text ?? subject,
    })
    return { sent: true }
  } catch (error) {
    console.error('[v0][email] Failed to send email:', error)
    return { sent: false }
  }
}

export * from './templates'
