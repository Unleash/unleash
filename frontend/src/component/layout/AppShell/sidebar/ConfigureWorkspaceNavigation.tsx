import type { FC } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getNavRoutes } from 'component/menu/routes';
import { normalizeRoutePath } from 'component/common/util';
import { useRoutes } from '../../MainLayout/NavigationSidebar/useRoutes.ts';
import { IconRenderer } from '../../MainLayout/NavigationSidebar/IconRenderer.tsx';
import { SidebarButton } from './SidebarButton.tsx';
import { SidebarLink } from './SidebarLink.tsx';
import { SidebarSection } from './SidebarSection.tsx';
import { createPageMatcher } from './createPageMatcher.ts';

// Matches every workspace path regardless of plan: the filtered list depends on
// ui-config and instance status, so a deep link would show the app navigation
// until they load.
export const isConfigureWorkspacePage = createPageMatcher(
    getNavRoutes().map((route) => normalizeRoutePath(route).path),
);

export const ConfigureWorkspaceNavigation: FC<{ onBack: () => void }> = ({
    onBack,
}) => {
    const { routes } = useRoutes();

    return (
        <>
            <SidebarButton
                icon={<ArrowBackIcon />}
                label='Back to app'
                onClick={onBack}
            />
            <SidebarSection title='Configure workspace'>
                {routes.mainNavRoutes.map((route) => (
                    <SidebarLink
                        key={route.path}
                        to={route.path}
                        icon={<IconRenderer path={route.path} />}
                        label={route.title}
                    />
                ))}
            </SidebarSection>
        </>
    );
};
