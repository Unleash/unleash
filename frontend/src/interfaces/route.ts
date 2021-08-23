import React from 'react';

interface IRoute {
    path: string;
    icon?: string;
    title?: string;
    component: React.ComponentType;
    type: string;
    layout: string;
    hidden?: boolean;
    flag?: string;
    parent?: string;
}

export default IRoute;
