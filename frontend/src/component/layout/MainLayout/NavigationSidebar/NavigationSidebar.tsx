import { Box, styled } from '@mui/material';
import { type FC, useState, useEffect } from 'react';
import { useNavigationMode } from './useNavigationMode.ts';
import { ShowHide } from './ShowHide.tsx';
import { useRoutes } from './useRoutes.ts';
import { useExpanded } from './useExpanded.ts';
import {
    PrimaryNavigationList,
    AdminSettingsNavigation,
} from './NavigationList.tsx';
import { useInitialPathname } from './useInitialPathname.ts';
import type { LegacyNewInUnleash } from './NewInUnleash/LegacyNewInUnleash.tsx';
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

export const StretchContainer = styled(Box, {
    shouldForwardProp: (propName) =>
        propName !== 'mode' && propName !== 'admin',
})<{ mode: string; admin: boolean }>(({ theme, mode, admin }) => ({
    backgroundColor: admin
        ? theme.palette.background.application
        : theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1,
    overflowAnchor: 'none',
    position: 'sticky',
    top: 0,
    height: '100vh',
    minWidth: mode === 'full' ? theme.spacing(34) : 'auto',
    width: mode === 'full' ? theme.spacing(34) : 'auto',
}));

const TopContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'admin',
})<{ admin: boolean }>(({ theme, admin }) => ({
    position: 'sticky',
    top: 0,
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    // borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: admin
        ? theme.palette.background.application
        : theme.palette.background.paper,
    zIndex: 2,
}));

const MidContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const BottomContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'admin',
})<{ admin: boolean }>(({ theme, admin }) => ({
    position: 'sticky',
    bottom: 0,
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    backgroundColor: admin
        ? theme.palette.background.application
        : theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    zIndex: 2,
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


export const NavigationSidebar: FC<{
    NewInUnleash?: typeof LegacyNewInUnleash;
}> = ({ NewInUnleash }) => {
    const { routes } = useRoutes();
    const celebrateUnleashFrontend = useFlag('celebrateUnleashFrontend');
    const { showOnlyAdminMenu } = useNewAdminMenu();

    const [mode, setMode] = useNavigationMode();
    const [expanded, changeExpanded] = useExpanded<'configure' | 'admin'>();
    const initialPathname = useInitialPathname();

    const [activeItem, setActiveItem] = useState(initialPathname);

    useEffect(() => {
        setActiveItem(initialPathname);
    }, [initialPathname]);

    return (
        <StretchContainer mode={mode} admin={showOnlyAdminMenu}>
            <TopContainer admin={showOnlyAdminMenu}>
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
            </TopContainer>

            <MidContainer>
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
            </MidContainer>

            <BottomContainer admin={showOnlyAdminMenu}>
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
            </BottomContainer>
        </StretchContainer>
    );
};
