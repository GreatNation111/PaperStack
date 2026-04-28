import { logEvent } from 'firebase/analytics';
import { analytics } from '@/lib/firebase';

export const useAnalytics = () => {
  const trackEvent = async (eventName: string, params?: Record<string, any>) => {
    try {
      const a = await analytics;
      if (a) {
        logEvent(a, eventName, params);
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const trackPageView = async (pageName: string) => {
    trackEvent('page_view', { page_path: pageName });
  };

  return { trackEvent, trackPageView };
};
