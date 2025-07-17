document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('referral-form');
    const resultContainer = document.getElementById('result-container');
    const resultContentEl = document.getElementById('result-content');
    const resultFooter = document.querySelector('.result-footer');
    const debugBtn = document.getElementById('debug-btn');
    const emailSuccessEl = document.getElementById('email-success-notification');
    const surveillanceRadios = document.querySelectorAll('input[name="surveillance"]');
    const lastScopeContainer = document.getElementById('last-scope-container');
    const bowelPrepContainer = document.getElementById('bowel-prep-container');

    let lastInputs = {};
    let lastResult = {};

    // --- Initialize Form Enhancements ---
    initializeFormValidation();
    initializeAccessibilityFeatures();

    // --- Form Validation System ---
    function initializeFormValidation() {
        const ageInput = document.getElementById('age');
        
        // Real-time age validation
        ageInput.addEventListener('input', (e) => {
            validateAgeInput(e.target);
        });

        ageInput.addEventListener('blur', (e) => {
            validateAgeInput(e.target);
        });

        // Add required field indicators
        addRequiredFieldIndicators();
        
        // Form submission validation
        form.addEventListener('submit', (e) => {
            if (!validateForm()) {
                e.preventDefault();
                showValidationErrors();
                return;
            }
        });

        // Reset confirmation
        const resetBtn = form.querySelector('button[type="reset"]');
        resetBtn.addEventListener('click', (e) => {
            if (!confirmFormReset()) {
                e.preventDefault();
            }
        });
    }

    function validateAgeInput(input) {
        const age = parseInt(input.value);
        const errorContainer = getOrCreateErrorContainer(input);
        
        if (input.value === '') {
            showFieldError(input, errorContainer, 'Age is required');
            return false;
        }
        
        if (isNaN(age) || age < 1 || age > 120) {
            showFieldError(input, errorContainer, 'Please enter a valid age (1-120)');
            return false;
        }
        
        hideFieldError(input, errorContainer);
        return true;
    }

    function validateForm() {
        const ageInput = document.getElementById('age');
        let isValid = true;

        // Validate age
        if (!validateAgeInput(ageInput)) {
            isValid = false;
        }

        // Ensure at least one radio button is selected in each required group
        const requiredGroups = ['sex'];
        requiredGroups.forEach(groupName => {
            const radios = document.querySelectorAll(`input[name="${groupName}"]`);
            const isSelected = Array.from(radios).some(radio => radio.checked);
            if (!isSelected) {
                showGroupError(radios[0], `Please select an option for ${groupName}`);
                isValid = false;
            }
        });

        return isValid;
    }

    function addRequiredFieldIndicators() {
        const requiredFields = document.querySelectorAll('input[required]');
        requiredFields.forEach(field => {
            const label = document.querySelector(`label[for="${field.id}"]`) || 
                         field.closest('.form-group').querySelector('label');
            if (label && !label.querySelector('.required-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'required-indicator';
                indicator.textContent = ' *';
                label.appendChild(indicator);
            }
        });
    }

    function getOrCreateErrorContainer(input) {
        const formGroup = input.closest('.form-group');
        let errorContainer = formGroup.querySelector('.error-message');
        
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'error-message';
            formGroup.appendChild(errorContainer);
        }
        
        return errorContainer;
    }

    function showFieldError(input, errorContainer, message) {
        input.classList.add('error');
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    function hideFieldError(input, errorContainer) {
        input.classList.remove('error');
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
    }

    function showGroupError(firstRadio, message) {
        const formGroup = firstRadio.closest('.form-group');
        const errorContainer = getOrCreateErrorContainer(firstRadio);
        formGroup.classList.add('error');
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    function confirmFormReset() {
        return confirm('Are you sure you want to reset all form data? This action cannot be undone.');
    }

    function showValidationErrors() {
        const firstError = document.querySelector('.error-message:not([style*="none"])');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Progressive disclosure system removed completely

    // --- Accessibility Features ---
    function initializeAccessibilityFeatures() {
        enhanceKeyboardNavigation();
        addAriaLabels();
        improveFocusManagement();
        addTooltips();
    }

    function enhanceKeyboardNavigation() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        if (e.target.type !== 'submit') {
                            e.preventDefault();
                            const submitBtn = form.querySelector('button[type="submit"]');
                            submitBtn.click();
                        }
                        break;
                    case 'r':
                        e.preventDefault();
                        const resetBtn = form.querySelector('button[type="reset"]');
                        resetBtn.click();
                        break;
                }
            }
        });

        // Improve radio group navigation
        const radioGroups = document.querySelectorAll('.radio-group, .radio-group-vertical');
        radioGroups.forEach(group => {
            const radios = group.querySelectorAll('input[type="radio"]');
            radios.forEach((radio, index) => {
                radio.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const nextRadio = radios[(index + 1) % radios.length];
                        nextRadio.focus();
                        nextRadio.checked = true;
                        nextRadio.dispatchEvent(new Event('change', { bubbles: true }));
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const prevRadio = radios[(index - 1 + radios.length) % radios.length];
                        prevRadio.focus();
                        prevRadio.checked = true;
                        prevRadio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            });
        });
    }

    function addAriaLabels() {
        // Add ARIA labels to form sections
        const sections = document.querySelectorAll('.card');
        sections.forEach((section, index) => {
            const header = section.querySelector('.card-header h2');
            if (header) {
                const sectionId = `section-${index}`;
                section.setAttribute('role', 'region');
                section.setAttribute('aria-labelledby', sectionId);
                header.id = sectionId;
            }
        });

        // Add ARIA labels to radio groups
        const radioGroups = document.querySelectorAll('.radio-group, .radio-group-vertical');
        radioGroups.forEach((group, index) => {
            group.setAttribute('role', 'radiogroup');
            const label = group.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                const groupId = `radiogroup-${index}`;
                group.setAttribute('aria-labelledby', groupId);
                label.id = groupId;
            }
        });
    }

    function improveFocusManagement() {
        // Skip links for accessibility
        const skipLink = document.createElement('a');
        skipLink.href = '#referral-form';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Focus management for dynamic content
        const originalFocus = document.activeElement;
        
        // Restore focus after form submission
        form.addEventListener('submit', () => {
            setTimeout(() => {
                const resultHeader = document.querySelector('#result-content h3');
                if (resultHeader) {
                    resultHeader.focus();
                }
            }, 100);
        });
    }

    function addTooltips() {
        const tooltipData = {
            'ecog': 'ECOG Performance Status measures how well a patient can perform daily activities',
            'ida': 'Iron Deficiency Anemia - low iron levels in blood',
            'ibd': 'Inflammatory Bowel Disease (Crohn\'s or Ulcerative Colitis)',
            'family': 'Family history categories based on NICE guidelines'
        };

        Object.entries(tooltipData).forEach(([fieldName, tooltip]) => {
            const field = document.querySelector(`input[name="${fieldName}"]`);
            if (field) {
                const formGroup = field.closest('.form-group');
                const label = formGroup.querySelector('label');
                if (label) {
                    const tooltipIcon = document.createElement('span');
                    tooltipIcon.className = 'tooltip-icon';
                    tooltipIcon.innerHTML = ' ⓘ';
                    tooltipIcon.title = tooltip;
                    tooltipIcon.setAttribute('aria-label', tooltip);
                    label.appendChild(tooltipIcon);
                }
            }
        });
    }

    // --- Form Submission ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Enhanced form submission with validation
        if (!validateForm()) {
            showValidationErrors();
            return;
        }
        
        const formData = new FormData(form);
        const values = Object.fromEntries(formData.entries());
        
        const result = assessReferral(values);
        const enhancedResult = enhanceResultDisplay(result, values);
        
        lastInputs = values;
        lastResult = enhancedResult;

        displayResult(enhancedResult);
        
        resultContainer.style.display = 'block';
        resultFooter.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Event Listeners ---
    form.addEventListener('reset', () => {
        resultContainer.style.display = 'none';
        resultFooter.style.display = 'none';
        emailSuccessEl.style.display = 'none';
        bowelPrepContainer.style.display = 'none';
        lastScopeContainer.style.display = 'none';
        const defaultRadios = form.querySelectorAll('input[type="radio"][checked]');
        defaultRadios.forEach(radio => radio.checked = true);
    });

    surveillanceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Yes') {
                lastScopeContainer.style.display = 'block';
            } else {
                lastScopeContainer.style.display = 'none';
            }
        });
    });

    debugBtn.addEventListener('click', () => {
        const debugInfo = formatDebugInfo(lastInputs, lastResult);
        navigator.clipboard.writeText(debugInfo).then(() => {
            debugBtn.textContent = 'Copied!';
            setTimeout(() => {
                debugBtn.textContent = 'Copy Debug Info';
            }, 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            debugBtn.textContent = 'Error!';
        });
    });

    function formatDebugInfo(inputs, output) {
        let info = "--- DEBUG INFO ---\n\n";
        
        // Clinical Inputs
        info += "--- CLINICAL INPUTS ---\n";
        info += `Age: ${inputs.age}\n`;
        info += `Sex: ${inputs.sex}\n`;
        
        // Symptoms & History
        info += "\n--- SYMPTOMS & HISTORY ---\n";
        info += `Rectal Bleeding: ${inputs.rectal_bleeding}\n`;
        info += `Change in Bowel Habit: ${inputs.bowel_habit}\n`;
        info += `Iron Deficiency Anemia: ${inputs.ida}\n`;
        info += `Unexplained Weight Loss: ${inputs.weightloss}\n`;
        info += `History of Polyps: ${inputs.polyp}\n`;
        info += `IBD History: ${inputs.ibd}\n`;
        info += `Post-surgical Surveillance: ${inputs.surveillance}\n`;
        if (inputs.surveillance === "Yes") {
            info += `Last Scope Date: ${inputs.last_scope_date || 'Not specified'}\n`;
        }
        info += `Family History: ${inputs.family}\n`;
        
        // Fitness Assessment
        info += "\n--- FITNESS ASSESSMENT ---\n";
        info += `Cognition OK for prep: ${inputs.cognition}\n`;
        info += `Severe Comorbidities: ${inputs.comorbidity}\n`;
        info += `Can tolerate bowel prep: ${inputs.prep}\n`;
        info += `High sedation risk: ${inputs.sedation}\n`;
        info += `ECOG Status: ${inputs.ecog}\n`;
        
        // Output Details
        info += "\n--- ASSESSMENT OUTCOME ---\n";
        info += `Reference #: ${output.ref}\n`;
        info += `Category: ${output.category}\n`;
        info += `Emoji: ${output.emoji}\n`;
        
        // Clinical Reasoning
        info += "\nClinical Rationale:\n";
        output.reasons.forEach(r => info += `  - ${r}\n`);
        
        // Fitness Details
        info += "\nFitness Assessment:\n";
        output.fitness.forEach(f => info += `  - ${f.text}\n`);
        
        if (output.showBowelPrep) {
            info += "\nBowel Prep Instructions: Required\n";
        }

        return info;
    }

    // --- Triage Logic ---
    function assessReferral(data) {
        const age = parseInt(data.age, 10);
        const {
            rectal_bleeding: bleeding,
            ida: anaemia,
            bowel_habit: abh,
            weightloss,
            polyp,
            family,
            ibd,
            surveillance,
            cognition,
            comorbidity,
            prep,
            sedation
        } = data;
        const ecog = parseInt(data.ecog, 10);

        const result = {
            ref: generateReference(),
            category: '',
            emoji: '',
            reasons: new Set(), // Use a Set to avoid duplicate reasons
            fitness: [],
            showBowelPrep: false
        };

        let colonoscopyIndicated = false;

        // --- Clinical Criteria Evaluation ---

        // Surveillance is an independent finding
        if (surveillance === "Yes") {
            result.reasons.add("ℹ️ This is a post-surgical surveillance case. Procedure: Routine colonoscopy as per protocol.");
            colonoscopyIndicated = true;
        }

        // Urgent 2-week criteria
        if (
            (bleeding === "Yes" && anaemia === "Yes") ||
            (abh === "Yes" && bleeding === "Yes" && age >= 50)
        ) {
            result.category = "Urgent Colonoscopy Recommended";
            result.emoji = '🔴';
            result.reasons.add("High suspicion of CRC. Recommended Procedure: Colonoscopy.");
            colonoscopyIndicated = true;
        }
        // 6-week routine criteria
        else if (
            (abh === "Yes" && age >= 50) ||
            (bleeding === "Yes" && age >= 50) ||
            (anaemia === "Yes") ||
            (weightloss === "Yes") ||
            (family === "category2" && (abh === "Yes" || bleeding === "Yes")) ||
            (family === "category3" && age >= 25) ||
            (polyp === "Yes") ||
            (ibd === "Yes")
        ) {
            result.category = "Routine Colonoscopy Recommended";
            result.emoji = '🟡';
            result.reasons.add("Meets 6-week criteria. Recommended Procedure: Colonoscopy (or CT Colonography if fitness is a concern).");
            colonoscopyIndicated = true;
        }
        
        // --- Category Finalization ---

        // If no urgent or routine criteria were met, determine final category
        if (!result.category) {
            if (surveillance === "Yes") {
                result.category = "Routine Surveillance Colonoscopy";
                result.emoji = '🔵';
            } else {
                result.category = "No Direct Access Procedure Indicated";
                result.emoji = '⚪️';
                result.reasons.add("Consider specialist review, GP follow-up or further monitoring.");
            }
        }
        
        // --- Fitness Assessment (Independent Evaluation) ---
        let fitnessIssues = [];
        let criticalFitnessIssue = false;

        if (ecog >= 3) {
            fitnessIssues.push({text: '❌ ECOG 3 or 4: Patient not suitable for colonoscopy. Recommendation: CT Colonography or palliative/supportive care.', type: 'critical'});
            criticalFitnessIssue = true;
        } else if (ecog === 2) {
            fitnessIssues.push({text: '⚠️ ECOG 2: Limited functional status. Consider CT Colonography as first-line investigation.', type: 'warning'});
        }
        
        if (cognition === "no") {
            fitnessIssues.push({text: '⚠️ Cognitive issues may affect bowel prep compliance. Consider inpatient admission or CT Colonography.', type: 'warning'});
        }
        
        if (comorbidity === "yes") {
            fitnessIssues.push({text: '⚠️ Significant comorbidities present. Consider risk-benefit assessment.', type: 'warning'});
        }
        
        if (prep === "yes") {
            fitnessIssues.push({text: '⚠️ Bowel prep tolerance concerns. Consider modified prep regime or CT Colonography.', type: 'warning'});
        }
        
        if (sedation === "yes") {
            fitnessIssues.push({text: '⚠️ High sedation risk identified. Anesthetic assessment may be required.', type: 'warning'});
        }

        // If there are multiple fitness issues or ECOG ≥ 2, modify the recommendation
        if (criticalFitnessIssue || (fitnessIssues.length >= 2 && ecog >= 2)) {
            result.category = result.category.replace("Colonoscopy", "Investigation");
            result.reasons.add("⚠️ Due to fitness concerns, CT Colonography is recommended as first-line investigation.");
        }

        result.fitness = fitnessIssues;
        
        // Final decision on showing the bowel prep section
        result.showBowelPrep = colonoscopyIndicated && !criticalFitnessIssue;

        // If the patient is fit and requires a scope, trigger the email notification
        if (result.showBowelPrep) {
            // We pass a copy of the original form data to the email function
            sendEmailNotification(result, data);
        }

        // Convert reasons Set back to an array
        result.reasons = Array.from(result.reasons);
        return result;
    }

    // --- Enhanced Result Display ---
    function enhanceResultDisplay(result, inputs) {
        return {
            ...result,
            timestamp: new Date().toLocaleString()
        };
    }

    // --- UI Display ---
    function displayResult(result) {
        const isNotIndicated = result.category === "No Direct Access Procedure Indicated";
        const isColonoscopyRecommended = result.category.includes("Colonoscopy");
        const headerClass = isNotIndicated ? 'result-header-not-indicated' : '';
        const hasFitnessIssues = result.fitness.length > 0;

        // Add fade-in animation
        resultContainer.classList.add('result-loading');

        let html = `
            <div class="result-header-section">
                <h3 class="${headerClass}" tabindex="-1">
                    <span class="emoji">${result.emoji}</span>
                    ${result.category}
                </h3>
                ${isColonoscopyRecommended ? 
                    `<div class="colonoscopy-recommendation">
                        <strong>✓ COLONOSCOPY RECOMMENDED</strong>
                        ${hasFitnessIssues ? '<div class="fitness-warning">⚠️ With Fitness Considerations</div>' : ''}
                    </div>` : 
                    '<div class="no-colonoscopy"><strong>✗ NO COLONOSCOPY INDICATED</strong></div>'
                }
                <div class="result-metadata">
                    <p class="reference-number">Reference: <strong>#${result.ref}</strong></p>
                    <p class="result-timestamp">${result.timestamp}</p>
                </div>
                <div class="reference-instruction">
                    <strong>⚠️ IMPORTANT:</strong> Save this reference number <strong>(#${result.ref})</strong> for reference when booking the procedure.
                </div>
            </div>
            `;

        if (result.reasons.length > 0) {
            html += '<div class="rationale-section"><h4>Clinical Rationale</h4><ul>';
            result.reasons.forEach((reason, index) => {
                html += `<li style="animation-delay: ${index * 0.1}s">${reason}</li>`;
            });
            html += '</ul></div>';
        }

        if (result.fitness.length > 0) {
            html += '<div class="fitness-section"><h4>Fitness Summary</h4><ul>';
            result.fitness.forEach((item, index) => {
                html += `<li class="${item.type}-item" style="animation-delay: ${(index + result.reasons.length) * 0.1}s">${item.text}</li>`;
            });
            html += '</ul></div>';
        }
        
        resultContentEl.innerHTML = html;

        // Trigger animations
        setTimeout(() => {
            resultContainer.classList.remove('result-loading');
            resultContainer.classList.add('result-visible');
        }, 50);

        if (result.showBowelPrep) {
            setTimeout(() => {
                bowelPrepContainer.style.display = 'block';
                bowelPrepContainer.classList.add('prep-visible');
            }, 300);
        } else {
            bowelPrepContainer.style.display = 'none';
            bowelPrepContainer.classList.remove('prep-visible');
        }
    }

    // --- Email Notification ---
    async function sendEmailNotification(result, inputs) {
        // The endpoint for our Netlify serverless function
        const endpoint = '/.netlify/functions/send-email';

        const dataToSend = {
            ref: result.ref,
            category: result.category,
            reasons: Array.from(result.reasons), // Ensure reasons is an array
            fitness: result.fitness,
            inputs: inputs
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                console.log('Email notification sent successfully.');
                emailSuccessEl.innerHTML = `
                    <h4>✅ Assessment Saved & Emailed</h4>
                    <p>Assessment <strong>#${result.ref}</strong> has been saved and emailed to clinical team.</p>
                    <p><strong>Action:</strong> Save reference #${result.ref} for future medical appointments.</p>
                `;
                emailSuccessEl.className = 'email-success-notification visible';
            } else {
                const errorData = await response.json();
                console.error('Failed to send email notification:', response.statusText, errorData);
                emailSuccessEl.innerHTML = '<h4>Error</h4><p>Email failed to send. Please copy the debug info and report the issue.</p>';
                emailSuccessEl.className = 'email-success-notification error visible';
            }
        } catch (error) {
            console.error('Error calling email function:', error);
            // Show different message for local vs deployed
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                emailSuccessEl.innerHTML = `
                    <h4>📋 Assessment Saved (Local Mode)</h4>
                    <p>Assessment <strong>#${result.ref}</strong> has been generated and saved.</p>
                    <p><strong>Note:</strong> Email functionality requires deployment. Reference number saved for records.</p>
                `;
                emailSuccessEl.className = 'email-success-notification visible';
            } else {
                emailSuccessEl.innerHTML = '<h4>❌ Assessment Error</h4><p>Could not save or email assessment. Please try again or contact support.</p>';
                emailSuccessEl.className = 'email-success-notification error visible';
            }
        }
    }

    // --- Helpers ---
    function generateReference() {
        const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
        const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase();
        return `${timestamp}${randomPart}`;
    }
}); 