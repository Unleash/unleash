import { VoidFunctionComponent } from 'react';

export interface IRoute {
    path: string;
    title: string;
    type: 'protected' | 'unprotected';
    layout?: string;
    parent?: string;
    flag?: string;
    hidden?: boolean;
    enterprise?: boolean;
    component: VoidFunctionComponent;
    menu: IRouteMenu;
}

interface IRouteMenu {
    mobile?: boolean;
    advanced?: boolean;
    adminSettings?: boolean;
    isBilling?: boolean;
}
