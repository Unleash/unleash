import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ProjectPage } from './getProjectPage.ts';

export type ProjectNavItem = { page: ProjectPage; label: string; to: string };

export const useProjectNavItems = (projectId: string) => {
    const { isOss } = useUiConfig();
    const base = `/projects/${projectId}`;

    const primary: ProjectNavItem[] = [
        { page: 'flags', label: 'Flags', to: base },
        ...(isOss()
            ? []
            : [
                  {
                      page: 'change-requests' as const,
                      label: 'Change requests',
                      to: `${base}/change-requests`,
                  },
              ]),
    ];
    const more: ProjectNavItem[] = [
        { page: 'logs', label: 'Event log', to: `${base}/logs` },
        {
            page: 'settings',
            label: 'Configure project',
            to: isOss() ? `${base}/settings/api-access` : `${base}/settings`,
        },
    ];

    return { primary, more };
};
