import type { VoidFunctionComponent } from 'react';
import type { UiFlags, IUiConfig } from 'interfaces/uiConfig';

export interface IRoute {
    path: string;
    title: string;
    type: 'protected' | 'unprotected';
    layout?: string;
    parent?: string;
    flag?: keyof UiFlags;
    notFlag?: keyof UiFlags;
    configFlag?: keyof IUiConfig;
    hidden?: boolean;
    enterprise?: boolean;
    component: VoidFunctionComponent;
    menu: IRouteMenu;
    isStandalone?: boolean;
}

export interface INavigationMenuItem {
    path: string;
    title: string;
    menu: IRouteMenu;
    flag?: keyof UiFlags;
    notFlag?: keyof UiFlags;
    configFlag?: keyof IUiConfig;
    group?: string;
    enterprise?: boolean;
    isNew?: boolean;
}

interface IRouteMenu {
    main?: boolean;
    primary?: boolean;
    adminSettings?: boolean;
    mode?: Array<'pro' | 'enterprise'>;
    billing?: boolean;
}
