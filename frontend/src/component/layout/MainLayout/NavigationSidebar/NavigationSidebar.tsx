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
import type { NewInUnleash } from './NewInUnleash/NewInUnleash';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow, focusable } from 'themes/themeStyles';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import { ReactComponent as CelebatoryUnleashLogo } from 'assets/img/unleashHoliday.svg';
import { ReactComponent as CelebatoryUnleashLogoWhite } from 'assets/img/unleashHolidayDark.svg';
import { ReactComponent as LogoOnlyWhite } from 'assets/img/logo.svg';
import { ReactComponent as LogoOnly } from 'assets/img/logoDark.svg';
import { useUiFlag } from 'hooks/useUiFlag';
import { Link } from 'react-router-dom';

export const MobileNavigationSidebar: FC<{
    onClick: () => void;
    NewInUnleash?: typeof NewInUnleash;
}> = ({ onClick, NewInUnleash }) => {
    const { routes } = useRoutes();

    return (
        <>
            {NewInUnleash ? <NewInUnleash /> : null}
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
        minWidth: mode === 'full' ? theme.spacing(32) : 'auto',
        width: mode === 'full' ? theme.spacing(32) : 'auto',
    }),
);

const StyledLink = styled(Link)(({ theme }) => focusable(theme));

const StyledUnleashLogoWhite = styled(UnleashLogoWhite)({ width: '150px' });

const StyledUnleashLogo = styled(UnleashLogo)({ width: '150px' });

const StyledCelebatoryLogo = styled(CelebatoryUnleashLogo)({ width: '150px' });

const StyledUnleashLogoOnly = styled(LogoOnly)(({ theme }) => ({
    width: '58px',
    marginTop: theme.spacing(0.5),
    margin: '0 auto',
}));

const StyledUnleashLogoOnlyWhite = styled(LogoOnlyWhite)(({ theme }) => ({
    width: '37px',
    marginTop: theme.spacing(1),
    margin: '0 auto',
}));

// This component is needed when the sticky item could overlap with nav items. You can replicate it on a short screen.
const StickyContainer = styled(Box)(({ theme }) => ({
    position: 'sticky',
    paddingBottom: theme.spacing(1.5),
    paddingTop: theme.spacing(1),
    bottom: theme.spacing(0),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const NavigationSidebar: FC<{ NewInUnleash?: typeof NewInUnleash }> = ({
    NewInUnleash,
}) => {
    const { routes } = useRoutes();
    const celebatoryUnleash = useUiFlag('celebrateUnleash');

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
            <ConditionallyRender
                condition={mode === 'full'}
                show={
                    <StyledLink to='/' sx={flexRow} aria-label='Home'>
                        <ThemeMode
                            darkmode={
                                <ConditionallyRender
                                    condition={celebatoryUnleash}
                                    show={<CelebatoryUnleashLogoWhite />}
                                    elseShow={
                                        <StyledUnleashLogoWhite aria-label='Unleash logo' />
                                    }
                                />
                            }
                            lightmode={
                                <ConditionallyRender
                                    condition={celebatoryUnleash}
                                    show={<StyledCelebatoryLogo />}
                                    elseShow={
                                        <StyledUnleashLogo aria-label='Unleash logo' />
                                    }
                                />
                            }
                        />
                    </StyledLink>
                }
                elseShow={
                    <StyledLink to='/' sx={flexRow} aria-label='Home'>
                        <ThemeMode
                            darkmode={<StyledUnleashLogoOnlyWhite />}
                            lightmode={<StyledUnleashLogoOnly />}
                        />
                    </StyledLink>
                }
            />

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
                {NewInUnleash ? (
                    <NewInUnleash
                        mode={mode}
                        onMiniModeClick={() => setMode('full')}
                    />
                ) : null}
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
