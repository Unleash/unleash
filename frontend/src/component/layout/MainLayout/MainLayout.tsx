import React, { forwardRef, ReactNode } from 'react';
import { Grid, styled } from '@mui/material';
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
import { Demo } from 'component/demo/Demo';

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

const MainLayoutContentWrapper = styled('main')(({ theme }) => ({
    margin: theme.spacing(0, 'auto'),
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.application,
    position: 'relative',
}));

const MainLayoutContent = styled(Grid)(({ theme }) => ({
    width: '1250px',
    margin: '0 auto',
    [theme.breakpoints.down('lg')]: {
        width: '1024px',
    },
    [theme.breakpoints.down(1024)]: {
        width: '100%',
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: '100%',
    },
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

const MainLayoutContentContainer = styled('div')(({ theme }) => ({
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
        const { uiConfig } = useUiConfig();
        const projectId = useOptionalPathParam('projectId');
        const { isChangeRequestConfiguredInAnyEnv } = useChangeRequestsEnabled(
            projectId || ''
        );

        return (
            <>
                <SkipNavLink />
                <Demo>
                    <>
                        <Header />
                        <SkipNavTarget />
                        <MainLayoutContainer>
                            <MainLayoutContentWrapper>
                                <ConditionallyRender
                                    condition={Boolean(
                                        projectId &&
                                            isChangeRequestConfiguredInAnyEnv()
                                    )}
                                    show={
                                        <DraftBanner
                                            project={projectId || ''}
                                        />
                                    }
                                />
                                <MainLayoutContent item xs={12} sm={12} my={2}>
                                    <MainLayoutContentContainer ref={ref}>
                                        <BreadcrumbNav />
                                        <Proclamation toast={uiConfig.toast} />
                                        {children}
                                    </MainLayoutContentContainer>
                                </MainLayoutContent>
                                <ThemeMode
                                    darkmode={
                                        <StyledImg
                                            style={{ opacity: 0.06 }}
                                            src={formatAssetPath(textureImage)}
                                            alt=""
                                        />
                                    }
                                    lightmode={
                                        <StyledImg
                                            src={formatAssetPath(textureImage)}
                                            alt=""
                                        />
                                    }
                                />
                            </MainLayoutContentWrapper>
                            <Footer />
                        </MainLayoutContainer>
                    </>
                </Demo>
            </>
        );
    }
);
