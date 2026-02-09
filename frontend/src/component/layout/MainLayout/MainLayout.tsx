import { forwardRef, type ReactNode } from 'react';
import { Box, Grid, styled, useMediaQuery, useTheme } from '@mui/material';
import Header from 'component/menu/Header/Header';
import Footer from 'component/menu/Footer/Footer';
import BreadcrumbNav from 'component/common/BreadcrumbNav/BreadcrumbNav';
import textureImage from 'assets/img/texture.png';
import { SkipNavLink } from 'component/common/SkipNavLink/SkipNavLink';
import { SkipNavTarget } from 'component/common/SkipNavLink/SkipNavTarget';
import { formatAssetPath } from 'utils/formatPath';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { DraftBanner } from './DraftBanner/DraftBanner.tsx';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { NavigationSidebar } from './NavigationSidebar/NavigationSidebar.tsx';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';
import { LegacyNewInUnleash } from './NavigationSidebar/NewInUnleash/LegacyNewInUnleash.tsx';
import { NewInUnleash } from './NavigationSidebar/NewInUnleash/NewInUnleash.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

interface IMainLayoutProps {
    children: ReactNode;
}

const MainLayoutContainer = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
}));

const MainLayoutContent = styled(Grid)(({ theme }) => ({
    minWidth: 0, // this is a fix for overflowing flex
    maxWidth: `1512px`,
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(1856)]: {
        width: '100%',
    },
    [theme.breakpoints.down(1856)]: {
        marginLeft: theme.spacing(7),
        marginRight: theme.spacing(7),
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: `1250px`,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.down(1024)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: '100%',
    },
}));

const MainLayoutContentWrapper = styled('div')(({ theme }) => ({
    margin: theme.spacing(0, 'auto'),
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.application,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledImg = styled('img')(() => ({
    display: 'block',
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: 400,
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 0,
}));

const MainLayoutContentContainer = styled('main')(({ theme }) => ({
    padding: theme.spacing(0, 0, 6.5, 0),
    position: 'relative',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0, 1.5, 6.5, 1.5),
    },
    zIndex: 200,
}));

const LayoutFlexContainer = styled(Box)(() => ({
    display: 'flex',
    marginTop: 0,
}));

const MainContentWrapper = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
}));

const HeaderContentContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    flexShrink: 0,
}));

const ContentFlexContainer = styled(Box)(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
}));

const StyledMainLayoutContent = styled(MainLayoutContent)(() => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
}));

export const MainLayout = forwardRef<HTMLDivElement, IMainLayoutProps>(
    ({ children }, ref) => {
        const projectId = useOptionalPathParam('projectId');
        const { isChangeRequestConfiguredInAnyEnv } = useChangeRequestsEnabled(
            projectId || '',
        );
        const theme = useTheme();
        const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
        const useNewNewInUnleash = useUiFlag('gtmReleaseManagement');

        return (
            <EventTimelineProvider>
                <SkipNavLink />
                <MainLayoutContainer>
                    <MainLayoutContentWrapper>
                        <LayoutFlexContainer>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <NavigationSidebar
                                        NewInUnleash={
                                            useNewNewInUnleash
                                                ? undefined
                                                : LegacyNewInUnleash
                                        }
                                    />
                                }
                            />

                            <MainContentWrapper>
                                <ConditionallyRender
                                    condition={Boolean(
                                        projectId &&
                                            isChangeRequestConfiguredInAnyEnv(),
                                    )}
                                    show={
                                        <DraftBanner
                                            project={projectId || ''}
                                        />
                                    }
                                />
                                <HeaderContentContainer>
                                    <Header />

                                    <ContentFlexContainer>
                                        <StyledMainLayoutContent>
                                            <SkipNavTarget />
                                            <MainLayoutContentContainer
                                                ref={ref}
                                            >
                                                <BreadcrumbNav />
                                                {children}
                                            </MainLayoutContentContainer>
                                        </StyledMainLayoutContent>
                                    </ContentFlexContainer>
                                </HeaderContentContainer>

                                <Footer />
                            </MainContentWrapper>
                        </LayoutFlexContainer>

                        <ThemeMode
                            darkmode={
                                <StyledImg
                                    style={{ opacity: 0.06 }}
                                    src={formatAssetPath(textureImage)}
                                    alt=''
                                />
                            }
                            lightmode={
                                <StyledImg
                                    src={formatAssetPath(textureImage)}
                                    alt=''
                                />
                            }
                        />
                    </MainLayoutContentWrapper>
                </MainLayoutContainer>
                {useNewNewInUnleash && <NewInUnleash />}
            </EventTimelineProvider>
        );
    },
);
