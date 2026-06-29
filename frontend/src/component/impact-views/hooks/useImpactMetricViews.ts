import { useCallback } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { createUuid } from 'utils/createUuid';
import type { MetricView } from '../views/types';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

const VIEW_LIST_KEY = 'impact-metric-views:list';
const ACTIVE_VIEW_KEY = 'impact-metric-views:active-id';

const EMPTY_VIEWS: MetricView[] = [];

export type UseImpactMetricViews = {
    views: MetricView[];
    activeView: MetricView | null;
    activeViewId: string | null;
    setActiveViewId: (id: string | null) => void;
    addView: (input: ViewInput) => MetricView;
    updateView: (id: string, input: ViewInput) => void;
    deleteView: (id: string) => void;
    duplicateView: (id: string) => MetricView | null;
};

export const useImpactMetricViews = (): UseImpactMetricViews => {
    const [views, setViews] = useLocalStorageState<MetricView[]>(
        VIEW_LIST_KEY,
        EMPTY_VIEWS,
    );
    const [storedActiveId, setStoredActiveId] = useLocalStorageState<string>(
        ACTIVE_VIEW_KEY,
        '',
    );

    const storedActiveIdExists = views.some(
        (view) => view.id === storedActiveId,
    );
    const activeViewId =
        storedActiveId && storedActiveIdExists
            ? storedActiveId
            : (views[0]?.id ?? null);

    const activeView = views.find((view) => view.id === activeViewId) ?? null;

    const setActiveViewId = useCallback(
        (id: string | null) => {
            setStoredActiveId(id ?? '');
        },
        [setStoredActiveId],
    );

    const addView = useCallback(
        (input: ViewInput) => {
            const now = Date.now();
            const newView: MetricView = {
                ...input,
                id: createUuid(),
                createdAt: now,
                updatedAt: now,
            };
            setViews((current) => [...current, newView]);
            setStoredActiveId(newView.id);
            return newView;
        },
        [setViews, setStoredActiveId],
    );

    const updateView = useCallback(
        (id: string, input: ViewInput) => {
            setViews((current) =>
                current.map((view) =>
                    view.id === id
                        ? { ...view, ...input, updatedAt: Date.now() }
                        : view,
                ),
            );
        },
        [setViews],
    );

    const deleteView = useCallback(
        (id: string) => {
            setViews((current) => current.filter((view) => view.id !== id));
            if (storedActiveId === id) {
                setStoredActiveId('');
            }
        },
        [setViews, storedActiveId, setStoredActiveId],
    );

    const duplicateView = useCallback(
        (id: string): MetricView | null => {
            const source = views.find((view) => view.id === id);
            if (!source) return null;
            const now = Date.now();
            const copy: MetricView = {
                ...source,
                id: createUuid(),
                title: `${source.title} (copy)`,
                createdAt: now,
                updatedAt: now,
            };
            setViews((current) => [...current, copy]);
            setStoredActiveId(copy.id);
            return copy;
        },
        [views, setViews, setStoredActiveId],
    );

    return {
        views,
        activeView,
        activeViewId,
        setActiveViewId,
        addView,
        updateView,
        deleteView,
        duplicateView,
    };
};
