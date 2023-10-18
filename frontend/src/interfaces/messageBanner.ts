export type BannerVariant = 'warning' | 'info' | 'error' | 'success';

export interface IMessageBanner {
    message: string;
    enabled?: boolean;
    variant?: BannerVariant;
    sticky?: boolean;
    icon?: string;
    link?: string;
    linkText?: string;
    plausibleEvent?: string;
    dialogTitle?: string;
    dialog?: string;
}
