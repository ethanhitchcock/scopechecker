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

This is a client-side application built with HTML, CSS, and JavaScript. It can be run locally using any simple web server.

1.  **Ensure you have Python installed.** Python 3 is recommended.

2.  **Navigate to the project directory** in your terminal:
    ```bash
    cd "Scope Referral tool"
    ```

3.  **Start a local web server:**
    ```bash
    python -m http.server
    ```

4.  **Open the tool in your browser:**
    Navigate to [http://localhost:8000](http://localhost:8000)

5.  **Fill out the form** with the patient's details and click the "Assess Referral" button to see the outcome.

## File Structure

-   `index.html`: The main HTML file containing the structure of the referral form and result display areas.
-   `style.css`: The stylesheet that defines the visual appearance, layout, and responsive design of the tool.
-   `script.js`: Contains all the client-side logic, including the core `assessReferral` function for triage, event handling, and dynamic UI updates.
-   `README.md`: This file. 