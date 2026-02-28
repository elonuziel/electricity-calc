/**
 * Calculator module for electricity bill calculations
 * Extracted from ui.js to be reusable and testable
 */

/**
 * Calculate consumption between two readings
 * @param {number} currentReading - Current meter reading
 * @param {number} previousReading - Previous meter reading
 * @returns {number} - Consumption (current - previous)
 */
function calculateConsumption(currentReading, previousReading) {
    return Math.max(0, currentReading - previousReading);
}

/**
 * Calculate cost for consumption at given rate
 * @param {number} consumption - kWh consumed
 * @param {number} rate - Price per kWh
 * @returns {number} - Total cost
 */
function calculateCost(consumption, rate) {
    return Math.round(consumption * rate * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate all metrics for a single bill
 * @param {Object} bill - Bill object with readings and main data
 * @param {number} prevTopReading - Previous top meter reading
 * @param {number} prevBottomReading - Previous bottom meter reading
 * @returns {Object} - Calculated metrics
 */
function calculateBillMetrics(bill, prevTopReading, prevBottomReading) {
    const rate = bill.main.kwh > 0 ? bill.main.amount / bill.main.kwh : 0;

    const consumptionTop = calculateConsumption(bill.readings.top, prevTopReading);
    const consumptionBottom = calculateConsumption(bill.readings.bottom, prevBottomReading);

    const costTop = calculateCost(consumptionTop, rate);
    const costBottom = calculateCost(consumptionBottom, rate);

    return {
        rate: Math.round(rate * 100) / 100,
        consumptionTop,
        consumptionBottom,
        costTop,
        costBottom,
        totalConsumption: consumptionTop + consumptionBottom,
        totalCost: costTop + costBottom
    };
}

/**
 * Calculate effective rate (price per kWh)
 * @param {number} totalAmount - Total bill amount
 * @param {number} totalKwh - Total kWh consumed
 * @returns {number} - Rate (per kWh)
 */
function calculateEffectiveRate(totalAmount, totalKwh) {
    if (totalKwh <= 0) return 0;
    return Math.round((totalAmount / totalKwh) * 100) / 100;
}

/**
 * Calculate percentage of total cost
 * @param {number} amount - Amount to calculate percentage for
 * @param {number} total - Total amount
 * @returns {number} - Percentage (0-100)
 */
function calculatePercentage(amount, total) {
    if (total <= 0) return 0;
    return Math.round((amount / total) * 100);
}

/**
 * Calculate summary statistics for all bills
 * @param {Array} bills - Array of bill objects
 * @param {number} initialTopReading - Initial top meter reading
 * @param {number} initialBottomReading - Initial bottom meter reading
 * @returns {Object} - Summary statistics
 */
function calculateBillsSummary(bills, initialTopReading, initialBottomReading) {
    if (bills.length === 0) {
        return {
            totalBills: 0,
            totalConsumption: 0,
            totalCost: 0,
            averageRate: 0,
            averageBillCost: 0
        };
    }

    let totalConsumption = 0;
    let totalCost = 0;
    let prevTop = initialTopReading;
    let prevBottom = initialBottomReading;

    bills.forEach(bill => {
        const metrics = calculateBillMetrics(bill, prevTop, prevBottom);
        totalConsumption += metrics.totalConsumption;
        totalCost += metrics.totalCost;
        prevTop = bill.readings.top;
        prevBottom = bill.readings.bottom;
    });

    return {
        totalBills: bills.length,
        totalConsumption: Math.round(totalConsumption * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        averageRate: calculateEffectiveRate(totalCost, totalConsumption),
        averageBillCost: Math.round((totalCost / bills.length) * 100) / 100
    };
}
