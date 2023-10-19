export type BannerVariant = 'warning' | 'info' | 'error' | 'success';

export interface IBanner {
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

export interface IInternalBanner extends IBanner {
    id: number;
    enabled: boolean;
    createdAt: string;
}
