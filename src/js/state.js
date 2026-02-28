// ───── State ─────
// DEPRECATED: Use stateManager instead
// Keeping these for backward compatibility, but prefer state.getBills(), state.getSettings(), etc.
let bills = [];
let initialSettings = { top: null, bottom: null };
let editingBillId = null;

/**
 * Sync global state with state manager
 * Called after state manager is initialized
 */
function initializeStateSync() {
    bills = state.getBills();
    initialSettings = state.getSettings();
    
    // Subscribe to state changes to keep globals in sync
    state.on('bills:updated', (updatedBills) => {
        bills = updatedBills;
    });
    
    state.on('settings:updated', (updatedSettings) => {
        initialSettings = updatedSettings;
    });
    
    state.on('editing:changed', (billId) => {
        editingBillId = billId;
    });
}

function saveData() {
    const saved = safeLocalStorageSet('elecBills', JSON.stringify(bills));
    if (!saved) {
        console.error('Failed to save bills - storage quota exceeded');
    }
}

function hasInitialReadings() {
    return initialSettings.top !== null && initialSettings.bottom !== null;
}

function resetAllData() {
    if (confirm(CONFIG.MESSAGES.CONFIRM_CLEAR_DATA)) {
        if (confirm('האם אתה באמת בטוח? הנתונים יימחקו ולא ניתן יהיה לשחזר אותם.')) {
            state.clearAll();
            document.getElementById('cloudBackupId').value = '';
            document.getElementById('cloudAccessKey').value = '';
            const cloudStatus = document.getElementById('cloudStatus');
            if (cloudStatus) cloudStatus.classList.add('hidden');

            renderSettings();
            renderBills();
            updateInitBanner();
            showToast(CONFIG.MESSAGES.SUCCESS);
        }
    }
}
