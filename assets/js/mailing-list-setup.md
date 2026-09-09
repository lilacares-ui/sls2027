# Connecting the mailing-list form to a Google Sheet

The form on the Contact page (`#mailing-list-form`) posts an email address to a
Google Apps Script "Web App" endpoint, which appends it as a row in a Google Sheet.
No paid backend needed — just Google Sheets + Apps Script (free with any Google account).

## 1. Create the Sheet

Create a new Google Sheet (or use an existing one) to hold signups. Row 1 can be
headers, e.g. `Timestamp | Email`.

## 2. Add the Apps Script

In the Sheet: **Extensions > Apps Script**. Delete *everything* in the editor and
paste exactly this:

```js
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var email = e.parameter.email;
  sheet.appendRow([new Date(), email]);
  return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Important — this has to be a plain top-level function declaration, exactly as
written above (`function doPost(e) { ... }`). Do **not** write it as
`const doPost = (e) => { ... }` — Apps Script only recognizes `doPost` as a web
app entry point when it's declared this way; an arrow function/const version
will deploy without error but silently fail every request with
`Script function not found: doPost`.

Click the **save icon** (disk icon, or Ctrl+S / Cmd+S) before doing anything else.
If there's a red underline anywhere in the editor, fix it before continuing —
a syntax error anywhere in the file can also cause `doPost` to not be found.

## 3. Deploy as a Web App

1. Click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set **Execute as**: Me (your account).
4. Set **Who has access**: Anyone.
5. Click **Deploy**, then authorize it (it's your own script, so this is safe).
6. Copy the **Web app URL** it gives you (ends in `/exec`).

### If you edit the code later

Saving the code does **not** update an already-deployed URL. To push a code
change live on the *same* URL:

1. **Deploy > Manage deployments**.
2. Click the pencil/edit icon on the existing deployment.
3. Under **Version**, choose **New version**.
4. Click **Deploy** again.

(Creating a brand new deployment instead would give you a *different* URL,
which means updating `main.js` again — editing the existing one keeps the URL
stable.)

## 4. Wire it into the site

Open `assets/js/main.js` and find:

```js
const MAILING_LIST_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Replace the placeholder with your copied `/exec` URL.

## 5. Verify it actually works

Because the site's request uses `mode: 'no-cors'` (required for Apps Script Web
Apps), the browser can't read the real response — a "success" message on the
site does *not* guarantee the row was written. To check for real, run this from
a terminal (replace the URL with yours):

```bash
curl -s -i -X POST -F "email=test@example.com" "https://script.google.com/macros/s/YOUR_ID_HERE/exec" -L
```

- If it works, you'll get back `{"result":"success"}` and a new row will appear
  in the Sheet.
- If you instead see an HTML page with **"Script function not found: doPost"**,
  see the troubleshooting causes in Step 2 above (arrow function instead of a
  declaration, unsaved code, or a stale deployment version).

## Notes

- `mode: 'no-cors'` is the standard workaround for Apps Script Web Apps (they
  don't return CORS headers). The tradeoff is the site can't confirm success —
  use the `curl` check above whenever you want real confirmation.
- Publishing the Sheet to the web ("File > Share > Publish to web") is a
  completely separate, read-only feature — it doesn't accept submissions and
  isn't needed for this to work. If you'd published it while testing, you can
  undo that from the same menu ("Stop publishing").
