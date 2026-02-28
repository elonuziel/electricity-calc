// ───── Init ─────

/**
 * Global error handler for uncaught exceptions
 */
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    showErrorModal('שגיאה לא צפויה', event.message || event.error?.message);
});

/**
 * Global handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorModal('שגיאה בפעולה', event.reason?.message || 'משהו השתבש. אנא נסה שוב.');
});

/**
 * Show error modal with recovery options
 */
function showErrorModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm">
            <h2 class="text-xl font-bold mb-4 text-red-600">${title}</h2>
            <p class="mb-6">${message}</p>
            <div class="flex gap-3">
                <button onclick="location.reload()" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    טען מחדש
                </button>
                <button onclick="this.closest('div').remove(); clearAppData();" class="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    נקה נתונים
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Clear all app data as recovery option
 */
function clearAppData() {
    state.clearAll();
    location.reload();
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modals
        if (e.key === 'Escape') {
            const modal = document.querySelector('[id*="Modal"]:not(.hidden)');
            if (modal && modal.id === 'billModal') {
                closeModal();
            } else if (modal && modal.id === 'initReadingsModal') {
                closeInitReadingsModal();
            }
        }
        
        // Enter to submit form (when not in textarea)
        if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
            const activeModal = document.querySelector('[id*="Modal"]:not(.hidden)');
            if (activeModal) {
                const submitBtn = activeModal.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', setupKeyboardShortcuts);

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize state manager sync
        initializeStateSync();
        
        // Load cloud credentials
        const savedCloudId = localStorage.getItem('elecCloudBackupId');
        const savedCloudKey = localStorage.getItem('elecCloudAccessKey');
        if (savedCloudId) document.getElementById('cloudBackupId').value = savedCloudId;
        if (savedCloudKey) document.getElementById('cloudAccessKey').value = savedCloudKey;

        renderSettings();
        renderBills();
        updateInitBanner();
    } catch (error) {
        console.error('Error during initialization:', error);
        showErrorModal('שגיאה בטעינת הנתונים', 'לא הצלחנו לטעון את הנתונים השמורים.');
    }
});
