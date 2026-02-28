/**
 * Generate a unique ID using timestamp + counter
 * More collision-resistant than Date.now() + Math.random()
 */
let idCounter = 0;
function generateUniqueId() {
    return `${Date.now()}-${++idCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely write to localStorage with error handling
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} - True if successful, false if quota exceeded
 */
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showStorageQuotaError();
            return false;
        }
        console.error('localStorage error:', e);
        return false;
    }
}

/**
 * Show error modal when localStorage is full
 */
function showStorageQuotaError() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm">
            <h2 class="text-xl font-bold mb-4 text-red-600">${CONFIG.MESSAGES.ERROR}</h2>
            <p class="mb-4">${CONFIG.MESSAGES.STORAGE_QUOTA_EXCEEDED}</p>
            <button onclick="this.closest('div').remove()" class="bg-blue-500 text-white px-4 py-2 rounded">סגור</button>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Check if bill ID already exists in bills array
 * @param {string} billId - The ID to check
 * @param {Array} billsArray - Array of bills to search
 * @returns {boolean} - True if ID already exists
 */
function billIdExists(billId, billsArray) {
    return billsArray.some(bill => bill.id === billId);
}
