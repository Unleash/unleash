import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useFlags } from '@unleash/proxy-client-react';
import { useLatched } from './useLatched.ts';

const UXTWEAK_FLAG_PREFIX = 'uxtweak-';

const UxTweakRunner = lazy(() => import('./UxTweakRunner.tsx'));

export const UxTweakWidgets = () => {
    const uxTweakFlagPresent = useFlags().some((flag) =>
        flag.name.startsWith(UXTWEAK_FLAG_PREFIX),
    );
    // Latched so a flag refresh that drops the last flag can't unmount a
    // card the visitor is mid-answer in.
    const keepMounted = useLatched(uxTweakFlagPresent);

    if (!keepMounted) {
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
