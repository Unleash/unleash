import type { FC } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getNavRoutes } from 'component/menu/routes';
import { normalizeRoutePath } from 'component/common/util';
import { useRoutes } from '../../MainLayout/NavigationSidebar/useRoutes.ts';
import { IconRenderer } from '../../MainLayout/NavigationSidebar/IconRenderer.tsx';
import { SidebarButton } from './SidebarButton.tsx';
import { SidebarLink } from './SidebarLink.tsx';
import { SidebarSection } from './SidebarSection.tsx';

// Unfiltered on purpose: the filtered list lacks plan-gated entries until
// ui-config loads, which would flash the app sidebar on a deep link.
const workspacePaths = getNavRoutes().map(
    (route) => normalizeRoutePath(route).path,
);

export const isConfigureWorkspacePage = (pathname: string) =>
    workspacePaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
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
