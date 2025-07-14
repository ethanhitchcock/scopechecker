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
        timeZone: 'Africa/Johannesburg'
    }).replace(/, /g, ' ');


    // --- Section out patient data for clarity ---
    const patientDetails = {
        Age: inputs.age,
        Sex: inputs.sex,
    };

    const patientSymptoms = {};
    if (inputs.rectal_bleeding === 'Yes') patientSymptoms['Rectal bleeding'] = 'Yes';
    if (inputs.bowel_habit === 'Yes') patientSymptoms['Change in bowel habit'] = 'Yes';
    if (inputs.ida === 'Yes') patientSymptoms['Iron deficiency anemia'] = 'Yes';
    if (inputs.weightloss === 'Yes') patientSymptoms['Unexplained weightloss'] = 'Yes';
    if (inputs.polyp === 'Yes') patientSymptoms['History of polyps'] = 'Yes';
    if (inputs.ibd === 'Yes') patientSymptoms['History of IBD'] = 'Yes';
    if (inputs.surveillance === 'Yes') {
        patientSymptoms['Post-surgical surveillance'] = 'Yes';
        if(inputs.last_scope_date) patientSymptoms['Date of last scope'] = inputs.last_scope_date;
    }
    
    // Translate family history codes to readable text
    if (inputs.family !== 'no') {
        const familyHistoryMap = {
            'category2': '1st-degree relative <55 OR two 1st-degree relatives',
            'category3': 'Known syndrome or >3 affected relatives'
        };
        patientSymptoms['Family history of CRC'] = familyHistoryMap[inputs.family] || 'Not specified';
    }

    const fitnessAssessment = {
        'Adequate cognition': inputs.cognition,
        'Significant comorbidity': inputs.comorbidity,
        'Requires bowel prep assistance': inputs.prep,
        'Requires sedation resources': inputs.sedation,
        'ECOG score': inputs.ecog
    };
    
    // Helper to generate bullet points for non-empty objects
    const createBulletedList = (data) => {
        const entries = Object.entries(data);
        if (entries.length === 0) return 'None';
        return entries.map(([key, value]) => `- ${key}: ${value}`).join('\n');
    };

    const createHtmlList = (data) => {
        const entries = Object.entries(data);
        if (entries.length === 0) return '<li>None</li>';
        return entries.map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('');
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
Reference: ${ref} | Completed: ${completionDate}

--- REFERRAL OUTCOME ---
${category}. 
Rationale: ${reasons.join(', ')}. 
Fitness: ${fitness.map(f => f.text).join(', ')}.

--- PATIENT DETAILS ---
${createBulletedList(patientDetails)}

--- SYMPTOMS & HISTORY ---
${createBulletedList(patientSymptoms)}

--- FITNESS ASSESSMENT ---
${createBulletedList(fitnessAssessment)}
    `;
    const htmlBody = `
        <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>A new referral has been processed.</p>
            <p><strong>Reference: #</strong>${ref} </p>
            <p><strong>Completed:</strong> ${completionDate}</p>
            
            <hr>
            
            <h3>Referral Outcome: <strong>${category}.</strong></h3>
            <p>
                <strong>Rationale:</strong> ${reasons.join(', ')}.<br>
                <strong>Fitness:</strong> ${fitness.map(f => f.text).join(', ')}.
            </p>
            
            <hr>

            <h3>Patient Details</h3>
            <ul>${createHtmlList(patientDetails)}</ul>

            <h3>Symptoms & History</h3>
            <ul>${createHtmlList(patientSymptoms)}</ul>

            <h3>Fitness Assessment</h3>
            <ul>${createHtmlList(fitnessAssessment)}</ul>
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