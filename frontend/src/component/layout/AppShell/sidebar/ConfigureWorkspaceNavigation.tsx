import type { FC } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRoutes } from '../../MainLayout/NavigationSidebar/useRoutes.ts';
import { IconRenderer } from '../../MainLayout/NavigationSidebar/IconRenderer.tsx';
import { SidebarButton } from './SidebarButton.tsx';
import { SidebarLink } from './SidebarLink.tsx';
import { SidebarSection } from './SidebarSection.tsx';

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
