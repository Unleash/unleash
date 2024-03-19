import type { INavigationMenuItem } from 'interfaces/route';

export const adminGroups: Record<string, string> = {
    users: 'User administration',
    access: 'Access control',
    instance: 'Instance configuration',
    log: 'Logs',
    other: 'Other',
};

export const adminRoutes: INavigationMenuItem[] = [
    {
        path: '/admin/users',
        title: 'Users',
        menu: { adminSettings: true },
        group: 'users',
    },
    {
        path: '/admin/service-accounts',
        title: 'Service accounts',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
        group: 'users',
    },
    {
        path: '/admin/groups',
        title: 'Groups',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
        group: 'users',
    },
    {
        path: '/admin/roles/*',
        title: 'Roles',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
        group: 'users',
    },
    {
        path: '/admin/api',
        title: 'API access',
        menu: { adminSettings: true },
        group: 'access',
    },
    {
        path: '/admin/cors',
        title: 'CORS origins',
        flag: 'embedProxyFrontend',
        menu: { adminSettings: true },
        group: 'access',
    },
    {
        path: '/admin/auth',
        title: 'Single sign-on',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        group: 'access',
    },
    {
        path: '/admin/network/*',
        title: 'Network',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        configFlag: 'networkViewEnabled',
        group: 'instance',
    },
    {
        path: '/admin/maintenance',
        title: 'Maintenance',
        menu: { adminSettings: true },
        group: 'instance',
    },
    {
        path: '/admin/banners',
        title: 'Banners',
        menu: { adminSettings: true, mode: ['enterprise'] },
        group: 'instance',
    },
    {
        path: '/admin/instance',
        title: 'Instance stats',
        menu: { adminSettings: true },
        group: 'instance',
    },
    {
        path: '/admin/license',
        title: 'License',
        menu: { adminSettings: true, mode: ['enterprise'] },
        flag: 'enableLicense',
        group: 'instance',
    },
    {
        path: '/admin/instance-privacy',
        title: 'Instance privacy',
        menu: { adminSettings: true },
        group: 'instance',
    },
    {
        path: '/admin/admin-invoices',
        title: 'Billing & invoices',
        menu: { adminSettings: true, billing: true },
        group: 'instance',
    },
    {
        path: '/admin/logins',
        title: 'Login history',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
        group: 'log',
    },
    {
        path: '/history',
        title: 'Event log',
        menu: { adminSettings: true },
        group: 'log',
    },
];
