/**
 * Validation module for bill data and form inputs
 * Extracted from ui.js to be reusable and testable
 */

/**
 * Validate a form submission with all bill data
 * @param {string} formDate - Bill date in YYYY-MM-DD format
 * @param {number} formAmount - Total bill amount
 * @param {number} formKwh - Total kWh consumption
 * @param {number} formTop - Top meter reading
 * @param {number} formBottom - Bottom meter reading
 * @param {number} prevTop - Previous top meter reading (for delta check)
 * @param {number} prevBottom - Previous bottom meter reading (for delta check)
 * @returns {Array} Array of error messages (empty if valid)
 */
function validateBillForm(formDate, formAmount, formKwh, formTop, formBottom, prevTop, prevBottom) {
    const errors = [];

    // Validate consumption is positive
    if (!formKwh || formKwh <= 0) {
        errors.push(CONFIG.MESSAGES.READING_MUST_INCREASE);
    }

    // Validate amount is positive
    if (!formAmount || formAmount <= 0) {
        errors.push(CONFIG.MESSAGES.INVALID_NUMBER);
    }

    // Validate readings don't go backward (no negative consumption)
    if (formTop < prevTop) {
        errors.push(`${CONFIG.MESSAGES.READING_MUST_INCREASE} (עליונה: ${formTop} < ${prevTop})`);
    }

    if (formBottom < prevBottom) {
        errors.push(`${CONFIG.MESSAGES.READING_MUST_INCREASE} (תחתונה: ${formBottom} < ${prevBottom})`);
    }

    // Validate tenant consumption doesn't exceed total
    const consTop = formTop - prevTop;
    const consBottom = formBottom - prevBottom;
    const totalTenants = consTop + consBottom;
    if (formKwh > 0 && totalTenants > formKwh) {
        errors.push(`סך צריכת הדירות (${totalTenants} קוט"ש) עולה על הצריכה הכללית (${formKwh} קוט"ש). בדקי את הנתונים.`);
    }

    return errors;
}

/**
 * Get previous meter readings based on editing context
 * @param {string} editingBillId - ID of bill being edited (null if adding new)
 * @returns {Object} { prevTop, prevBottom } from previous bill or initial settings
 */
function getPreviousReadings(editingBillId) {
    const currentBills = state.getBills();
    const settings = state.getSettings();
    
    let prevTop = settings.top;
    let prevBottom = settings.bottom;

    if (editingBillId) {
        const idx = currentBills.findIndex(b => b.id === editingBillId);
        if (idx > 0) {
            prevTop = currentBills[idx - 1].readings.top;
            prevBottom = currentBills[idx - 1].readings.bottom;
        }
    } else {
        if (currentBills.length > 0) {
            const last = currentBills[currentBills.length - 1];
            prevTop = last.readings.top;
            prevBottom = last.readings.bottom;
        }
    }

    return { prevTop, prevBottom };
}

/**
 * Validate readings are within acceptable ranges
 * @param {number} reading - The meter reading to validate
 * @returns {boolean} - True if valid
 */
function isValidReading(reading) {
    return reading >= CONFIG.VALIDATION.MIN_READING && reading <= CONFIG.VALIDATION.MAX_READING;
}

/**
 * Validate price per kWh is within range
 * @param {number} price - Price to validate
 * @returns {boolean} - True if valid
 */
function isValidPrice(price) {
    return price >= CONFIG.VALIDATION.MIN_PRICE && price <= CONFIG.VALIDATION.MAX_PRICE;
}
