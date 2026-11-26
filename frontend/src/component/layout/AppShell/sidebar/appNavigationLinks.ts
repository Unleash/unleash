export type AppNavigationLink = {
    to: string;
    label: string;
    end?: boolean;
};

export const appNavigationLinks = {
    home: { to: '/personal', label: 'Home' },
    changeRequests: { to: '/change-requests', label: 'Change requests' },
    projects: { to: '/projects', label: 'Projects', end: true },
    flagsOverview: { to: '/search', label: 'Flags overview' },
    playground: { to: '/playground', label: 'Playground' },
    analytics: { to: '/insights', label: 'Analytics' },
    impactViews: { to: '/impact-views', label: 'Impact views' },
} satisfies Record<string, AppNavigationLink>;
