import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeedbackNPS } from 'component/feedback/FeedbackNPS/FeedbackNPS';
import { LayoutPicker } from 'component/layout/LayoutPicker/LayoutPicker';
import Loader from 'component/common/Loader/Loader';
import NotFound from 'component/common/NotFound/NotFound';
import { ProtectedRoute } from 'component/common/ProtectedRoute/ProtectedRoute';
import { SWRProvider } from 'component/providers/SWRProvider/SWRProvider';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { routes } from 'component/menu/routes';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { SplashPageRedirect } from 'component/splash/SplashPageRedirect/SplashPageRedirect';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

import { MaintenanceBanner } from './maintenance/MaintenanceBanner.tsx';
import { styled } from '@mui/material';
import { InitialRedirect, useLastViewedPage } from './InitialRedirect.tsx';
import { InternalBanners } from './banners/internalBanners/InternalBanners.tsx';
import { ExternalBanners } from './banners/externalBanners/ExternalBanners.tsx';
import { LicenseBanner } from './banners/internalBanners/LicenseBanner.tsx';
import { Demo } from './demo/Demo.tsx';
import { LoginRedirect } from './common/LoginRedirect/LoginRedirect.tsx';
import { SecurityBanner } from './banners/internalBanners/SecurityBanner.tsx';
import { MonthsOldVersionBanner } from './banners/internalBanners/MonthsOldVersionBanner.tsx';

const StyledContainer = styled('div')(() => ({
    '& ul': {
        margin: 0,
    },
}));

export const App = () => {
    const { authDetails } = useAuthDetails();
    const { refetch: refetchUiConfig } = useUiConfig();
    const { user } = useAuthUser();
    const hasFetchedAuth = Boolean(authDetails || user);

    const { isOss, uiConfig } = useUiConfig();

    const availableRoutes = isOss()
        ? routes.filter((route) => !route.enterprise)
        : routes;

    useEffect(() => {
        if (hasFetchedAuth && Boolean(user?.id)) {
            refetchUiConfig();
        }
    }, [authDetails, user]);

    const isLoggedIn = Boolean(user?.id);

    const location = useLocation();
    useLastViewedPage(location);

    return (
        <SWRProvider>
            <Suspense fallback={<Loader type='fullscreen' />}>
                <ConditionallyRender
                    condition={!hasFetchedAuth}
                    show={<Loader type='fullscreen' />}
                    elseShow={
                        <Demo>
                            <>
                                <ConditionallyRender
                                    condition={Boolean(
                                        uiConfig?.maintenanceMode,
                                    )}
                                    show={<MaintenanceBanner />}
                                />
                                <LicenseBanner />
                                <SecurityBanner />
                                <MonthsOldVersionBanner />
                                <ExternalBanners />
                                <InternalBanners />
                                <StyledContainer>
                                    <ToastRenderer />
                                    <Routes>
                                        {availableRoutes.map((route) => (
                                            <Route
                                                key={route.path}
                                                path={route.path}
                                                element={
                                                    <LayoutPicker
                                                        isStandalone={
                                                            route.isStandalone ===
                                                            true
                                                        }
                                                    >
                                                        <ProtectedRoute
                                                            route={route}
                                                        />
                                                    </LayoutPicker>
                                                }
                                            />
                                        ))}
                                        <Route
                                            path='/'
                                            element={<InitialRedirect />}
                                        />
                                        <Route
                                            path='*'
                                            element={
                                                isLoggedIn ? (
                                                    <NotFound />
                                                ) : (
                                                    <LoginRedirect />
                                                )
                                            }
                                        />
                                    </Routes>

                                    <FeedbackNPS openUrl='http://feedback.unleash.run' />

                                    <SplashPageRedirect />
                                </StyledContainer>
                            </>
                        </Demo>
                    }
                />
            </Suspense>
        </SWRProvider>
    );
};
