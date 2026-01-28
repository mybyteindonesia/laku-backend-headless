import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugSheet() {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './service-account.json';
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const auth = new google.auth.GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        console.log('Fetching Spreadsheet Metadata...');
        const meta = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        console.log('Spreadsheet Title:', meta.data.properties?.title);
        console.log('Sheets found:', meta.data.sheets?.length);

        meta.data.sheets?.forEach((sheet, i) => {
            console.log(`\n[Sheet ${i}]`);
            console.log(`  Title: "${sheet.properties?.title}"`);
            console.log(`  ID: ${sheet.properties?.sheetId}`);
            console.log(`  Grid: R${sheet.properties?.gridProperties?.rowCount} x C${sheet.properties?.gridProperties?.columnCount}`);
        });

        // Try to read A1:Z10 of the first sheet found
        if (meta.data.sheets && meta.data.sheets.length > 0) {
            const firstSheetTitle = meta.data.sheets[0].properties?.title;
            console.log(`\nPeeking at content of first sheet "${firstSheetTitle}" (A1:E5)...`);

            const preview = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `'${firstSheetTitle}'!A1:E5`
            });

            console.log('Data found:', preview.data.values);
        }

    } catch (error) {
        console.error('Debug Error:', error);
    }
}

debugSheet();
