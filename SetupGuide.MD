# Setup Guide: Google Sheets & Vercel

This backend relies on **Google Sheets** as its "CMS" (Content Management System) for pricing and **Vercel** for hosting.

---

## Part 1: Google Sheets Setup

The app reads pricing and configurations from a Google Sheet and saves new leads into it.

### 1. Create Google Cloud Project
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a **New Project** (e.g., `Laku Backend`).
3.  Enable **Google Sheets API** in "APIs & Services".

### 2. Create Service Account
1.  Go to **IAM & Admin** > **Service Accounts**.
2.  Create a new Service Account (e.g., `sheets-reader`).
3.  Grant it **Viewer** or **Editor** role (Editor is required to write leads).
4.  Create and download a **JSON Key** for this account.
5.  Rename the file to `service-account.json` and place it in the project root for local dev.

### 3. Share the Sheet
1.  Create a Google Sheet with tabs: `Pricing`, `Config`, `Leads`.
2.  Share the sheet with the **Service Account Email** (e.g., `sheets-reader@...gserviceaccount.com`) as **Editor**.
3.  Copy the **Spreadsheet ID** from the URL (between `/d/` and `/edit`).

---

## Part 2: Environment Variables

These variables must be set in `.env.local` (for local dev) and **Vercel Settings** (for production).

| Variable | Description |
| :--- | :--- |
| `GOOGLE_SHEET_ID` | The ID of your Google Spreadsheet. |
| `GOOGLE_CLIENT_EMAIL` | The `client_email` from your `service-account.json`. |
| `GOOGLE_PRIVATE_KEY` | The `private_key` from your `service-account.json`. **NOTE:** In Vercel, copy the entire key including `-----BEGIN PRIVATE KEY...`. |
| `N8N_WEBHOOK_URL` | (Optional) URL to trigger N8N workflow on new lead submission. |

**Example `.env.local`:**
```bash
GOOGLE_SHEET_ID=1xYz_your_sheet_id_here
GOOGLE_CLIENT_EMAIL=sheets-reader@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"
N8N_WEBHOOK_URL=https://n8n.your-domain.com/webhook/...
```

---

## Part 3: Deploy to Vercel

1.  Push this code to GitHub.
2.  Import the repo in **Vercel**.
3.  In "Configure Project", add the Environment Variables above.
4.  Click **Deploy**.
