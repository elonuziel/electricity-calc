// ───── CSV Export ─────
function exportToCSV() {
    if (bills.length === 0) { alert("אין נתונים לייצוא"); return; }

    let csv = "\uFEFF"; // BOM for Excel Hebrew
    csv += "תאריך,חשבון ראשי - סכום,חשבון ראשי - קוטש,דירה עליונה - קריאה,דירה עליונה - צריכה,דירה עליונה - לתשלום,דירה תחתונה - קריאה,דירה תחתונה - צריכה,דירה תחתונה - לתשלום,רכוש משותף - קוטש,רכוש משותף - לתשלום\n";

    let prevTop = initialSettings.top;
    let prevBottom = initialSettings.bottom;

    bills.forEach(bill => {
        const rate = bill.main.kwh > 0 ? bill.main.amount / bill.main.kwh : 0;
        const consTop = bill.readings.top - prevTop;
        const consBottom = bill.readings.bottom - prevBottom;
        const payTop = consTop * rate;
        const payBottom = consBottom * rate;
        const commonKwh = bill.main.kwh - (consTop + consBottom);
        const commonPay = commonKwh * rate;

        csv += [
            bill.date, bill.main.amount, bill.main.kwh,
            bill.readings.top, consTop, payTop.toFixed(2),
            bill.readings.bottom, consBottom, payBottom.toFixed(2),
            commonKwh, commonPay.toFixed(2)
        ].join(",") + "\n";

        prevTop = bill.readings.top;
        prevBottom = bill.readings.bottom;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], 'electricity_data.csv', { type: 'text/csv' });

    // Modern mobile (Android/iOS with Web Share Level 2): native share sheet
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'electricity_data.csv' })
            .catch(err => { if (err.name !== 'AbortError') alert('שגיאה בייצוא: ' + err.message); });
    } else if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
        // Older mobile: show raw text in a modal to copy manually
        showCsvFallback(csv);
    } else {
        // Desktop: standard anchor download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'electricity_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// ───── CSV Import ─────

/**
 * Sanitize and validate CSV data before import
 */
function sanitizeCSVData(value) {
    if (typeof value !== 'string') return value;
    
    // Remove any potential HTML/script content
    return value.trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .substring(0, 1000); // Limit length for safety
}

/**
 * Validate CSV row data structure
 */
function isValidCSVRow(date, amount, kwh, readingTop, readingBottom) {
    // Check if values are reasonable numbers
    if (isNaN(amount) || isNaN(kwh) || isNaN(readingTop) || isNaN(readingBottom)) {
        return false;
    }
    
    // Check for negative values (invalid for readings)
    if (readingTop < 0 || readingBottom < 0) {
        return false;
    }
    
    // Check if amounts are reasonable (not too large)
    if (amount < 0 || amount > 1000000 || kwh < 0 || kwh > 100000) {
        return false;
    }
    
    // Validate date format (YYYY-MM-DD or similar)
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return false;
    }
    
    return true;
}

function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5242880) {
        alert('הקובץ גדול מדי (מקסימום 5MB).');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const text = e.target.result.replace(/^\uFEFF/, ''); // strip BOM
            const lines = text.split('\n').filter(l => l.trim() !== '');

            if (lines.length < 2) {
                alert('הקובץ ריק או לא תקין.');
                event.target.value = '';
                return;
            }

            // Skip header row
            const dataLines = lines.slice(1);
            let imported = 0;
            let skipped = 0;
            const errors = [];

            dataLines.forEach((line, index) => {
                const cols = line.split(',').map(col => sanitizeCSVData(col));
                
                if (cols.length < 9) { 
                    skipped++;
                    errors.push(`שורה ${index + 2}: מעט עמודות מידי`);
                    return;
                }

                const date = cols[0].trim();
                const amount = parseFloat(cols[1]);
                const kwh = parseFloat(cols[2]);
                const readingTop = parseFloat(cols[3]);
                const readingBottom = parseFloat(cols[6]);

                // Validate parsed values with strict rules
                if (!isValidCSVRow(date, amount, kwh, readingTop, readingBottom)) {
                    skipped++;
                    errors.push(`שורה ${index + 2}: נתונים לא תקינים`);
                    return;
                }

                // Skip if a bill with the same date already exists
                if (bills.some(b => b.date === date)) {
                    skipped++;
                    errors.push(`שורה ${index + 2}: חשבונית בתאריך זה קיימת כבר`);
                    return;
                }

                const billId = generateUniqueId();
                bills.push({
                    id: billId,
                    date: date,
                    main: { amount: amount, kwh: kwh },
                    readings: { top: readingTop, bottom: readingBottom }
                });
                imported++;
            });

            bills.sort((a, b) => new Date(a.date) - new Date(b.date));
            saveData();
            renderBills();

            let message = `ייבוא הושלם: ${imported} חשבונות יובאו, ${skipped} שורות דולגו.`;
            if (errors.length > 0 && errors.length <= 5) {
                message += '\n\nבעיות:\n' + errors.slice(0, 5).join('\n');
            }
            alert(message);
        } catch (err) {
            alert('שגיאה בקריאת הקובץ: ' + err.message);
            console.error('CSV import error:', err);
        }
        event.target.value = '';
    };
    
    reader.onerror = function() {
        alert('שגיאה בקריאת הקובץ. אנא נסה שוב.');
        event.target.value = '';
    };
    
    reader.readAsText(file, 'UTF-8');
}
