import type { INavigationMenuItem } from 'interfaces/route';

export const adminGroups: Record<string, string> = {
    users: 'User config',
    access: 'Access control',
    sso: 'Single sign-on',
    network: 'Network',
    instance: 'Instance config',
};

export const adminRoutes: INavigationMenuItem[] = [
    // Admin home
    {
        path: '/admin',
        title: 'Admin home',
        menu: {},
    },

    // Users
    {
        path: '/admin/users',
        title: 'Users',
        menu: { adminSettings: true },
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
        path: '/admin/roles',
        title: 'Root roles',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
        group: 'users',
    },
    {
        path: '/admin/roles/project-roles',
        title: 'Project roles',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
        group: 'users',
    },
    {
        path: '/admin/logins',
        title: 'Login history',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
        group: 'users',
    },

    // Service accounts
    {
        path: '/admin/service-accounts',
        title: 'Service accounts',
        menu: {
            adminSettings: true,
            mode: ['enterprise'],
        },
    },

    // Access control
    {
        path: '/admin/api',
        title: 'API access',
        menu: { adminSettings: true },
        group: 'access',
    },
    {
        path: '/admin/cors',
        title: 'CORS origins',
        menu: { adminSettings: true },
        group: 'access',
    },

    // Single sign-on/login
    {
        path: '/admin/auth/oidc',
        title: 'Open ID Connect',
        menu: { adminSettings: true, mode: ['enterprise'] },
        group: 'sso',
    },
    {
        path: '/admin/auth/saml',
        title: 'SAML 2.0',
        menu: { adminSettings: true, mode: ['enterprise'] },
        group: 'sso',
    },
    {
        path: '/admin/auth/password',
        title: 'Password login',
        menu: { adminSettings: true, mode: ['enterprise'] },
        group: 'sso',
    },
    {
        path: '/admin/auth/google',
        title: 'Google',
        menu: { adminSettings: true, mode: ['enterprise'] },
        flag: 'googleAuthEnabled',
        group: 'sso',
    },
    {
        path: '/admin/auth/scim',
        title: 'SCIM',
        menu: { adminSettings: true, mode: ['enterprise'] },
        group: 'sso',
    },

    // Enterprise Edge
    {
        path: '/admin/enterprise-edge',
        title: 'Enterprise Edge',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        flag: 'enterpriseEdgeUI',
    },

    // Network
    {
        path: '/admin/network',
        title: 'Overview',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        group: 'network',
    },
    {
        path: '/admin/network/traffic',
        title: 'Traffic',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        group: 'network',
    },
    {
        path: '/admin/network/connected-edges',
        title: 'Connected edges',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        group: 'network',
        flag: 'edgeObservability',
        notFlag: 'enterpriseEdgeUI',
    },
    {
        path: '/admin/network/backend-connections',
        title: 'Backend connections',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        group: 'network',
        flag: 'consumptionModelUI',
    },
    {
        path: '/admin/network/frontend-data-usage',
        title: 'Frontend data usage',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        group: 'network',
        flag: 'consumptionModelUI',
    },
    {
        path: '/admin/network/data-usage',
        title: 'Data usage',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        group: 'network',
        notFlag: 'consumptionModelUI',
    },

    // Instance configuration
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
        path: '/admin/license',
        title: 'License',
        menu: { adminSettings: true, mode: ['enterprise'] },
        flag: 'enableLicense',
        group: 'instance',
    },
    {
        path: '/admin/instance',
        title: 'Instance stats',
        menu: { adminSettings: true },
        group: 'instance',
    },
    {
        path: '/admin/instance-privacy',
        title: 'Instance privacy',
        menu: { adminSettings: true },
        group: 'instance',
    },

    // Billing
    {
        path: '/admin/billing',
        title: 'Billing & invoices',
        menu: { adminSettings: true, billing: true },
    },

    // Event log
    {
        path: '/history',
        title: 'Event log',
        menu: { adminSettings: true },
    },
];
