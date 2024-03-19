import type { ReactNode } from 'react';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface IBanner {
    message: string;
    variant?: BannerVariant;
    sticky?: boolean;
    icon?: string;
    link?: string;
    linkClicked?: () => void;
    linkText?: string;
    plausibleEvent?: string;
    dialogTitle?: string;
    dialog?: ReactNode;
}

export interface IInternalBanner extends Omit<IBanner, 'plausibleEvent'> {
    id: number;
    enabled: boolean;
    createdAt: string;
}
