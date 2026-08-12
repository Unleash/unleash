import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useFlags } from '@unleash/proxy-client-react';

const UXTWEAK_FLAG_PREFIX = 'uxtweak-';

const UxTweakRunner = lazy(() => import('./UxTweakRunner.tsx'));

export const UxTweakWidgets = () => {
    const present = useFlags().some((flag) =>
        flag.name.startsWith(UXTWEAK_FLAG_PREFIX),
    );

    if (!present) {
        return null;
    }

    return (
        <ErrorBoundary fallbackRender={() => null}>
            <Suspense fallback={null}>
                <UxTweakRunner />
            </Suspense>
        </ErrorBoundary>
    );
};
