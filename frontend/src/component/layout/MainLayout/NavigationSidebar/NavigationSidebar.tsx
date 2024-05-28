import { Box, styled } from '@mui/material';
import { type FC, useState } from 'react';
import { useNavigationMode } from './useNavigationMode';
import { ShowHide } from './ShowHide';
import { useRoutes } from './useRoutes';
import { useExpanded } from './useExpanded';
import {
    OtherLinksList,
    PrimaryNavigationList,
    RecentProjectsNavigation,
    SecondaryNavigation,
    SecondaryNavigationList,
} from './NavigationList';
import { useInitialPathname } from './useInitialPathname';
import { useLastViewedProject } from 'hooks/useLastViewedProject';

export const MobileNavigationSidebar: FC<{ onClick: () => void }> = ({
    onClick,
}) => {
    const { routes } = useRoutes();

    return (
        <>
            <PrimaryNavigationList mode='full' onClick={onClick} />
            <SecondaryNavigationList
                routes={routes.mainNavRoutes}
                mode='full'
                onClick={onClick}
            />
            <SecondaryNavigationList
                routes={routes.adminRoutes}
                mode='full'
                onClick={onClick}
            />
            <OtherLinksList />
        </>
    );
};

export const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 2, 2, 2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    zIndex: theme.zIndex.tooltip,
}));

export const NavigationSidebar = () => {
    const { routes } = useRoutes();

    const [mode, setMode] = useNavigationMode();
    const [expanded, changeExpanded] = useExpanded<'configure' | 'admin'>();
    const initialPathname = useInitialPathname();

    const [activeItem, setActiveItem] = useState(initialPathname);

    const { lastViewed } = useLastViewedProject();
    const showRecentProject = mode === 'full' && lastViewed;

    return (
        <StyledBox>
            <PrimaryNavigationList
                mode={mode}
                onClick={setActiveItem}
                activeItem={activeItem}
            />
            <SecondaryNavigation
                expanded={expanded.includes('configure')}
                onExpandChange={(expand) => {
                    changeExpanded('configure', expand);
                }}
                mode={mode}
                title='Configure'
            >
                <SecondaryNavigationList
                    routes={routes.mainNavRoutes}
                    mode={mode}
                    onClick={setActiveItem}
                    activeItem={activeItem}
                />
            </SecondaryNavigation>
            {mode === 'full' && (
                <SecondaryNavigation
                    expanded={expanded.includes('admin')}
                    onExpandChange={(expand) => {
                        changeExpanded('admin', expand);
                    }}
                    mode={mode}
                    title='Admin'
                >
                    <SecondaryNavigationList
                        routes={routes.adminRoutes}
                        mode={mode}
                        onClick={setActiveItem}
                        activeItem={activeItem}
                    />
                </SecondaryNavigation>
            )}

            {showRecentProject && (
                <RecentProjectsNavigation
                    mode={mode}
                    projectId={lastViewed}
                    onClick={() => setActiveItem('/projects')}
                />
            )}

            <ShowHide
                mode={mode}
                onChange={() => {
                    setMode(mode === 'full' ? 'mini' : 'full');
                }}
            />
        </StyledBox>
    );
};
