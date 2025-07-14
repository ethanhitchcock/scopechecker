# Endoscopy Referral Tool

This is a web-based clinical decision support tool designed to help healthcare professionals triage colonoscopy referrals efficiently and consistently. It assesses patient information against established clinical guidelines to recommend an appropriate referral pathway.

## Features

- **Dynamic Triage Logic:** Automatically assesses patient symptoms, age, family history, and fitness to determine the urgency of the referral.
- **Clear, Color-Coded Outcomes:** Classifies referrals into distinct, color-coded categories for immediate visual clarity:
    - 🔴 **Urgent Colonoscopy Recommended**
    - 🟡 **Routine Colonoscopy Recommended**
    - 🔵 **Routine Surveillance Colonoscopy**
    - ⚪️ **Does not meet direct access criteria**
- **Detailed Rationale:** Provides specific clinical reasons and fitness assessments to support the final recommendation.
- **Conditional Bowel Prep Instructions:** Displays detailed, placeholder instructions for bowel preparation only when a colonoscopy is recommended and the patient is deemed fit.
- **Debug Information:** Includes a "Copy Debug Info" button to capture all form inputs and assessment outputs, facilitating case discussions or record-keeping.
- **Modern & Responsive UI:** A clean, card-based interface that is easy to use on both desktop and mobile devices.

## How to Use

This is a client-side application that can be run locally using any simple web server. The production version uses Netlify Functions to handle email notifications.

### Local Development

1.  **Ensure you have Python installed.** Python 3 is recommended for running a simple local server.
2.  **Navigate to the project directory** in your terminal.
3.  **Start a local web server:**
    ```bash
    python -m http.server
    ```
4.  **Open the tool in your browser:**
    Navigate to [http://localhost:8000](http://localhost:8000)

### Deployment

This project is configured for easy deployment to [Netlify](https://www.netlify.com/).

1.  **Install the Netlify CLI:**
    ```bash
    npm install netlify-cli -g
    ```
2.  **Login to your Netlify account:**
    ```bash
    netlify login
    ```
3.  **Deploy the site:**
    ```bash
    netlify deploy --prod
    ```
    Follow the prompts to create and configure a new site.

4.  **Configure Environment Variables for Email:**
    - Go to your new site's settings on Netlify.
    - Navigate to **Site settings > Build & deploy > Environment**.
    - Add the following environment variables:
        - `GMAIL_USER`: Your full Gmail address used for sending notifications.
        - `GMAIL_APP_PASSWORD`: A 16-character [Google App Password](https://support.google.com/accounts/answer/185833) for your account.
    - Trigger a new deploy from the "Deploys" tab for the variables to take effect.

## File Structure

-   `index.html`: The main HTML file containing the structure of the referral form and result display areas.
-   `style.css`: The stylesheet that defines the visual appearance, layout, and responsive design of the tool.
-   `script.js`: Contains all the client-side logic, including the core `assessReferral` function, UI updates, and the call to the email notification function.
-   `netlify/functions/send-email.js`: The serverless function that handles sending email notifications using Nodemailer.
-   `netlify.toml`: Configuration file for deploying the site and its functions to Netlify.
-   `package.json`: Defines the backend dependencies for the serverless function.
-   `README.md`: This file. 