import { FC, Suspense, lazy } from 'react';
import Loader from 'component/common/Loader/Loader';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const LazyDemoComponent = lazy(() =>
    import('./Demo').then(module => ({
        default: module.Demo,
    }))
);

export const LazyDemo: FC = ({ children }) => {
    const { uiConfig } = useUiConfig();

    if (!uiConfig.flags.demo) return <>{children}</>;

    return (
        <Suspense fallback={<Loader />}>
            <LazyDemoComponent>
                <>{children}</>
            </LazyDemoComponent>
        </Suspense>
    );
};
