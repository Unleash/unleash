export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

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

export interface IInternalBanner extends Omit<IBanner, 'plausibleEvent'> {
    id: number;
    enabled: boolean;
    createdAt: string;
}
