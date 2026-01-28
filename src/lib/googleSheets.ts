import { google } from 'googleapis';

// Interface for Pricing Data from Sheet
export interface PricingRow {
    model: string;
    storage: string;
    price: number;
}

// Interface for Config Data from Sheet
export interface ConfigRow {
    key: string;
    value: number;
    description?: string;
}

export interface LeadData {
    timestamp: string;
    name: string;
    whatsapp: string;
    model: string;
    storage: string;
    batteryHealth: number;
    screenCondition: string;
    bodyCondition: string;
    boxCondition: string;
    rank: string;
    priceMin: number;
    priceMax: number;
}

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets', // Read/Write access
];

export async function getGoogleSheetsClient() {
    try {
        // Check for credentials in environment variables (Best for Vercel/Cloud)
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newlines in env vars

        if (clientEmail && privateKey) {
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey,
                },
                scopes: SCOPES,
            });
            return google.sheets({ version: 'v4', auth });
        }

        // Fallback to local file (Best for local development)
        const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './service-account.json';

        const auth = new google.auth.GoogleAuth({
            keyFile,
            scopes: SCOPES,
        });

        return google.sheets({ version: 'v4', auth });
    } catch (error) {
        console.error('Error initializing Google Sheets client:', error);
        throw new Error('Failed to initialize Google Sheets client');
    }
}

export async function getPricingData(): Promise<PricingRow[]> {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Pricing!A2:C'; // Assuming Sheet Name is 'Pricing', Columns: Model, Storage, Price

    if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEET_ID is not defined');
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Map rows to PricingRow interface
        // Assuming structure: [Model, Storage, Price]
        return rows.map((row) => ({
            model: row[0] as string,
            storage: row[1] as string,
            price: parseInt((row[2] as string).replace(/[^0-9]/g, ''), 10) || 0, // Clean price string
        }));
    } catch (error) {
        console.error('Error fetching pricing data:', error);
        return [];
    }
}

export async function getConfigData(): Promise<ConfigRow[]> {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Config!A2:C'; // Assuming Sheet Name is 'Config', Key, Value, Desc

    if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEET_ID is not defined');
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        return rows.map((row) => ({
            key: row[0] as string,
            value: parseInt((row[1] as string).replace(/[^0-9-]/g, ''), 10) || 0,
            description: row[2] as string,
        }));
    } catch (error) {
        // If Config sheet doesn't exist or error, return empty
        console.warn('Error fetching config data (using defaults might be safer):', error);
        return [];
    }
}

export async function appendLead(data: LeadData): Promise<boolean> {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Leads!A:K'; // Append to columns A through K

    if (!spreadsheetId) {
        console.error('GOOGLE_SHEET_ID is not defined');
        return false;
    }

    try {
        const values = [
            [
                data.timestamp,
                data.name,
                data.whatsapp,
                data.model,
                data.storage,
                data.batteryHealth,
                data.screenCondition,
                data.bodyCondition,
                data.boxCondition,
                data.rank,
                data.priceMin,
                data.priceMax
            ]
        ];

        // Also need to add 'https://www.googleapis.com/auth/spreadsheets' to SCOPES if we want write access
        // Currently it is readonly: const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
        // We need to update that too.

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        return true;
    } catch (error) {
        console.error('Error appending lead to Google Sheets:', error);
        return false;
    }
}
