# Connecting Noctix Whitelist Portal to Google Sheets

Follow these step-by-step instructions to configure your early access task form to save all entries into a Google Sheet.

---

## Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name the sheet (e.g., `Noctix Whitelist Database`).
3. In the first row of your sheet, enter these headers:
   * **Column A**: `Timestamp`
   * **Column B**: `Twitter/X Username`
   * **Column C**: `EVM Wallet Address`

---

## Step 2: Open Google Apps Script
1. In the Google Sheets menu, click on **Extensions** ➜ **Apps Script**.
2. Delete any default code in the editor (`Code.gs`).
3. Copy the script code below and paste it into the editor:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Twitter/X Username", "EVM Wallet Address"]);
    }
    
    // Append the row of data
    sheet.appendRow([
      new Date(),
      data.username,
      data.evmAddress
    ]);
    
    // Return a success response
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return an error response
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click the **Save** icon (disk symbol) or press `Ctrl + S` to save the script.

---

## Step 3: Deploy as a Web App
1. Click the **Deploy** button in the top right corner and select **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Fill out the deployment configuration:
   * **Description**: `Noctix Web API`
   * **Execute as**: `Me (your-email@gmail.com)`
   * **Who has access**: `Anyone` (This is critical so the website can send data to it without logging into Google).
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize access**, choose your Google account, click **Advanced**, click **Go to Untitled project (unsafe)**, and click **Allow**.
6. Copy the **Web app URL** from the success screen (it starts with `https://script.google.com/macros/s/...`).

---

## Step 4: Configure the Web App URL in your Code
1. Open the file `form.js` in your project folder.
2. Locate the `GOOGLE_SCRIPT_URL` variable at the top of the file:
   ```javascript
   const GOOGLE_SCRIPT_URL = "";
   ```
3. Paste the Web App URL you copied from Step 3 in between the quotes:
   ```javascript
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb...your_deployment_id/exec";
   ```
4. Save the file and rebuild the site (`npm run build`).

All whitelist form submissions will now be written to your Google Sheet in real-time!
