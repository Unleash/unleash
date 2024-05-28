import { Box, styled } from '@mui/material';
import { useState, type FC } from 'react';
import { useNavigationMode } from './useNavigationMode';
import { ShowHide } from './ShowHide';
import { useRoutes } from './useRoutes';
import { useExpanded } from './useExpanded';
import {
    AdminNavigationList,
    SecondaryNavigationList,
    OtherLinksList,
    PrimaryNavigationList,
    SecondaryNavigation,
} from './NavigationList';
import { useLocation } from 'react-router-dom';

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
    const { pathname, state } = useLocation();
    console.log(pathname, state);
    const [activeItem, setActiveItem] = useState(pathname);

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
            <ShowHide
                mode={mode}
                onChange={() => {
                    setMode(mode === 'full' ? 'mini' : 'full');
                }}
            />
        </StyledBox>
    );
};
