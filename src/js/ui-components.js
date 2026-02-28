/**
 * Reusable UI components
 */

/**
 * Show a loading spinner during async operations
 */
function showLoadingSpinner(message = 'טוען...') {
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.className = 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50';
    spinner.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="text-gray-700">${message}</p>
        </div>
    `;
    document.body.appendChild(spinner);
    return spinner;
}

/**
 * Hide the loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

/**
 * Show a toast notification (temporary message)
 */
function showToast(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white max-w-sm z-40 animate-slide-up ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}

/**
 * Show offline banner at top of page
 */
function showOfflineBanner() {
    if (document.getElementById('offlineBanner')) return; // Already shown
    
    const banner = document.createElement('div');
    banner.id = 'offlineBanner';
    banner.className = 'bg-yellow-400 text-yellow-900 p-3 text-center text-sm font-semibold sticky top-0 z-30';
    banner.innerHTML = `
        <i class="fas fa-wifi-off mr-2"></i>אינך מחובר לאינטרנט - פעולות ענן לא זמינות
    `;
    document.body.insertBefore(banner, document.body.firstChild);
}

/**
 * Hide offline banner
 */
function hideOfflineBanner() {
    const banner = document.getElementById('offlineBanner');
    if (banner) {
        banner.remove();
    }
}

/**
 * Disable button and show loading state
 */
function disableButtonWithLoading(buttonElement, message = 'טוען...') {
    buttonElement.disabled = true;
    buttonElement.dataset.originalText = buttonElement.textContent;
    buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`;
    buttonElement.classList.add('opacity-75', 'cursor-not-allowed');
}

/**
 * Re-enable button and restore original state
 */
function enableButton(buttonElement) {
    buttonElement.disabled = false;
    buttonElement.textContent = buttonElement.dataset.originalText || buttonElement.textContent;
    buttonElement.classList.remove('opacity-75', 'cursor-not-allowed');
}

/**
 * Add CSS for animations if not already present
 */
function initializeUIAnimations() {
    if (document.getElementById('uiAnimations')) return; // Already added
    
    const style = document.createElement('style');
    style.id = 'uiAnimations';
    style.textContent = `
        @keyframes slideUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .animate-slide-up {
            animation: slideUp 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// Initialize animations on load
document.addEventListener('DOMContentLoaded', initializeUIAnimations);
