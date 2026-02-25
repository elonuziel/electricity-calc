// ───── Settings ─────
function toggleSettings() {
    document.getElementById('settingsPanel').classList.toggle('hidden');
}

function saveSettings() {
    const topVal = document.getElementById('initReadingTop').value;
    const bottomVal = document.getElementById('initReadingBottom').value;
    if (topVal) initialSettings.top = parseFloat(topVal);
    if (bottomVal) initialSettings.bottom = parseFloat(bottomVal);
    saveSettingsState(); // from state.js
    renderBills();
    alert('הגדרות נשמרו בהצלחה');
}

function saveSettingsState() {
    localStorage.setItem('elecSettings', JSON.stringify(initialSettings));
}

function renderSettings() {
    document.getElementById('initReadingTop').value = initialSettings.top ?? '';
    document.getElementById('initReadingBottom').value = initialSettings.bottom ?? '';
}

function updateInitBanner() {
    const banner = document.getElementById('initReadingsBanner');
    if (!hasInitialReadings() && bills.length === 0) {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

// ───── Initial Readings Modal ─────
function openInitReadingsModal() {
    document.getElementById('initReadingsModal').classList.remove('hidden');
    document.getElementById('initFormErrors').classList.add('hidden');
    document.getElementById('initTopInput').value = '';
    document.getElementById('initBottomInput').value = '';
}

function closeInitReadingsModal() {
    document.getElementById('initReadingsModal').classList.add('hidden');
}

function handleInitReadingsSubmit(e) {
    e.preventDefault();
    const topVal = parseFloat(document.getElementById('initTopInput').value);
    const bottomVal = parseFloat(document.getElementById('initBottomInput').value);
    const errors = [];

    if (isNaN(topVal)) errors.push('יש להזין קריאת מונה עליונה.');
    if (isNaN(bottomVal)) errors.push('יש להזין קריאת מונה תחתונה.');

    if (errors.length > 0) {
        const container = document.getElementById('initFormErrors');
        const list = document.getElementById('initFormErrorList');
        list.innerHTML = errors.map(err => `<li>${err}</li>`).join('');
        container.classList.remove('hidden');
        return;
    }

    initialSettings.top = topVal;
    initialSettings.bottom = bottomVal;
    saveSettingsState();
    renderSettings();
    closeInitReadingsModal();
    updateInitBanner();
    openModal(); // Open main bill modal
}

// ───── Modal (Add / Edit) ─────
function openModal(billId = null) {
    if (!billId && !hasInitialReadings()) {
        openInitReadingsModal();
        return;
    }
    document.getElementById('billModal').classList.remove('hidden');
    hideFormErrors();
    const modalTitle = document.getElementById('modalTitle');

    let prevTop = initialSettings.top;
    let prevBottom = initialSettings.bottom;

    if (billId) {
        editingBillId = billId;
        modalTitle.innerText = "עריכת חשבון";
        const bill = bills.find(b => b.id === billId);
        document.getElementById('billDate').value = bill.date;
        document.getElementById('mainAmount').value = bill.main.amount;
        document.getElementById('mainKwh').value = bill.main.kwh;
        document.getElementById('readingTop').value = bill.readings.top;
        document.getElementById('readingBottom').value = bill.readings.bottom;

        const idx = bills.findIndex(b => b.id === billId);
        if (idx > 0) {
            prevTop = bills[idx - 1].readings.top;
            prevBottom = bills[idx - 1].readings.bottom;
        }
    } else {
        editingBillId = null;
        modalTitle.innerText = "הוספת חשבון חדש";
        document.getElementById('billDate').valueAsDate = new Date();
        document.getElementById('mainAmount').value = '';
        document.getElementById('mainKwh').value = '';
        document.getElementById('readingTop').value = '';
        document.getElementById('readingBottom').value = '';

        if (bills.length > 0) {
            const last = bills[bills.length - 1];
            prevTop = last.readings.top;
            prevBottom = last.readings.bottom;
        }
    }

    document.getElementById('prevTopDisplay').innerText = prevTop;
    document.getElementById('prevBottomDisplay').innerText = prevBottom;
}

function closeModal() {
    document.getElementById('billModal').classList.add('hidden');
    editingBillId = null;
}

// ───── Validation ─────
function validateForm(formDate, formAmount, formKwh, formTop, formBottom) {
    const errors = [];

    let prevTop = initialSettings.top;
    let prevBottom = initialSettings.bottom;

    if (editingBillId) {
        const idx = bills.findIndex(b => b.id === editingBillId);
        if (idx > 0) {
            prevTop = bills[idx - 1].readings.top;
            prevBottom = bills[idx - 1].readings.bottom;
        }
    } else {
        if (bills.length > 0) {
            const last = bills[bills.length - 1];
            prevTop = last.readings.top;
            prevBottom = last.readings.bottom;
        }
    }

    if (!formKwh || formKwh <= 0) {
        errors.push('צריכה כללית (קוט"ש) חייבת להיות גדולה מ-0.');
    }

    if (!formAmount || formAmount <= 0) {
        errors.push('סכום לתשלום חייב להיות גדול מ-0.');
    }

    if (formTop < prevTop) {
        errors.push(`קריאת מונה עליונה (${formTop}) קטנה מהקריאה הקודמת (${prevTop}). צריכה שלילית אינה אפשרית.`);
    }

    if (formBottom < prevBottom) {
        errors.push(`קריאת מונה תחתונה (${formBottom}) קטנה מהקריאה הקודמת (${prevBottom}). צריכה שלילית אינה אפשרית.`);
    }

    const consTop = formTop - prevTop;
    const consBottom = formBottom - prevBottom;
    const totalTenants = consTop + consBottom;
    if (formKwh > 0 && totalTenants > formKwh) {
        errors.push(`סך צריכת הדירות (${totalTenants} קוט"ש) עולה על הצריכה הכללית (${formKwh} קוט"ש). בדקי את הנתונים.`);
    }

    return errors;
}

function showFormErrors(errors) {
    const container = document.getElementById('formErrors');
    const list = document.getElementById('formErrorList');
    list.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
    container.classList.remove('hidden');
}

function hideFormErrors() {
    document.getElementById('formErrors').classList.add('hidden');
}

// ───── Form Submit ─────
function handleFormSubmit(e) {
    e.preventDefault();

    const formDate = document.getElementById('billDate').value;
    const formAmount = parseFloat(document.getElementById('mainAmount').value);
    const formKwh = parseFloat(document.getElementById('mainKwh').value);
    const formTop = parseFloat(document.getElementById('readingTop').value);
    const formBottom = parseFloat(document.getElementById('readingBottom').value);

    const errors = validateForm(formDate, formAmount, formKwh, formTop, formBottom);
    if (errors.length > 0) {
        showFormErrors(errors);
        return;
    }
    hideFormErrors();

    if (editingBillId) {
        bills = bills.map(b => {
            if (b.id === editingBillId) {
                return { ...b, date: formDate, main: { amount: formAmount, kwh: formKwh }, readings: { top: formTop, bottom: formBottom } };
            }
            return b;
        });
    } else {
        bills.push({
            id: Date.now() + Math.random(),
            date: formDate,
            main: { amount: formAmount, kwh: formKwh },
            readings: { top: formTop, bottom: formBottom }
        });
    }

    bills.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveData();
    closeModal();
    renderBills();
}

function deleteBill(id) {
    if (confirm('האם את בטוחה שברצונך למחוק שורה זו?')) {
        bills = bills.filter(b => b.id !== id);
        saveData();
        renderBills();
    }
}

// ───── Render Bills ─────
function renderBills() {
    const container = document.getElementById('billsList');
    const emptyState = document.getElementById('emptyState');
    container.innerHTML = '';

    if (bills.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    let prevTop = initialSettings.top;
    let prevBottom = initialSettings.bottom;

    bills.forEach((bill) => {
        const rate = bill.main.kwh > 0 ? bill.main.amount / bill.main.kwh : 0;

        const consTop = bill.readings.top - prevTop;
        const consBottom = bill.readings.bottom - prevBottom;

        const payTop = consTop * rate;
        const payBottom = consBottom * rate;

        const commonKwh = bill.main.kwh - (consTop + consBottom);
        const commonPay = commonKwh * rate;

        const dateObj = new Date(bill.date);
        const dateStr = dateObj.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });

        const hasWarning = consTop < 0 || consBottom < 0 || commonKwh < 0;

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl p-0 card-shadow overflow-hidden';
        card.innerHTML = `
            <div class="bg-gray-100 p-3 flex justify-between items-center border-b">
                <span class="font-bold text-gray-700">${dateStr}</span>
                <div class="flex gap-2">
                    <button onclick="openModal(${bill.id})" class="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-200">
                        <i class="fas fa-edit"></i> עריכה
                    </button>
                    <button onclick="deleteBill(${bill.id})" class="text-red-400 hover:text-red-600 text-sm bg-white px-2 py-1 rounded border border-red-100">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>

            ${hasWarning ? `
            <div class="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-800 flex items-center gap-1">
                <i class="fas fa-exclamation-triangle"></i>
                <span>ערכים חריגים — בדקי את הקריאות.</span>
            </div>` : ''}

            <div class="p-4">
                <div class="flex justify-between mb-4 text-sm bg-gray-50 p-2 rounded">
                    <div class="text-center">
                        <div class="text-gray-500 text-xs">תעריף לקוט"ש</div>
                        <div class="font-bold">${rate.toFixed(4)} ₪</div>
                    </div>
                    <div class="text-center border-r border-l px-2">
                        <div class="text-gray-500 text-xs">סה"כ חשבון</div>
                        <div class="font-bold">${bill.main.amount.toFixed(2)} ₪</div>
                    </div>
                    <div class="text-center">
                        <div class="text-gray-500 text-xs">צריכה כללית</div>
                        <div class="font-bold">${bill.main.kwh} קוט"ש</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="border rounded-lg p-3 border-green-200 bg-green-50 relative">
                        <div class="absolute -top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">עליונה</div>
                        <div class="mt-2 text-center">
                            <span class="block text-2xl font-bold text-green-800">${payTop.toFixed(2)} ₪</span>
                            <span class="text-xs text-green-700">לתשלום</span>
                        </div>
                        <div class="mt-3 text-xs text-green-800 flex justify-between border-t border-green-200 pt-2">
                            <span>צריכה: <b>${consTop}</b></span>
                            <span>קריאה: ${bill.readings.top}</span>
                        </div>
                    </div>

                    <div class="border rounded-lg p-3 border-blue-200 bg-blue-50 relative">
                        <div class="absolute -top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">תחתונה</div>
                        <div class="mt-2 text-center">
                            <span class="block text-2xl font-bold text-blue-800">${payBottom.toFixed(2)} ₪</span>
                            <span class="text-xs text-blue-700">לתשלום</span>
                        </div>
                        <div class="mt-3 text-xs text-blue-800 flex justify-between border-t border-blue-200 pt-2">
                            <span>צריכה: <b>${consBottom}</b></span>
                            <span>קריאה: ${bill.readings.bottom}</span>
                        </div>
                    </div>
                </div>

                <div class="border rounded-lg p-3 ${commonKwh < 0 ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'} relative">
                    <div class="absolute -top-2 right-2 ${commonKwh < 0 ? 'bg-red-600' : 'bg-orange-500'} text-white text-xs px-2 py-0.5 rounded">רכוש משותף</div>
                    <div class="mt-2 flex justify-between items-center">
                        <div class="text-center flex-1">
                            <span class="block text-lg font-bold ${commonKwh < 0 ? 'text-red-800' : 'text-orange-800'}">${commonKwh} קוט"ש</span>
                            <span class="text-xs ${commonKwh < 0 ? 'text-red-600' : 'text-orange-600'}">צריכה משותפת</span>
                        </div>
                        <div class="text-center flex-1 border-r pr-3">
                            <span class="block text-lg font-bold ${commonKwh < 0 ? 'text-red-800' : 'text-orange-800'}">${commonPay.toFixed(2)} ₪</span>
                            <span class="text-xs ${commonKwh < 0 ? 'text-red-600' : 'text-orange-600'}">עלות</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);

        prevTop = bill.readings.top;
        prevBottom = bill.readings.bottom;
    });
}

// ───── Backup Success Modal ─────
function showBackupSuccessModal(id, editKey) {
    document.getElementById('backupSuccessId').textContent = id;
    document.getElementById('backupSuccessKey').textContent = editKey;

    // Reset copy icons
    document.getElementById('copyBtnId').innerHTML = '<i class="fas fa-copy"></i>';
    document.getElementById('copyBtnKey').innerHTML = '<i class="fas fa-copy"></i>';

    document.getElementById('backupSuccessModal').classList.remove('hidden');
}

function closeBackupSuccessModal() {
    document.getElementById('backupSuccessModal').classList.add('hidden');
}

function copyToClipboard(elementId, btnId) {
    const textToCopy = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.getElementById(btnId);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check text-green-600"></i>';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
