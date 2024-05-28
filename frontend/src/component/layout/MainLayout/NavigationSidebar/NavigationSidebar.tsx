import { Box, styled } from '@mui/material';
import type { FC } from 'react';
import { useNavigationMode } from './useNavigationMode';
import { ShowHide } from './ShowHide';
import { useRoutes } from './useRoutes';
import { useExpanded } from './useExpanded';
import {
    AdminNavigationList,
    ConfigureNavigationList,
    OtherLinksList,
    PrimaryNavigationList,
    SecondaryNavigation,
} from './NavigationList';

export const MobileNavigationSidebar: FC<{ onClick: () => void }> = ({
    onClick,
}) => {
    const { routes } = useRoutes();

    return (
        <>
            <PrimaryNavigationList mode='full' onClick={onClick} />
            <ConfigureNavigationList
                routes={routes.mainNavRoutes}
                mode='full'
                onClick={onClick}
            />
            <AdminNavigationList
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
    padding: theme.spacing(2, 1, 6, 1),
}));

export const NavigationSidebar = () => {
    const { routes } = useRoutes();

    const [mode, setMode] = useNavigationMode();
    const [expanded, changeExpanded] = useExpanded<'configure' | 'admin'>();

    return (
        <StyledBox>
            <PrimaryNavigationList mode={mode} />
            <SecondaryNavigation
                expanded={expanded.includes('configure')}
                onChange={(expand) => {
                    changeExpanded('configure', expand);
                }}
                mode={mode}
                routes={routes.mainNavRoutes}
            >
                Configure
            </SecondaryNavigation>
            <SecondaryNavigation
                expanded={expanded.includes('admin')}
                onChange={(expand) => {
                    changeExpanded('admin', expand);
                }}
                mode={mode}
                routes={routes.adminRoutes}
            >
                Admin
            </SecondaryNavigation>
            <ShowHide
                mode={mode}
                onChange={() => {
                    setMode(mode === 'full' ? 'mini' : 'full');
                }}
            />
        </StyledBox>
    );
};
