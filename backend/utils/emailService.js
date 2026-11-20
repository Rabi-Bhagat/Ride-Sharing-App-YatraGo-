const tls = require('tls');
let nodemailer = null;

try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Graceful fallback to built-in TLS SMTP
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : null;

  if (nodemailer && user && pass) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        requireTLS: !secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 15000
      });
    } catch (err) {
      console.warn('Nodemailer init warning:', err.message);
    }
  }

  return transporter;
}

/**
 * Native Node.js TLS SMTP Sender (Zero external npm dependencies)
 */
function sendNativeSmtp({ to, subject, html, text }) {
  return new Promise((resolve) => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : null;
    const from = process.env.EMAIL_FROM || user;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);

    if (!user || !pass) {
      console.log(`[SMTP Offline Simulation] To: ${to} | Subject: ${subject}`);
      return resolve({ success: true, simulated: true });
    }

    try {
      const socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
        // Connected
      });

      let step = 0;
      let isResolved = false;

      const finish = (result) => {
        if (!isResolved) {
          isResolved = true;
          try { socket.end(); } catch (e) {}
          resolve(result);
        }
      };

      socket.setTimeout(8000, () => {
        finish({ success: false, error: 'SMTP connection timeout' });
      });

      socket.on('error', (err) => {
        console.error(`[SMTP] connection error: ${err.message}`);
        finish({ success: false, error: err.message });
      });

      socket.on('data', (data) => {
        const msg = data.toString();
        const code = parseInt(msg.slice(0, 3), 10);

        if (code >= 400 && code < 600) {
          return finish({ success: false, error: msg.trim() });
        }

        if (step === 0) {
          // Send EHLO
          socket.write(`EHLO localhost\r\n`);
          step = 1;
        } else if (step === 1) {
          // AUTH LOGIN
          socket.write(`AUTH LOGIN\r\n`);
          step = 2;
        } else if (step === 2) {
          // Send base64 username
          socket.write(Buffer.from(user).toString('base64') + '\r\n');
          step = 3;
        } else if (step === 3) {
          // Send base64 password
          socket.write(Buffer.from(pass).toString('base64') + '\r\n');
          step = 4;
        } else if (step === 4) {
          // MAIL FROM
          socket.write(`MAIL FROM:<${user}>\r\n`);
          step = 5;
        } else if (step === 5) {
          // RCPT TO
          socket.write(`RCPT TO:<${to}>\r\n`);
          step = 6;
        } else if (step === 6) {
          // DATA
          socket.write(`DATA\r\n`);
          step = 7;
        } else if (step === 7) {
          // Send Headers and Body
          const emailData = [
            `From: ${from}`,
            `To: <${to}>`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            '',
            html || text,
            '.',
            ''
          ].join('\r\n');
          socket.write(emailData);
          step = 8;
        } else if (step === 8) {
          socket.write(`QUIT\r\n`);
          finish({ success: true });
        }
      });
    } catch (err) {
      console.error(`[SMTP] exception: ${err.message}`);
      resolve({ success: false, error: err.message });
    }
  });
}

/**
 * Send Welcome Email to newly registered user
 */
