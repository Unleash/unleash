declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
        google_tag_manager?: any;
    }
}

export {};
