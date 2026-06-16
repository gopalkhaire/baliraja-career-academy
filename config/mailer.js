// config/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const from = `"Baliraja Career Academy" <${process.env.SMTP_USER}>`;

export async function sendPasswordReset(to, resetUrl) {
  await transporter.sendMail({
    from, to,
    subject: 'Password Reset — Baliraja Career Academy',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:#1a237e;">Reset Your Password</h2>
        <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="background:#1976d2;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
        </div>
        <p style="color:#999;font-size:13px;">If you didn't request this, ignore this email.</p>
      </div>`
  });
}

export async function sendApprovalNotification(to, name, status, reason = '') {
  const approved = status === 'approved';
  await transporter.sendMail({
    from, to,
    subject: `Account ${approved ? 'Approved' : 'Not Approved'} — Baliraja Career Academy`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:${approved ? '#2e7d32' : '#c62828'};">
          ${approved ? '✅ Account Approved!' : '❌ Account Not Approved'}
        </h2>
        <p>Hello <strong>${name}</strong>,</p>
        ${approved
          ? `<p>Your account has been <strong>approved</strong>. You can now <a href="${process.env.APP_URL}/login">log in here</a>.</p>`
          : `<p>Your account was <strong>not approved</strong>. ${reason ? `Reason: <em>${reason}</em>` : ''}</p><p>Please contact the academy for assistance.</p>`
        }
      </div>`
  });
}
