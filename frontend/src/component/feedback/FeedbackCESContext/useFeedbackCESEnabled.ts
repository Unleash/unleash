export const useFeedbackCESEnabled = (): boolean => {
    const { hostname } = window.location;

    return (
        hostname === 'localhost' ||
        hostname.endsWith('.vercel.app') ||
        hostname.endsWith('.getunleash.io') ||
        hostname.endsWith('.unleash-hosted.com')
    );
};
