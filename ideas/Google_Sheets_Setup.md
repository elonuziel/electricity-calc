# Guide: Connecting the Calculator to Google Sheets (Free and error-free)

Since the application runs as a local file on your computer or phone (`file://`), simple cloud backups are often blocked by browser security protocols (CORS errors). The most reliable and secure method—which never fails—is connecting it to a Google Sheet.

**This is a one-time setup that takes about 2 minutes:**

1. Go to **Google Drive** and create a new **Google Sheets** file.
2. In the top menu, click **Extensions** -> then **Apps Script**.
3. A code editor window will open. Delete any existing code and paste the following:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getRange("A1").getValue();
  if(!data) {
    data = '{"bills":[],"initialSettings":{"top":null,"bottom":null}}';
  }
  
  // Add free CORS access
  return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rawData = e.parameter.data;
  
  sheet.getRange("A1").setValue(rawData);
  
  return ContentService.createTextOutput(JSON.stringify({"success": true})).setMimeType(ContentService.MimeType.JSON);
}
```

4. Click the **Save** icon (floppy disk) at the top.
5. Click **Deploy** (top right) -> **New deployment**.
6. Click the gear icon ⚙️ on the left and select **Web app**.
   - **Description**: `Electricity Sync`
   - **Who has access**: Select **Anyone** (This is required for the app to communicate with the sheet).
7. Click **Deploy**.
8. **Authorize Access**: Google will prompt you. Click "Review Permissions", select your account, then click "Advanced" -> "Go to project (unsafe)" at the bottom and confirm.
9. A window will appear with the **Web app URL**. Copy the long address (it starts with `https://script.google.com/macros/s/...`).

**That's it!** Paste this URL into the "Web App URL" field in the application. Your data will now sync perfectly across all your devices and be securely backed up on Google's servers.
