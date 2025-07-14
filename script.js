document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('referral-form');
    const resultContainer = document.getElementById('result-container');
    const resultContentEl = document.getElementById('result-content');
    const resultFooter = document.querySelector('.result-footer');
    const debugBtn = document.getElementById('debug-btn');
    const surveillanceRadios = document.querySelectorAll('input[name="surveillance"]');
    const lastScopeContainer = document.getElementById('last-scope-container');
    const bowelPrepContainer = document.getElementById('bowel-prep-container');

    let lastInputs = {};
    let lastResult = {};

    // --- Form Submission ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const values = Object.fromEntries(formData.entries());
        
        const result = assessReferral(values);
        
        lastInputs = values;
        lastResult = result;

        displayResult(result);
        
        resultContainer.style.display = 'block';
        resultFooter.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Event Listeners ---
    form.addEventListener('reset', () => {
        resultContainer.style.display = 'none';
        resultFooter.style.display = 'none';
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
        info += "--- INPUTS ---\n";
        for (const [key, value] of Object.entries(inputs)) {
            info += `${key}: ${value}\n`;
        }
        info += "\n--- OUTPUT ---\n";
        info += `Category: ${output.category}\n`;
        info += `Emoji: ${output.emoji}\n\n`;
        info += "Reasons:\n";
        output.reasons.forEach(r => info += `  - ${r}\n`);
        info += "\nFitness Assessment:\n";
        output.fitness.forEach(f => info += `  - ${f.text}\n`);
        
        if (output.showBowelPrep) {
            info += "\nBowel Prep Section: Visible\n";
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
                result.category = "Does not meet direct access criteria";
                result.emoji = '⚪️';
                result.reasons.add("Consider specialist review, GP follow-up or further monitoring.");
            }
        }
        
        // --- Fitness Assessment (Independent Evaluation) ---
        if (ecog >= 3) {
            result.fitness.push({text: '❌ ECOG 3 or 4: Patient not suitable for colonoscopy. Recommendation: CT Colonography or palliative/supportive care.', type: 'critical'});
        } else if (
            cognition === "no" || 
            comorbidity === "yes" || 
            prep === "yes" || 
            sedation === "yes"
        ) {
            result.fitness.push({text: '⚠️ One or more risks identified. Consider CTC or inpatient support.', type: 'warning'});
        } else {
            result.fitness.push({text: '✅ Patient appears fit for outpatient colonoscopy.', type: 'ok'});
        }
        
        // Final decision on showing the bowel prep section
        result.showBowelPrep = colonoscopyIndicated && (ecog < 3);

        // Convert reasons Set back to an array
        result.reasons = Array.from(result.reasons);
        return result;
    }

    // --- UI Display ---
    function displayResult(result) {
        let html = `
            <h3>
                <span class="emoji">${result.emoji}</span>
                ${result.category}
            </h3>`;

        if (result.reasons.length > 0) {
            html += '<h4>Clinical Rationale</h4><ul>';
            result.reasons.forEach(reason => {
                html += `<li>${reason}</li>`;
            });
            html += '</ul>';
        }

        if (result.fitness.length > 0) {
            html += '<h4>Fitness Summary</h4><ul>';
            result.fitness.forEach(item => {
                html += `<li class="${item.type}-item">${item.text}</li>`;
            });
            html += '</ul>';
        }
        
        resultContentEl.innerHTML = html;

        if (result.showBowelPrep) {
            bowelPrepContainer.style.display = 'block';
        } else {
            bowelPrepContainer.style.display = 'none';
        }
    }
}); 