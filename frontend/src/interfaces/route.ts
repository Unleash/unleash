import { FunctionComponent } from 'react';

export interface IRoute {
    path: string;
    title: string;
    type: string;
    layout?: string;
    parent?: string;
    flag?: string;
    hidden?: boolean;
    component: FunctionComponent;
    menu: IRouteMenu;
}

interface IRouteMenu {
    mobile?: boolean;
    advanced?: boolean;
    adminSettings?: boolean;
}
