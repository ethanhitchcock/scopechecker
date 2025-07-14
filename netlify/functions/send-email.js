// Load environment variables for local development
require('dotenv').config();
const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
    // We only accept POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const referralData = JSON.parse(event.body);
    const { ref, category, reasons, fitness, inputs } = referralData;

    // --- Filter for Notable Inputs ---
    const notableInputs = {};
    // Always include demographics
    notableInputs.age = inputs.age;
    notableInputs.sex = inputs.sex;

    if (inputs.rectal_bleeding === 'Yes') notableInputs.rectal_bleeding = 'Yes';
    if (inputs.bowel_habit === 'Yes') notableInputs.bowel_habit = 'Yes';
    if (inputs.ida === 'Yes') notableInputs.ida = 'Yes';
    if (inputs.weightloss === 'Yes') notableInputs.weightloss = 'Yes';
    if (inputs.polyp === 'Yes') notableInputs.polyp = 'Yes';
    if (inputs.ibd === 'Yes') notableInputs.ibd = 'Yes';
    if (inputs.surveillance === 'Yes') {
        notableInputs.surveillance = 'Yes';
        if(inputs.last_scope_date) notableInputs.last_scope_date = inputs.last_scope_date;
    }
    if (inputs.family !== 'no') notableInputs.family = inputs.family;

    // Always include fitness data as it's always notable
    const fitnessInputs = {
        cognition: inputs.cognition,
        comorbidity: inputs.comorbidity,
        prep: inputs.prep,
        sedation: inputs.sedation,
        ecog: inputs.ecog
    };

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
    const subject = `New Scope Referral [Ref: ${ref}] - ${category}`;
    const textBody = `
A new referral has been processed.
Reference #: ${ref}

--- REFERRAL OUTCOME ---
Category: ${category}
Clinical Rationale:
- ${reasons.join('\n- ')}

Fitness Summary:
- ${fitness.map(f => f.text).join('\n- ')}

--- NOTABLE PATIENT INPUTS ---
${Object.entries(notableInputs).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`).join('\n')}

--- FITNESS ASSESSMENT DETAILS ---
${Object.entries(fitnessInputs).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `;
    const htmlBody = `
        <p>A new referral has been processed.</p>
        <p><strong>Reference #: ${ref}</strong></p>
        
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
        
        <h3>Notable Patient Inputs</h3>
        <pre><code>${Object.entries(notableInputs).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`).join('\n')}</code></pre>

        <h3>Fitness Assessment Details</h3>
        <pre><code>${Object.entries(fitnessInputs).map(([key, value]) => `${key}: ${value}`).join('\n')}</code></pre>
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