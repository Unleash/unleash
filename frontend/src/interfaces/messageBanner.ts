export type BannerVariant = 'warning' | 'info' | 'error' | 'success';

export interface IMessageBanner {
    message: string;
    variant?: BannerVariant;
    sticky?: boolean;
    icon?: string;
    link?: string;
    linkText?: string;
    plausibleEvent?: string;
    dialogTitle?: string;
    dialog?: string;
}

export interface IInternalMessageBanner extends IMessageBanner {
    id: number;
    enabled: boolean;
    createdAt: string;
}
