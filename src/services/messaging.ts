import { getMessaging, getToken } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, app } from '../lib/firebase';

export const requestNotificationPermissionAndSaveToken = async (userId: string) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const messaging = getMessaging(app);

            const targetToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            if (targetToken) {
                // Save the FMC token to the user document
                await updateDoc(doc(db, 'users', userId), {
                    fcmTokens: arrayUnion(targetToken)
                });
                if (import.meta.env.DEV) console.log('Push notifications enabled and token registered.');
                return targetToken;
            } else {
                console.warn('No registration token available. Request permission to generate one.');
            }
        } else {
            console.warn('Notification permission not granted.');
        }
    } catch (error) {
        console.error('An error occurred while setting up Push Notifications:', error);
    }
    return null;
};
