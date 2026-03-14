const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Email not configured, skipping...', { to, subject });
    return;
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendWhatsApp = async ({ to, message }) => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH) {
    console.log('📱 WhatsApp not configured, skipping...');
    return;
  }
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(`📱 WhatsApp sent to ${to}`);
  } catch (err) {
    console.error('WhatsApp error:', err.message);
  }
};

const sendNotification = async ({ type, playerName, teamName, amount, teamOwnerEmail, teamOwnerPhone }) => {
  if (type === 'sold') {
    const subject = `🏏 ${playerName} SOLD!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 30px; border-radius: 10px;">
        <h1 style="color: #ffd700; text-align: center;">🏏 IPL Auction Update</h1>
        <div style="background: #16213e; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #e94560;">${playerName}</h2>
          <p style="font-size: 18px;">Has been <strong style="color: #00d4ff;">SOLD</strong></p>
          <h3 style="color: #ffd700;">To: ${teamName}</h3>
          <h2 style="color: #00ff88;">₹${amount} Lakhs</h2>
        </div>
        <p style="text-align: center; color: #888; margin-top: 20px;">IPL Auction Platform</p>
      </div>
    `;

    if (teamOwnerEmail) {
      await sendEmail({ to: teamOwnerEmail, subject, html });
    }

    if (teamOwnerPhone) {
      await sendWhatsApp({
        to: teamOwnerPhone,
        message: `🏏 *IPL Auction Update*\n\n${playerName} has been SOLD to *${teamName}* for ₹${amount} Lakhs! 🎉`,
      });
    }
  }
};

module.exports = { sendEmail, sendWhatsApp, sendNotification };
