const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || smtpPort === 465;
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'Perfect Date <onboarding@resend.dev>';
const testEmailRecipient = process.env.TEST_EMAIL || emailUser;

function ensureEmailConfigured() {
    if (!resendApiKey && (!emailUser || !emailPassword)) {
        throw new Error('Email is not configured. Set RESEND_API_KEY, or set EMAIL_USER and EMAIL_PASSWORD.');
    }
}

async function sendEmail({ to, subject, html, text }) {
    ensureEmailConfigured();

    if (resendApiKey) {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: emailFrom,
                to,
                subject,
                html,
                text
            })
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || `Resend API error: ${response.status}`);
        }

        return result;
    }

    return transporter.sendMail({
        from: emailUser,
        to,
        subject,
        html,
        text
    });
}

// Middleware
app.use(cors({
  origin: [
    'https://dating-web-pink.vercel.app',
    'http://localhost:3001',
    'http://localhost:3002'
  ]
}));
app.use(express.json());
app.use(express.static('.'));

// Google Calendar Setup
const calendar = google.calendar('v3');

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

// Set credentials
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Email transporter (Gmail)
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure,
    auth: {
        user: emailUser,
        pass: emailPassword
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
});
// Verify transporter configuration

if (resendApiKey) {
    console.log('Email service: Resend configured');
} else if (emailUser && emailPassword) {
    transporter.verify((error) => {
        if (error) {
            console.log("SMTP Error:", {
                code: error.code,
                command: error.command,
                message: error.message,
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure
            });
        } else {
            console.log(`SMTP Ready: ${smtpHost}:${smtpPort}`);
        }
    });
} else {
    console.warn("Email not configured: missing RESEND_API_KEY or SMTP credentials");
}

