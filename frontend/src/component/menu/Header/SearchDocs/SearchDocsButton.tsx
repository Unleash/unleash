import { lazy, Suspense } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';

const LazySearchDocs = lazy(() => import('./SearchDocs.tsx'));

export const SearchDocsButton = () => {
    const searchDocsWidgetEnabled = useUiFlag('searchDocsWidget');

    if (!searchDocsWidgetEnabled) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <LazySearchDocs />
        </Suspense>
    );
};
