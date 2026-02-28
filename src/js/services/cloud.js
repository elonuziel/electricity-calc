// ───── JSONHosting Cloud Backup ─────
const JSONHOSTING_API = 'https://jsonhosting.com/api/json';

// ===== OFFLINE DETECTION =====

/**
 * Check if device is online
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Set up offline/online event listeners
 */
function setupOfflineDetection() {
    window.addEventListener('offline', () => {
        console.warn('Device went offline');
        showOfflineBanner();
    });
    
    window.addEventListener('online', () => {
        console.log('Device came online');
        hideOfflineBanner();
        showToast('אינך מחובר לאינטרנט שוב', 'success');
    });
    
    // Show banner if already offline on load
    if (!isOnline()) {
        showOfflineBanner();
    }
}

document.addEventListener('DOMContentLoaded', setupOfflineDetection);

function showCloudStatus(message, isError = false) {
    const el = document.getElementById('cloudStatus');
    el.textContent = message;
    el.className = `text-xs text-center py-1 rounded mt-2 ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`;
    el.classList.remove('hidden');
}

/**
 * Validate cloud backup data structure
 */
function validateCloudData(data) {
    if (!data) return { valid: false, error: 'נתונים ריקים' };
    
    // Handle both structured {bills, settings} and legacy flat array
    const cloudBills = data.bills || (Array.isArray(data) ? data : null);
    
    if (!cloudBills || !Array.isArray(cloudBills)) {
        return { valid: false, error: 'פורמט נתונים לא תקין' };
    }
    
    // Validate each bill structure
    for (let i = 0; i < cloudBills.length; i++) {
        const bill = cloudBills[i];
        if (!bill.date || typeof bill.date !== 'string') {
            return { valid: false, error: `שגיאה בחשבונית #${i + 1}: תאריך חסר או לא תקין` };
        }
        if (!bill.main || typeof bill.main.amount !== 'number' || typeof bill.main.kwh !== 'number') {
            return { valid: false, error: `שגיאה בחשבונית #${i + 1}: נתוני חשבון ראשי לא תקינים` };
        }
        if (!bill.readings || typeof bill.readings.top !== 'number' || typeof bill.readings.bottom !== 'number') {
            return { valid: false, error: `שגיאה בחשבונית #${i + 1}: נתוני קריאות לא תקינים` };
        }
        // Check for reasonable values
        if (bill.readings.top < 0 || bill.readings.bottom < 0) {
            return { valid: false, error: `שגיאה בחשבונית #${i + 1}: קריאות לא יכולות להיות שליליות` };
        }
    }
    
    return { valid: true, billCount: cloudBills.length, data: { cloudBills, cloudSettings: data.settings } };
}

/**
 * Show preview modal before restoring cloud data
 */