// API endpoint to save date and send email + calendar invite
app.post('/api/save-date', async (req, res) => {
    try {
        const { date, time, foods, adventures, email } = req.body;

        // Validate input
        if (!date || !time || !foods || !adventures || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Parse date
        const dateObj = new Date(date);
        const timeMap = {
            'morning': '09:00',
            'afternoon': '14:00',
            'evening': '18:00',
            'night': '20:00'
        };
        const eventTime = timeMap[time] || '14:00';
        const [hours, minutes] = eventTime.split(':');
        const startTime = new Date(dateObj);
        startTime.setHours(parseInt(hours), parseInt(minutes), 0);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);

        // Format display values
        const foodLabels = {
            'pizza': 'Pizza 🍕',
            'burger': 'Burger 🍔',
            'coffee': 'Coffee ☕',
            'tea': 'Tea 🍵',
            'momos': 'Momos 🥟',
            'pasta': 'Pasta 🍝',
            'icecream': 'Ice Cream 🍦',
            'sushi': 'Sushi 🍣'
        };

        const adventureLabels = {
            'amusement_park': 'Amusement Park 🎡',
            'water_park': 'Water Park 🌊',
            'hiking': 'Hiking ⛰️',
            'comedy_show': 'Comedy Show 🎭',
            'movie': 'Movie Night 🎬',
            'picnic': 'Picnic 🧺',
            'car_ride': 'Car Ride 🚗',
            'travelling': 'Travelling ✈️',
            'gaming_zone': 'Gaming Zone 🎮'
        };

        const foodsText = foods.map(f => foodLabels[f] || f).join(', ');
        const adventuresText = adventures.map(a => adventureLabels[a] || a).join(', ');

        // Step 1: Add to Google Calendar
        const event = {
            summary: "Our Perfect Date! 💕",
            description: `Food: ${foodsText}\n\nAdventures: ${adventuresText}\n\nThis is going to be amazing!`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'UTC'
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC'
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 }
                ]
            },
            guests: [
                {
                    email: email,
                    responseStatus: 'accepted'
                }
            ]
        };

        // Insert event to Google Calendar
        const calendarEvent = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            resource: event,
            sendNotifications: true
        });

        // Step 2: Send confirmation email
        const timeLabels = {
            'morning': 'Morning ☀️ (8AM - 12PM)',
            'afternoon': 'Afternoon 🌤️ (12PM - 5PM)',
            'evening': 'Evening 🌅 (5PM - 8PM)',
            'night': 'Night 🌙 (8PM onwards)'
        };

        const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        h1 { color: #764ba2; text-align: center; }
        .details { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .detail { margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .detail-label { font-weight: bold; font-size: 12px; text-transform: uppercase; }
        .detail-value { font-size: 16px; margin-top: 5px; }
        .footer { text-align: center; color: #888; margin-top: 30px; font-size: 12px; }
        .emoji { font-size: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji" style="text-align: center; font-size: 50px;">💕</div>
        <h1>Congrats! It's a Date! 🎉</h1>
        
        <p style="text-align: center; color: #666; font-size: 16px;">
            Get ready for something amazing! An event has been added to your Google Calendar.
        </p>
        
        <div class="details">
            <div class="detail">
                <div class="detail-label">📅 When?</div>
                <div class="detail-value">${dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${timeLabels[time]}</div>
            </div>
            
            <div class="detail">
                <div class="detail-label">😋 What to eat?</div>
                <div class="detail-value">${foodsText}</div>
            </div>
            
            <div class="detail">
                <div class="detail-label">🎢 Adventures?</div>
                <div class="detail-value">${adventuresText}</div>
            </div>
        </div>
        
        <p style="text-align: center; color: #764ba2; font-weight: bold; font-size: 16px; margin-top: 30px;">
            This is going to be the most magical day ever! ✨<br>
            Can't wait to see you! 😊
        </p>
        
        <div class="footer">
            <p>Calendar event created with reminders - Check your Google Calendar for notifications!</p>
            <p>Made with 💕 by Perfect Date App</p>
        </div>
    </div>
</body>
</html>
        `;

        await sendEmail({
            to: email,
            subject: "🎉 It's a Date! Your Perfect Date Plan is Ready",
            html: emailContent
        });

        res.json({
            success: true,
            message: 'Date saved! Email sent and calendar event created!',
            eventId: calendarEvent.data.id
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred'
        });
    }
});

// API endpoint to send date notification email
app.post('/api/send-date-notification', async (req, res) => {
    try {
        const { date, time, email } = req.body;

        // Validate input
        if (!date || !time || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Parse date
        const dateObj = new Date(date);
        
        const timeLabels = {
            'morning': 'Morning ☀️ (8AM - 12PM)',
            'afternoon': 'Afternoon 🌤️ (12PM - 5PM)',
            'evening': 'Evening 🌅 (5PM - 8PM)',
            'night': 'Night 🌙 (8PM onwards)'
        };

        const dateString = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Email template for date notification
        const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        h1 { color: #764ba2; text-align: center; }
        .date-info { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .date-info h2 { margin: 0; font-size: 24px; }
        .date-info p { margin: 10px 0 0 0; font-size: 18px; }
        .emoji { font-size: 40px; }
        .message { text-align: center; color: #666; margin: 20px 0; font-size: 16px; }
        .footer { text-align: center; color: #888; margin-top: 30px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji" style="text-align: center; font-size: 60px;">📅✨</div>
        <h1>Date Fixed! 🎉</h1>
        
        <p style="text-align: center; color: #666; font-size: 16px;">
            You're all set! Here's your date details:
        </p>
        
        <div class="date-info">
            <p>📅 <strong>${dateString}</strong></p>
            <p>🕐 <strong>${timeLabels[time]}</strong></p>
        </div>
        
        <div class="message">
            <p>You're just a few steps away from completing your perfect date plan! 💕</p>
            <p>Next, we'll pick some amazing foods and adventures together!</p>
        </div>
        
        <div class="footer">
            <p>This email confirms your date has been locked in!</p>
            <p>Made with 💕 by Perfect Date App</p>
        </div>
    </div>
</body>
</html>
        `;

        // Send notification email
        await sendEmail({
            to: email,
            subject: "✅ Date Fixed! 📅 " + dateString,
            html: emailContent
        });

        res.json({
            success: true,
            message: 'Date notification email sent!'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred'
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
// sample test endpoint

app.get('/test-email', async (req, res) => {
    try {
        if (!testEmailRecipient) {
            return res.status(400).json({ error: 'Set TEST_EMAIL or EMAIL_USER before using /test-email.' });
        }

        const info = await sendEmail({
            to: testEmailRecipient,
            subject: 'Test Email',
            text: 'Hello from Render'
        });

        res.json(info);
    } catch (err) {
        console.error('TEST EMAIL ERROR:', err);
        res.status(500).json(err);
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Email service: ${resendApiKey ? 'Resend' : `${smtpHost}:${smtpPort}`}`);
    console.log('Google Calendar API: Connected');
});
