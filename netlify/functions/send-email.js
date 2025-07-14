// Load environment variables for local development
require('dotenv').config();
const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
    // We only accept POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const referralData = JSON.parse(event.body);
    const { category, reasons, fitness, inputs } = referralData;

    // --- IMPORTANT: Securely configure your email credentials ---
    // In Netlify, set these as environment variables in your site's settings.
    // In your local environment, create a .env file with these variables.
    const senderEmail = process.env.GMAIL_USER;
    const senderAppPassword = process.env.GMAIL_APP_PASSWORD;
    const recipientEmail = "ethanhitchcock@gmail.com";

    if (!senderEmail || !senderAppPassword) {
        console.error("Email credentials are not configured in environment variables.");
        return { statusCode: 500, body: 'Server error: Email service not configured.' };
    }
    
    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: senderEmail,
            pass: senderAppPassword,
        },
    });

    // --- Email Content ---
    const subject = `New Scope Referral: ${category}`;
    const textBody = `
A new referral has been processed with the following details:

--- REFERRAL OUTCOME ---
Category: ${category}
Clinical Rationale:
${reasons.join('\n- ')}

Fitness Summary:
${fitness.map(f => `- ${f.text}`).join('\n')}

--- PATIENT INPUTS ---
${Object.entries(inputs).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `;
    const htmlBody = `
        <p>A new referral has been processed with the following details:</p>
        
        <h3>Referral Outcome</h3>
        <p><strong>Category:</strong> ${category}</p>
        
        <h4>Clinical Rationale</h4>
        <ul>
            ${reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
        
        <h4>Fitness Summary</h4>
        <ul>
            ${fitness.map(f => `<li>${f.text}</li>`).join('')}
        </ul>
        
        <hr>
        
        <h3>Patient Inputs</h3>
        <pre><code>${Object.entries(inputs).map(([key, value]) => `${key}: ${value}`).join('\n')}</code></pre>
    `;

    // --- Send Mail ---
    try {
        await transporter.sendMail({
            from: `"Scope Referral Tool" <${senderEmail}>`,
            to: recipientEmail,
            subject: subject,
            text: textBody,
            html: htmlBody,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Email sent successfully." }),
        };
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error sending email." }),
        };
    }
}; 