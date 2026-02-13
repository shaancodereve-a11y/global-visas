import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log("[EMAIL] SMTP not configured. Emails will be logged to console.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendOtpEmail(to: string, code: string, type: string) {
  const subject = type === "verify"
    ? "Global Visas - Verify Your Email"
    : "Global Visas - Login Verification Code";

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0C51AC; margin: 0;">Global Visas</h2>
      </div>
      <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="color: #1e293b; margin-top: 0;">${type === "verify" ? "Verify Your Email" : "Login Verification"}</h3>
        <p style="color: #64748b; font-size: 14px;">
          ${type === "verify"
            ? "Thank you for registering with Global Visas. Please use the code below to verify your email address."
            : "Enter the code below to complete your login."
          }
        </p>
        <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0C51AC;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    </div>
  `;

  const t = getTransporter();
  if (t) {
    try {
      await t.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      console.log(`[EMAIL] Sent OTP email to ${to}`);
    } catch (error) {
      console.error(`[EMAIL] Failed to send to ${to}:`, error);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[EMAIL] OTP for ${to}: ${code}`);
      }
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[EMAIL] OTP for ${to}: ${code}`);
    } else {
      console.error(`[EMAIL] SMTP not configured in production. Cannot send OTP to ${to}.`);
    }
  }
}

export async function sendStatusNotification(
  to: string,
  applicantName: string,
  status: string,
  adminNotes?: string
) {
  const statusLabels: Record<string, string> = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    approved: "#16a34a",
    rejected: "#dc2626",
  };

  const subject = `Global Visas - Application ${statusLabels[status] || status}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0C51AC; margin: 0;">Global Visas</h2>
      </div>
      <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="color: #1e293b; margin-top: 0;">Application Status Update</h3>
        <p style="color: #64748b; font-size: 14px;">Dear ${applicantName},</p>
        <p style="color: #64748b; font-size: 14px;">Your Visitor Visa (Subclass 600) application status has been updated to:</p>
        <div style="text-align: center; padding: 16px; background: #f1f5f9; border-radius: 8px; margin: 16px 0;">
          <span style="font-size: 18px; font-weight: bold; color: ${statusColors[status] || "#1e293b"};">
            ${statusLabels[status] || status}
          </span>
        </div>
        ${adminNotes ? `<p style="color: #64748b; font-size: 14px;"><strong>Notes:</strong> ${adminNotes}</p>` : ""}
        <p style="color: #64748b; font-size: 14px;">Log in to your account to view full details.</p>
      </div>
    </div>
  `;

  const t = getTransporter();
  if (t) {
    try {
      await t.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      console.log(`[EMAIL] Sent status notification to ${to}`);
    } catch (error) {
      console.error(`[EMAIL] Failed to send status notification to ${to}:`, error);
    }
  } else {
    console.log(`[EMAIL] Status notification for ${to}: ${status}`);
  }
}

export async function sendAdminNotification(
  adminEmail: string,
  applicantName: string,
  applicantEmail: string,
  action: string
) {
  const subject = `Global Visas Admin - New ${action}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0C51AC; margin: 0;">Global Visas - Admin</h2>
      </div>
      <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="color: #1e293b; margin-top: 0;">New ${action}</h3>
        <p style="color: #64748b; font-size: 14px;"><strong>Applicant:</strong> ${applicantName}</p>
        <p style="color: #64748b; font-size: 14px;"><strong>Email:</strong> ${applicantEmail}</p>
        <p style="color: #64748b; font-size: 14px;">Log in to the admin dashboard to review.</p>
      </div>
    </div>
  `;

  const t = getTransporter();
  if (t) {
    try {
      await t.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        subject,
        html,
      });
    } catch (error) {
      console.error(`[EMAIL] Failed to send admin notification:`, error);
    }
  } else {
    console.log(`[EMAIL] Admin notification: ${action} from ${applicantName} (${applicantEmail})`);
  }
}
