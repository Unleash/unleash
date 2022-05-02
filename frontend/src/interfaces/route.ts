import { VoidFunctionComponent } from 'react';

export interface IRoute {
    path: string;
    title: string;
    type: string;
    layout?: string;
    parent?: string;
    flag?: string;
    hidden?: boolean;
    component: VoidFunctionComponent;
    menu: IRouteMenu;
}

interface IRouteMenu {
    mobile?: boolean;
    advanced?: boolean;
    adminSettings?: boolean;
}
