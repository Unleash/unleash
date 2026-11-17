import { lazy, Suspense } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { searchDocsTracking } from './searchDocsTracking.ts';

const LazySearchDocs = lazy(() => import('./SearchDocs.tsx'));

export const SearchDocsButton = () => {
    const searchDocsWidgetEnabled = useUiFlag('searchDocsWidget');

    if (!searchDocsWidgetEnabled) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <LazySearchDocs tracking={searchDocsTracking('header')} />
        </Suspense>
    );
};