async function sendWelcomeEmail({ to, name, role }) {
  const mailer = getTransporter();
  const from = process.env.EMAIL_FROM || '"YatraGo Mobility" <rabibhagat789@gmail.com>';
  const roleDisplay = (role || 'Traveler').charAt(0).toUpperCase() + (role || 'Traveler').slice(1);
  const subject = 'Welcome to YatraGo - Your Smart Mobility Account is Active!';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b1120; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #020617; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Welcome to YatraGo!</h1>
        <p style="margin: 8px 0 0; color: #092c4c; font-size: 14px; font-weight: 700;">Smart Urban & Highway Mobility Network</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0; margin-top: 0;">Hello <strong style="color: #38bdf8;">${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
          Your YatraGo account has been successfully created with the role of <strong style="color: #34d399; text-transform: uppercase;">${roleDisplay}</strong>.
        </p>
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px; color: #38bdf8; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your Account Perks</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.8;">
            <li>100% ID Verified Community Protection</li>
            <li>Instant UPI & Razorpay Trip Cost Splitting (Save up to 44%)</li>
            <li>Zero-Emission EV, Hybrid & Moto Fleet Access</li>
            <li>24/7 SOS Emergency Guardian Dispatch</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="http://localhost:3000" style="background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); color: #020617; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 10px; display: inline-block;">
            Open YatraGo & Book Your First Ride
          </a>
        </div>
      </div>
      <div style="background-color: #020617; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b;">
        <p style="margin: 0;">© 2026 YatraGo Mobility Inc. All rights reserved.</p>
        <p style="margin: 4px 0 0;">Zero-Emission Urban & Highway Mobility Network</p>
      </div>
    </div>
  `;

  if (mailer) {
    try {
      const info = await mailer.sendMail({ from, to, subject, html });
      console.log(`[Nodemailer] Welcome email delivered to ${to} (${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (e) {
      console.error('[Nodemailer] Welcome email failed:', e.message);
      return { success: false, error: e.message };
    }
  }

  return sendNativeSmtp({ to, subject, html });
}

/**
 * Send Password Reset Email / Code
 */
async function sendPasswordResetEmail({ to, name, newPassword }) {
  const mailer = getTransporter();
  const from = process.env.EMAIL_FROM || '"YatraGo Mobility" <rabibhagat789@gmail.com>';
  const subject = 'YatraGo Security Alert: Your Password Was Reset';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b1120; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 28px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">Password Security Notice</h1>
        <p style="margin: 6px 0 0; color: #fef2f2; font-size: 13px;">Your YatraGo Security Update</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0; margin-top: 0;">Hello <strong style="color: #38bdf8;">${name || 'YatraGo User'}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
          Your account password for YatraGo was just reset successfully. You can now use your updated password to log into your account.
        </p>
        <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
          <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Your New Access Password</span>
          <code style="font-size: 18px; font-weight: 800; color: #38bdf8; background-color: #1e293b; padding: 6px 16px; border-radius: 8px; letter-spacing: 1px;">${newPassword}</code>
        </div>
        <p style="font-size: 13px; color: #f87171; line-height: 1.5;">
          ⚠️ If you did not request this password reset, please change your password immediately or contact YatraGo Support.
        </p>
      </div>
      <div style="background-color: #020617; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b;">
        <p style="margin: 0;">© 2026 YatraGo Mobility Inc. All rights reserved.</p>
      </div>
    </div>
  `;

  if (mailer) {
    try {
      const info = await mailer.sendMail({ from, to, subject, html });
      console.log(`[Nodemailer] Reset email delivered to ${to} (${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (e) {
      console.error('[Nodemailer] Reset email failed:', e.message);
      return { success: false, error: e.message };
    }
  }

  return sendNativeSmtp({ to, subject, html });
}

/**
 * Send OTP / Security Code Verification Email
 */
async function sendOtpEmail({ to, otp, subject, title, description }) {
  const mailer = getTransporter();
  const from = process.env.EMAIL_FROM || '"YatraGo Mobility" <rabibhagat789@gmail.com>';
  const emailSubject = subject || `Your YatraGo Verification Code is ${otp}`;
  const headerTitle = title || 'YatraGo Verification';
  const desc = description || 'Use the security code below to verify your account or reset your password:';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background-color: #0b1120; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #020617; font-size: 22px; font-weight: 900;">${headerTitle}</h1>
        <p style="margin: 4px 0 0; color: #0f172a; font-size: 13px; font-weight: 700;">One-Time Security Passcode</p>
      </div>
      <div style="padding: 28px 24px; text-align: center;">
        <p style="font-size: 14px; color: #94a3b8; margin: 0 0 16px;">${desc}</p>
        <div style="display: inline-block; background-color: #0f172a; border: 2px dashed #06b6d4; border-radius: 12px; padding: 14px 32px; letter-spacing: 6px; font-size: 28px; font-weight: 900; color: #38bdf8; font-family: monospace;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 20px 0 0;">This code will expire in 15 minutes. Please enter this code into the previous code / verification field.</p>
      </div>
      <div style="background-color: #020617; padding: 16px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid #1e293b;">
        © 2026 YatraGo Mobility Inc. All rights reserved.
      </div>
    </div>
  `;

  if (mailer) {
    try {
      const info = await mailer.sendMail({ from, to, subject: emailSubject, html });
      console.log(`[Nodemailer] Code email delivered to ${to} (${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (e) {
      console.error('[Nodemailer] Code email failed:', e.message);
      return { success: false, error: e.message };
    }
  }

  return sendNativeSmtp({ to, subject: emailSubject, html });
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOtpEmail
};
