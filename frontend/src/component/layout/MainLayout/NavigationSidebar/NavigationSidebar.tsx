import { Box, styled } from '@mui/material';
import { type FC, useState, useEffect } from 'react';
import { useNavigationMode } from './useNavigationMode';
import { ShowAdmin, ShowHide } from './ShowHide';
import { useRoutes } from './useRoutes';
import { useExpanded } from './useExpanded';
import {
    OtherLinksList,
    PrimaryNavigationList,
    RecentFlagsNavigation,
    RecentProjectsNavigation,
    SecondaryNavigation,
    SecondaryNavigationList,
} from './NavigationList';
import { useInitialPathname } from './useInitialPathname';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import { NewInUnleash } from './NewInUnleash/NewInUnleash';

export const MobileNavigationSidebar: FC<{ onClick: () => void }> = ({
    onClick,
}) => {
    const { routes } = useRoutes();

    return (
        <>
            <NewInUnleash onItemClick={onClick} />
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

export const StretchContainer = styled(Box)<{ mode: string }>(
    ({ theme, mode }) => ({
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        zIndex: 1,
        overflowAnchor: 'none',
        minWidth: mode === 'full' ? theme.spacing(40) : 'auto',
        width: mode === 'full' ? theme.spacing(40) : 'auto',
    }),
);

// This component is needed when the sticky item could overlap with nav items. You can replicate it on a short screen.
const StickyContainer = styled(Box)(({ theme }) => ({
    position: 'sticky',
    paddingBottom: theme.spacing(1.5),
    paddingTop: theme.spacing(1),
    bottom: theme.spacing(0),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const NavigationSidebar = () => {
    const { routes } = useRoutes();

    const [mode, setMode] = useNavigationMode();
    const [expanded, changeExpanded] = useExpanded<'configure' | 'admin'>();
    const initialPathname = useInitialPathname();

    const [activeItem, setActiveItem] = useState(initialPathname);

    const { lastViewed: lastViewedProject } = useLastViewedProject();
    const showRecentProject = mode === 'full' && lastViewedProject;

    const { lastViewed: lastViewedFlags } = useLastViewedFlags();
    const showRecentFlags = mode === 'full' && lastViewedFlags.length > 0;

    useEffect(() => {
        setActiveItem(initialPathname);
    }, [initialPathname]);

    return (
        <StretchContainer mode={mode}>
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

            {mode === 'mini' && (
                <ShowAdmin
                    onChange={() => {
                        changeExpanded('admin', true);
                        setMode('full');
                    }}
                />
            )}

            {showRecentProject && (
                <RecentProjectsNavigation
                    mode={mode}
                    projectId={lastViewedProject}
                    onClick={() => setActiveItem('/projects')}
                />
            )}

            {showRecentFlags && (
                <RecentFlagsNavigation
                    mode={mode}
                    flags={lastViewedFlags}
                    onClick={() => setActiveItem('/projects')}
                />
            )}

            {/* this will push the show/hide to the bottom on short nav list */}
            <Box sx={{ flex: 1 }} />

            <StickyContainer>
                <NewInUnleash
                    mode={mode}
                    onMiniModeClick={() => setMode('full')}
                />
                <ShowHide
                    mode={mode}
                    onChange={() => {
                        setMode(mode === 'full' ? 'mini' : 'full');
                    }}
                />
            </StickyContainer>
        </StretchContainer>
    );
};
