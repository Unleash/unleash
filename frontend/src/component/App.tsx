import { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
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

import MaintenanceBanner from './maintenance/MaintenanceBanner';
import { styled } from '@mui/material';
import { InitialRedirect } from './InitialRedirect';
import { InternalBanners } from './banners/internalBanners/InternalBanners';
import { ExternalBanners } from './banners/externalBanners/ExternalBanners';
import { LicenseBanner } from './banners/internalBanners/LicenseBanner';
import { Demo } from './demo/Demo';
import { LoginRedirect } from './common/LoginRedirect/LoginRedirect';
import { SecurityBanner } from './banners/internalBanners/SecurityBanner';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledContainer = styled('div')(() => ({
    '& ul': {
        margin: 0,
    },
}));

export const App = () => {
    const { authDetails } = useAuthDetails();
    const { refetch: refetchUiConfig } = useUiConfig();
    const uiGlobalFontSizeVariant = useUiFlag('uiGlobalFontSize');

    console.log("uiGlobalFontSizeVariant: ", uiGlobalFontSizeVariant);

    const { user } = useAuthUser();
    const hasFetchedAuth = Boolean(authDetails || user);

    const { isOss, uiConfig } = useUiConfig();

    const availableRoutes = isOss()
        ? routes.filter((route) => !route.enterprise)
        : routes;

    useEffect(() => {
        let style: HTMLStyleElement | null = null;
        if (!uiGlobalFontSizeVariant) return;

        try {
            // Create a new style element
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `
                html {
                    font-size: ${uiGlobalFontSizeVariant?.payload?.value}px;
                    height: 100%;
                    overflow: auto;
                    overflow-y: scroll;
                }
            `;
            // Append the style element to the document head
            document.head.appendChild(style);
        } catch (err) {
            console.error('Error setting global font size', err);
        }

        // Cleanup function to remove the style element when the component unmounts
        return () => {
            if (!style) return;
            document.head.removeChild(style);
        };
    }, [uiGlobalFontSizeVariant]);

    useEffect(() => {
        if (hasFetchedAuth && Boolean(user?.id)) {
            refetchUiConfig();
        }
    }, [authDetails, user]);

    const isLoggedIn = Boolean(user?.id);

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
