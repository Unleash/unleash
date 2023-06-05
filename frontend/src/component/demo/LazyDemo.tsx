import { FC, Suspense, lazy } from 'react';

const LazyDemoComponent = lazy(() =>
    import('./Demo').then(module => ({
        default: module.Demo,
    }))
);

export const LazyDemo: FC = ({ children }) => (
    <Suspense fallback={<>{children}</>}>
        <LazyDemoComponent>
            <>{children}</>
        </LazyDemoComponent>
    </Suspense>
);
