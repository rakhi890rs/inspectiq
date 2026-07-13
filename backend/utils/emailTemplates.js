export const verificationEmailTemplate = (name, verifyUrl) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: auto;">
    <h2 style="color:#111827;">Welcome to SafeBuild AI, ${name}</h2>
    <p style="color:#6B7280;">Please verify your email address to activate your account.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#F97316;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
      Verify Email
    </a>
    <p style="color:#6B7280;font-size:12px;margin-top:20px;">This link expires in 24 hours.</p>
  </div>
`;

export const resetPasswordEmailTemplate = (name, resetUrl) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: auto;">
    <h2 style="color:#111827;">Password Reset Request</h2>
    <p style="color:#6B7280;">Hi ${name}, click the button below to reset your password.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#F97316;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
      Reset Password
    </a>
    <p style="color:#6B7280;font-size:12px;margin-top:20px;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;