function showCloudRestoreModal(cloudBills, cloudSettings, onConfirm) {
    const existingBills = bills.length;
    const cloudBillCount = cloudBills.length;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md">
            <h2 class="text-xl font-bold mb-4">התחזוקה מגיבוי</h2>
            <div class="mb-4 p-3 bg-blue-50 rounded text-sm">
                <p><strong>נתונים קיימים:</strong> ${existingBills} חשבונות</p>
                <p><strong>נתונים בגיבוי:</strong> ${cloudBillCount} חשבונות</p>
            </div>
            <p class="mb-6 text-gray-700">איך תרצה להתחזוקה?</p>
            <div class="flex gap-3">
                <button onclick="this.closest('div').remove()" class="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    ביטול
                </button>
                <button onclick="${onConfirm}; this.closest('div').remove()" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    החלף הכל
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function loadFromCloud() {
    // Check if online
    if (!isOnline()) {
        showCloudStatus('לא ניתן לטעון נתונים כשאתה לא מחובר לאינטרנט.', true);
        return;
    }
    
    let backupId = document.getElementById('cloudBackupId').value.trim();

    // Auto-extract ID if user pasted a full JSONHosting URL
    if (backupId.includes('jsonhosting.com')) {
        const matches = backupId.match(/\/api\/json\/([a-zA-Z0-9]+)/) || backupId.match(/\/get\/([a-zA-Z0-9]+)/);
        if (matches && matches[1]) {
            backupId = matches[1];
            document.getElementById('cloudBackupId').value = backupId;
        }
    }

    if (!backupId) {
        showCloudStatus('יש להזין מזהה (ID) כדי לטעון נתונים.', true);
        return;
    }

    // Show loading spinner
    const spinner = showLoadingSpinner('טוען נתונים מהענן...');
    
    try {
        const url = `https://corsproxy.io/?${encodeURIComponent(JSONHOSTING_API + '/' + backupId + '/raw')}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(CONFIG.CLOUD.FETCH_TIMEOUT) });
        if (!res.ok) {
            if (res.status === 404) throw new Error('גיבוי לא נמצא. בדוק את המזהה שלך.');
            throw new Error(`שגיאה בטעינה: ${res.status}`);
        }

        const json = await res.json();
        const data = typeof json === 'string' ? JSON.parse(json) : json;

        // Validate data before showing preview
        const validation = validateCloudData(data);
        if (!validation.valid) {
            hideLoadingSpinner();
            showCloudStatus('שגיאה בנתוני הגיבוי: ' + validation.error, true);
            return;
        }

        const { cloudBills, cloudSettings } = validation.data;

        hideLoadingSpinner();
        
        // Show preview modal and ask for confirmation
        showCloudRestoreModal(cloudBills, cloudSettings, `
            state.replaceAll(${JSON.stringify(cloudBills)}, ${JSON.stringify(cloudSettings)});
            renderSettings();
            renderBills();
            updateInitBanner();
            safeLocalStorageSet('elecCloudBackupId', '${backupId}');
            showCloudStatus('הנתונים נטענו בהצלחה מהענן! ✓');
        `);
    } catch (err) {
        hideLoadingSpinner();
        
        if (err.name === 'AbortError') {
            showCloudStatus('פג זמן ההמתנה. הרשת כנראה איטית.', true);
        } else if (err.message === 'Failed to fetch') {
            showCloudStatus('שגיאת רשת: לא ניתן להתחבר לשרת הגיבוי.', true);
        } else {
            showCloudStatus(err.message, true);
        }
    }
}

async function saveToCloud() {
    let backupId = document.getElementById('cloudBackupId').value.trim();
    const accessKey = document.getElementById('cloudAccessKey').value.trim();

    // Auto-extract ID if user pasted a full JSONHosting URL
    if (backupId.includes('jsonhosting.com')) {
        const matches = backupId.match(/\/api\/json\/([a-zA-Z0-9]+)/) || backupId.match(/\/get\/([a-zA-Z0-9]+)/);
        if (matches && matches[1]) {
            backupId = matches[1];
            document.getElementById('cloudBackupId').value = backupId;
        }
    }

    if (backupId && !accessKey) {
        showCloudStatus('כדי לעדכן גיבוי קיים יש להכניס את ה-Edit Key. לגיבוי חדש, מחק את המזהה.', true);
        return;
    }

    const payload = JSON.stringify({
        bills: bills,
        settings: initialSettings
    });

    showCloudStatus('שומר נתונים לענן...');
    try {
        let url, method, body;
        const headers = { 'Content-Type': 'application/json' };

        if (backupId) {
            // Update existing backup
            url = `https://corsproxy.io/?${encodeURIComponent(JSONHOSTING_API + '/' + backupId)}`;
            method = 'PUT';
            body = JSON.stringify({
                editKey: accessKey,
                data: payload
            });
        } else {
            // Create new backup
            url = `https://corsproxy.io/?${encodeURIComponent(JSONHOSTING_API + '/save')}`;
            method = 'POST';
            body = payload;
        }

        const res = await fetch(url, { method, headers, body });
        if (!res.ok) throw new Error('שגיאה בפעולת הגיבוי. בדוק את המזהה ואת מפתח העריכה.');

        if (method === 'POST') {
            const data = await res.json();
            const newId = data.id;
            const newEditKey = data.editKey;

            document.getElementById('cloudBackupId').value = newId;
            document.getElementById('cloudAccessKey').value = newEditKey;

            localStorage.setItem('elecCloudBackupId', newId);
            localStorage.setItem('elecCloudAccessKey', newEditKey);

            showBackupSuccessModal(newId, newEditKey);
            showCloudStatus('גיבוי חדש נוצר בהצלחה! ✓');
        } else {
            localStorage.setItem('elecCloudBackupId', backupId);
            localStorage.setItem('elecCloudAccessKey', accessKey);
            showCloudStatus('הנתונים עודכנו בענן בהצלחה! ✓');
        }
    } catch (err) {
        if (err.message === 'Failed to fetch') {
            showCloudStatus('שגיאת רשת: לא ניתן להתחבר לשרת הגיבוי.', true);
        } else {
            showCloudStatus(err.message, true);
        }
    }
}

function toggleApiKeyVisibility() {
    const keyInput = document.getElementById('cloudAccessKey');
    const eyeIcon = document.getElementById('apiKeyEyeIcon');

    if (keyInput.type === 'password') {
        keyInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        keyInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}
