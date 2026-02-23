// ───── Init ─────
document.addEventListener('DOMContentLoaded', () => {
    const savedBills = localStorage.getItem('elecBills');
    const savedSettings = localStorage.getItem('elecSettings');
    const savedCloudId = localStorage.getItem('elecCloudBackupId');
    const savedCloudKey = localStorage.getItem('elecCloudAccessKey');

    if (savedBills) bills = JSON.parse(savedBills);
    if (savedSettings) initialSettings = JSON.parse(savedSettings);
    if (savedCloudId) document.getElementById('cloudBackupId').value = savedCloudId;
    if (savedCloudKey) document.getElementById('cloudAccessKey').value = savedCloudKey;

    bills.sort((a, b) => new Date(a.date) - new Date(b.date));
    renderSettings();
    renderBills();
    updateInitBanner();
});
