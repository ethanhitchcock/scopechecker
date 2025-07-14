# ScopeChecker: Endoscopy Referral & Triage Tool

ScopeChecker is a web-based clinical decision support tool designed to help healthcare professionals triage colonoscopy referrals efficiently, consistently, and in accordance with established guidelines. It assesses patient-provided information to generate a clear, actionable referral recommendation, and automatically notifies the appropriate clerical staff for eligible cases.

![ScopeChecker Screenshot](https://github.com/ethanhitchcock/scopechecker/blob/main/ScopeChecker-Screenshot.png?raw=true)

## How It Works

1.  **Data Entry:** The user fills out the patient's demographics, clinical symptoms, and a fitness assessment questionnaire.
2.  **Triage Assessment:** On submission, the tool's JavaScript logic evaluates the inputs against a robust set of clinical rules.
3.  **Instant Outcome:** The UI dynamically displays a clear recommendation (e.g., "Urgent Colonoscopy," "Routine," or "Does not meet criteria"), along with the specific clinical rationale.
4.  **Email Notification:** If the patient is deemed fit and qualifies for a procedure, a serverless function is triggered to send a formatted email summary to a pre-configured address.
5.  **Tracking:** A unique reference number and completion timestamp are generated for each assessment, aiding in tracking and record-keeping.

## Key Features

### Clinical & Functional
-   **Dynamic Triage Logic:** Assesses patient symptoms, history, and fitness to determine urgency.
-   **Clear, Color-Coded Outcomes:** Classifies referrals into distinct categories for immediate clarity.
-   **Detailed Clinical Rationale:** Provides the specific reasons supporting each recommendation.
-   **Automated Email Notifications:** Sends detailed referral summaries for eligible patients.
-   **Unique Reference Number:** Generates a 6-character ID for tracking.
-   **Bowel Prep Instructions:** Conditionally displays detailed bowel prep info when relevant.

### Technical
-   **Modern & Responsive UI:** A clean, minimalist interface that works seamlessly on desktop and mobile.
-   **"Copy Debug Info" Button:** Allows for easy copying of all form inputs and assessment outputs for testing or documentation.
-   **Serverless Architecture:** Uses Netlify Functions for a scalable, low-maintenance backend.
-   **No Frontend Frameworks:** Built with vanilla HTML, CSS, and JavaScript for maximum simplicity and performance.

## Technology Stack

-   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
-   **Backend:** Node.js on Netlify Serverless Functions
-   **Email:** Nodemailer with Gmail
-   **Deployment & Hosting:** Netlify

## Project Structure

```
.
├── netlify/
│   └── functions/
│       └── send-email.js   # Serverless function for email notifications
├── .gitignore
├── index.html              # Main application structure and form
├── netlify.toml            # Netlify deployment configuration
├── package.json            # Backend dependencies (for Netlify function)
├── README.md               # This file
├── script.js               # Core triage logic and frontend interactivity
└── style.css               # All styles, variables, and responsive design
```

## Setup & Deployment

### 1. Local Development

To run the tool on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ethanhitchcock/scopechecker.git
    cd scopechecker
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables for email:**
    -   Create a file named `.env` in the project root.
    -   Add your Gmail credentials to this file. This is for *local testing only* and the file is ignored by Git.
        ```
        GMAIL_USER=your_email@gmail.com
        GMAIL_APP_PASSWORD=your_16_digit_app_password
        ```
        *Note: You need to generate a 16-character [Google App Password](https://support.google.com/accounts/answer/185833) to use Gmail for sending emails via third-party apps.*

4.  **Run the development server:**
    -   The Netlify CLI provides a convenient way to run the frontend and emulate the serverless functions locally.
    ```bash
    netlify dev
    ```
    This will start a server, typically at `http://localhost:8888`.

### 2. Deployment to Netlify

This project is configured for one-click deployment to Netlify.

1.  **Push your code to a GitHub repository.**

2.  **Connect your repository to Netlify.**
    -   Log in to Netlify and select "Add new site" -> "Import an existing project".
    -   Choose your Git provider and select your repository.

3.  **Configure Build Settings & Environment Variables:**
    -   Netlify will automatically detect the `netlify.toml` file and apply the correct build settings.
    -   Go to your new site's settings on Netlify.
    -   Navigate to **Site settings > Build & deploy > Environment**.
    -   Add the same `GMAIL_USER` and `GMAIL_APP_PASSWORD` environment variables that you used locally.

4.  **Deploy:**
    -   Trigger a deploy from the "Deploys" tab. Netlify will build and deploy your site and serverless function. 