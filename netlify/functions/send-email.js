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
    
    // --- Generate Timestamp ---
    const completionDate = new Date().toLocaleString('en-CA', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Edmonton' 
    }).replace(/, /g, ' ');


    // --- Filter for Notable Inputs & Combine All Inputs ---
    const allInputs = {
        age: inputs.age,
        sex: inputs.sex,
    };

    if (inputs.rectal_bleeding === 'Yes') allInputs.rectal_bleeding = 'Yes';
    if (inputs.bowel_habit === 'Yes') allInputs.bowel_habit = 'Yes';
    if (inputs.ida === 'Yes') allInputs.ida = 'Yes';
    if (inputs.weightloss === 'Yes') allInputs.weightloss = 'Yes';
    if (inputs.polyp === 'Yes') allInputs.polyp = 'Yes';
    if (inputs.ibd === 'Yes') allInputs.ibd = 'Yes';
    if (inputs.surveillance === 'Yes') {
        allInputs.surveillance = 'Yes';
        if(inputs.last_scope_date) allInputs.last_scope_date = inputs.last_scope_date;
    }
    if (inputs.family !== 'no') allInputs.family = inputs.family;

    // Merge fitness data
    Object.assign(allInputs, {
        cognition: inputs.cognition,
        comorbidity: inputs.comorbidity,
        prep: inputs.prep,
        sedation: inputs.sedation,
        ecog: inputs.ecog
    });

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
Completion Time: ${completionDate}

--- REFERRAL OUTCOME ---
Category: ${category}
Clinical Rationale:
- ${reasons.join('\n- ')}

Fitness Summary:
- ${fitness.map(f => f.text).join('\n- ')}

--- PATIENT DETAILS ---
${Object.entries(allInputs).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`).join('\n')}
    `;
    const htmlBody = `
        <body style="font-family: sans-serif; color: #333;">
            <p>A new referral has been processed.</p>
            <p><strong>Reference #:</strong> ${ref}</p>
            <p><strong>Completion Time:</strong> ${completionDate}</p>
            
            <hr>
            
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
            
            <h3>Patient Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                    ${Object.entries(allInputs).map(([key, value]) => `
                        <tr>
                            <td style="padding: 4px 8px; border: 1px solid #ddd; text-transform: capitalize;">${key.replace(/_/g, ' ')}</td>
                            <td style="padding: 4px 8px; border: 1px solid #ddd;">${value}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
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