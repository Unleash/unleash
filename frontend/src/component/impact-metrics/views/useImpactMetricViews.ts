import { useCallback, useMemo } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { createUuid } from 'utils/createUuid';
import {
    ACTIVE_VIEW_STORAGE_KEY,
    DEFAULT_VIEW_ENVIRONMENT,
    DEFAULT_VIEW_TEMPLATE,
    TEMPLATE_DEFAULTS,
    VIEW_LIST_STORAGE_KEY,
    type MetricView,
    type ViewTemplate,
} from './types';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

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
    renameView: (id: string, title: string) => void;
};

export const buildEmptyViewInput = (
    template: ViewTemplate = DEFAULT_VIEW_TEMPLATE,
): ViewInput => {
    const defaults = TEMPLATE_DEFAULTS[template];
    return {
        title: 'Untitled view',
        template,
        featureNames: [],
        metrics: [],
        timeRange: defaults.timeRange,
        environment: DEFAULT_VIEW_ENVIRONMENT,
        normalize: defaults.normalize,
        autoFollowFlags: defaults.autoFollowFlags,
    };
};

const migrateStoredView = (view: MetricView): MetricView => {
    if (view.template) return view;
    const defaults = TEMPLATE_DEFAULTS[DEFAULT_VIEW_TEMPLATE];
    return {
        ...view,
        template: DEFAULT_VIEW_TEMPLATE,
        normalize: view.normalize ?? defaults.normalize,
        autoFollowFlags: view.autoFollowFlags ?? defaults.autoFollowFlags,
    };
};

export const useImpactMetricViews = (): UseImpactMetricViews => {
    const [storedViews, setViews] = useLocalStorageState<MetricView[]>(
        VIEW_LIST_STORAGE_KEY,
        EMPTY_VIEWS,
    );
    const [storedActiveId, setStoredActiveId] = useLocalStorageState<string>(
        ACTIVE_VIEW_STORAGE_KEY,
        '',
    );

    const views = useMemo(
        () => storedViews.map(migrateStoredView),
        [storedViews],
    );

    const activeViewId = useMemo(() => {
        if (
            storedActiveId &&
            views.some((view) => view.id === storedActiveId)
        ) {
            return storedActiveId;
        }
        return views[0]?.id ?? null;
    }, [views, storedActiveId]);

    const activeView = useMemo(
        () => views.find((view) => view.id === activeViewId) ?? null,
        [views, activeViewId],
    );

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

    const renameView = useCallback(
        (id: string, title: string) => {
            setViews((current) =>
                current.map((view) =>
                    view.id === id
                        ? { ...view, title, updatedAt: Date.now() }
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
        renameView,
    };
};
