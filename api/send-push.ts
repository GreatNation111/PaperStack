import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// 1. Safe Initialization (Serverless environment cache protection)
if (!getApps().length) {
    let privateKey = process.env.FB_SA_PRIVATE_KEY || '';
    // Strip Vercel's secret quotes and rebuild linebreaks to fix verification errors
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    initializeApp({
        credential: cert({
            projectId: process.env.FB_SA_PROJECT_ID,
            clientEmail: process.env.FB_SA_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    });
}

// 2. The Dispatcher handler
export default async function handler(req: any, res: any) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { tokens, title, body, data } = req.body;

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: 'No valid device tokens provided.' });
        }

        const message = {
            notification: { title, body },
            data: data || {}, // Optional routing data or deep links
            tokens: tokens, // Array of specific device strings we saved earlier
        };

        // Dispatch the push to Apple/Google servers
        const response = await getMessaging().sendEachForMulticast(message);

        res.status(200).json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        });

    } catch (error: any) {
        console.error('Error dispatching push notification:', error);
        res.status(500).json({ error: 'Internal server error while dispatching push.', details: error.message });
    }
}
