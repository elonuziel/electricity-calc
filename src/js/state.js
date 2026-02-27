// ───── State ─────
let bills = [];
let initialSettings = { top: null, bottom: null };
let editingBillId = null;

function saveData() {
    localStorage.setItem('elecBills', JSON.stringify(bills));
}

function hasInitialReadings() {
    return initialSettings.top !== null && initialSettings.bottom !== null;
}

function resetAllData() {
    if (confirm('אזהרה: פעולה זו תמחק את כל החשבונות ואת כל ההגדרות מהמכשיר הזה.\nהאם את/ה בטוח/ה?')) {
        if (confirm('האם אתה באמת בטוח? הנתונים יימחקו ולא ניתן יהיה לשחזר אותם.')) {
            localStorage.removeItem('elecBills');
            localStorage.removeItem('elecSettings');
            bills = [];
            initialSettings = { top: null, bottom: null };
            renderSettings();
            renderBills();
            updateInitBanner();
            alert('כל הנתונים נמחקו בהצלחה.');
        }
    }
}
