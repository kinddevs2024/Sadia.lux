import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_API_KEY;
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

let isPosthogReady = false;

export const initAnalytics = () => {
  if (!POSTHOG_KEY) return;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: false,
    });
    isPosthogReady = true;
  } catch (e) {
    console.error("PostHog init error", e);
    isPosthogReady = false;
  }
};

export const trackEvent = (name, properties = {}) => {
  if (!isPosthogReady) return;
  try {
    posthog.capture(name, properties);
  } catch (e) {
    console.error("PostHog capture error", e);
  }
};
