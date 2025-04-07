import { forwardRef, type ReactNode } from 'react';
import { Box, Grid, styled, useMediaQuery, useTheme } from '@mui/material';
import Header from 'component/menu/Header/Header';
import Footer from 'component/menu/Footer/Footer';
import Proclamation from 'component/common/Proclamation/Proclamation';
import BreadcrumbNav from 'component/common/BreadcrumbNav/BreadcrumbNav';
import textureImage from 'assets/img/texture.png';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SkipNavLink } from 'component/common/SkipNavLink/SkipNavLink';
import { SkipNavTarget } from 'component/common/SkipNavLink/SkipNavTarget';
import { formatAssetPath } from 'utils/formatPath';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { DraftBanner } from './DraftBanner/DraftBanner';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { NavigationSidebar } from './NavigationSidebar/NavigationSidebar';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';
import { NewInUnleash } from './NavigationSidebar/NewInUnleash/NewInUnleash';

import { WrapIfAdminSubpage } from './AdminMenu/AdminMenu';
import { useNewAdminMenu } from '../../../hooks/useNewAdminMenu';

interface IMainLayoutProps {
    children: ReactNode;
}

const MainLayoutContainer = styled(Grid)(() => ({
    height: '100%',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
}));

const MainLayoutContentWrapper = styled('div')(({ theme }) => ({
    margin: theme.spacing(0, 'auto'),
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.application,
    position: 'relative',
}));

const StyledImg = styled('img')(() => ({
    display: 'block',
    position: 'fixed',
    zIndex: 0,
    bottom: 0,
    right: 0,
    width: 400,
    pointerEvents: 'none',
    userSelect: 'none',
}));

const MainLayoutContentContainer = styled('main')(({ theme }) => ({
    height: '100%',
    padding: theme.spacing(0, 0, 6.5, 0),
    position: 'relative',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0, 1.5, 6.5, 1.5),
    },
    zIndex: 200,
}));

export const MainLayout = forwardRef<HTMLDivElement, IMainLayoutProps>(
    ({ children }, ref) => {
        const showOnlyAdminMenu = useNewAdminMenu();
        const { uiConfig } = useUiConfig();
        const projectId = useOptionalPathParam('projectId');
        const { isChangeRequestConfiguredInAnyEnv } = useChangeRequestsEnabled(
            projectId || '',
        );
        const theme = useTheme();
        const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

        const showRegularNavigationSideBar =
            !isSmallScreen && !showOnlyAdminMenu;

        return (
            <EventTimelineProvider>
                <SkipNavLink />
                <MainLayoutContainer>
                    <MainLayoutContentWrapper>
                        <ConditionallyRender
                            condition={Boolean(
                                projectId &&
                                    isChangeRequestConfiguredInAnyEnv(),
                            )}
                            show={<DraftBanner project={projectId || ''} />}
                        />

                        <Box
                            sx={(theme) => ({
                                display: 'flex',
                                mt: 0,
                            })}
                        >
                            <ConditionallyRender
                                condition={showRegularNavigationSideBar}
                                show={
                                    <NavigationSidebar
                                        NewInUnleash={NewInUnleash}
                                    />
                                }
                            />

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1,
                                    minWidth: 0,
                                }}
                            >
                                <Header />

                                <WrapIfAdminSubpage>
                                    <SkipNavTarget />
                                    <MainLayoutContentContainer ref={ref}>
                                        <BreadcrumbNav />
                                        <Proclamation toast={uiConfig.toast} />
                                        {children}
                                    </MainLayoutContentContainer>
                                </WrapIfAdminSubpage>
                            </Box>
                        </Box>

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
                    <Footer />
                </MainLayoutContainer>
            </EventTimelineProvider>
        );
    },
);
