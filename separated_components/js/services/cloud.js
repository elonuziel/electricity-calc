// ───── JSONHosting Cloud Backup ─────
const JSONHOSTING_API = 'https://jsonhosting.com/api/json';

function showCloudStatus(message, isError = false) {
    const el = document.getElementById('cloudStatus');
    el.textContent = message;
    el.className = `text-xs text-center py-1 rounded mt-2 ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`;
    el.classList.remove('hidden');
}

async function loadFromCloud() {
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

    showCloudStatus('טוען נתונים מהענן...');
    try {
        const url = `https://corsproxy.io/?${encodeURIComponent(JSONHOSTING_API + '/' + backupId + '/raw')}`;
        const res = await fetch(url);
        if (!res.ok) {
            if (res.status === 404) throw new Error('גיבוי לא נמצא. בדוק את המזהה שלך.');
            throw new Error(`שגיאה בטעינה: ${res.status}`);
        }

        const json = await res.json();
        const data = typeof json === 'string' ? JSON.parse(json) : json;

        // Support both structured {bills, settings} and legacy flat array
        const cloudBills = data.bills || (Array.isArray(data) ? data : null);
        const cloudSettings = data.settings;

        if (cloudBills && Array.isArray(cloudBills)) {
            bills = cloudBills;
            localStorage.setItem('elecBills', JSON.stringify(bills));
        }
        if (cloudSettings) {
            initialSettings = cloudSettings;
            localStorage.setItem('elecSettings', JSON.stringify(initialSettings));
        }

        bills.sort((a, b) => new Date(a.date) - new Date(b.date));
        renderSettings();
        renderBills();
        updateInitBanner();

        localStorage.setItem('elecCloudBackupId', backupId);
        showCloudStatus('הנתונים נטענו בהצלחה מהענן! ✓');
    } catch (err) {
        if (err.message === 'Failed to fetch') {
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

            alert(`גיבוי חדש נוצר בהצלחה!\nמזהה: ${newId}\nמפתח עריכה: ${newEditKey}\n\nהם נשמרו אוטומטית בהגדרות שלך.\n⚠️ שמור אותם במקום בטוח כדי שתוכל לשחזר בעתיד.`);
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
