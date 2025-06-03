import { Box, styled } from '@mui/material';
import { type FC, useState, useEffect } from 'react';
import { useNavigationMode } from './useNavigationMode.ts';
import { ShowHide } from './ShowHide.tsx';
import { useRoutes } from './useRoutes.ts';
import { useExpanded } from './useExpanded.ts';
import {
    PrimaryNavigationList,
    RecentFlagsNavigation,
    RecentProjectsNavigation,
    AdminSettingsNavigation,
} from './NavigationList.tsx';
import { ConfigurationNavigationList } from './ConfigurationNavigationList.tsx';
import { ConfigurationNavigation } from './ConfigurationNavigation.tsx';
import { useInitialPathname } from './useInitialPathname.ts';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import type { NewInUnleash } from './NewInUnleash/NewInUnleash.tsx';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow, focusable } from 'themes/themeStyles';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import { ReactComponent as CelebatoryUnleashLogo } from 'assets/img/unleashHoliday.svg';
import { ReactComponent as CelebatoryUnleashLogoWhite } from 'assets/img/unleashHolidayDark.svg';
import { ReactComponent as LogoOnlyWhite } from 'assets/img/logo.svg';
import { ReactComponent as LogoOnly } from 'assets/img/logoDark.svg';
import { Link } from 'react-router-dom';
import { useFlag } from '@unleash/proxy-client-react';
import { useNewAdminMenu } from 'hooks/useNewAdminMenu';
import { useUiFlag } from 'hooks/useUiFlag.ts';

export const StretchContainer = styled(Box, {
    shouldForwardProp: (propName) =>
        propName !== 'mode' && propName !== 'admin',
})<{ mode: string; admin: boolean }>(({ theme, mode, admin }) => ({
    backgroundColor: admin
        ? theme.palette.background.application
        : theme.palette.background.paper,
    borderRight: admin ? `2px solid ${theme.palette.divider}` : 'none',
    padding: theme.spacing(2),
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    zIndex: 1,
    overflowAnchor: 'none',
    minWidth: mode === 'full' ? theme.spacing(32) : 'auto',
    width: mode === 'full' ? theme.spacing(32) : 'auto',
}));

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
const StickyContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'admin',
})<{ admin: boolean }>(({ theme, admin }) => ({
    position: 'sticky',
    paddingBottom: theme.spacing(1.5),
    paddingTop: theme.spacing(1),
    bottom: theme.spacing(0),
    backgroundColor: admin
        ? theme.palette.background.application
        : theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const NavigationSidebar: FC<{ NewInUnleash?: typeof NewInUnleash }> = ({
    NewInUnleash,
}) => {
    const { routes } = useRoutes();
    const celebrateUnleashFrontend = useFlag('celebrateUnleashFrontend');
    const { showOnlyAdminMenu } = useNewAdminMenu();

    const [mode, setMode] = useNavigationMode();
    const [expanded, changeExpanded] = useExpanded<'configure' | 'admin'>();
    const initialPathname = useInitialPathname();

    const [activeItem, setActiveItem] = useState(initialPathname);
    const sideMenuCleanup = useUiFlag('sideMenuCleanup');

    const { lastViewed: lastViewedProject } = useLastViewedProject();
    const showRecentProject =
        !sideMenuCleanup && mode === 'full' && lastViewedProject;

    const { lastViewed: lastViewedFlags } = useLastViewedFlags();
    const showRecentFlags =
        !sideMenuCleanup && mode === 'full' && lastViewedFlags.length > 0;

    useEffect(() => {
        setActiveItem(initialPathname);
    }, [initialPathname]);

    return (
        <StretchContainer mode={mode} admin={showOnlyAdminMenu}>
            <ConditionallyRender
                condition={mode === 'full'}
                show={
                    <StyledLink to='/' sx={flexRow} aria-label='Home'>
                        <ThemeMode
                            darkmode={
                                <ConditionallyRender
                                    condition={celebrateUnleashFrontend}
                                    show={<CelebatoryUnleashLogoWhite />}
                                    elseShow={
                                        <StyledUnleashLogoWhite aria-label='Unleash logo' />
                                    }
                                />
                            }
                            lightmode={
                                <ConditionallyRender
                                    condition={celebrateUnleashFrontend}
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

            <ConditionallyRender
                condition={!showOnlyAdminMenu}
                show={
                    <>
                        <PrimaryNavigationList
                            mode={mode}
                            setMode={setMode}
                            onClick={setActiveItem}
                            activeItem={activeItem}
                        />
                        {!sideMenuCleanup ? (
                            <ConfigurationNavigation
                                expanded={expanded.includes('configure')}
                                onExpandChange={(expand) => {
                                    changeExpanded('configure', expand);
                                }}
                                mode={mode}
                                title='Configure'
                            >
                                <ConfigurationNavigationList
                                    routes={routes.mainNavRoutes}
                                    mode={mode}
                                    onClick={setActiveItem}
                                    activeItem={activeItem}
                                />
                            </ConfigurationNavigation>
                        ) : null}

                        <AdminSettingsNavigation
                            onClick={setActiveItem}
                            mode={mode}
                            onSetFullMode={() => setMode('full')}
                            activeItem={activeItem}
                            onExpandChange={(expand) => {
                                changeExpanded('admin', expand);
                            }}
                            expanded={expanded.includes('admin')}
                            routes={routes.adminRoutes}
                        />

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

                        <StickyContainer admin={showOnlyAdminMenu}>
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
                    </>
                }
                elseShow={
                    <AdminSettingsNavigation
                        onClick={setActiveItem}
                        mode={mode}
                        onSetFullMode={() => setMode('full')}
                        activeItem={activeItem}
                        onExpandChange={(expand) => {
                            changeExpanded('admin', expand);
                        }}
                        expanded={expanded.includes('admin')}
                        routes={routes.adminRoutes}
                    />
                }
            />
        </StretchContainer>
    );
};
