import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useImpactMetricViews } from './useImpactMetricViews';
import { DEFAULT_VIEW_ENVIRONMENT, DEFAULT_VIEW_TIME_RANGE } from './types';
import type { MetricView } from './types';

const baseInput = () => ({
    title: 'My view',
    featureNames: ['flag-a'],
    metrics: [
        {
            id: 'metric-id',
            metricName: 'unleash_counter_my_metric',
            displayName: 'My metric',
            aggregationMode: 'count' as const,
            labelSelectors: {},
            yAxisMin: 'auto' as const,
            timeRange: DEFAULT_VIEW_TIME_RANGE,
        },
    ],
    timeRange: DEFAULT_VIEW_TIME_RANGE,
    environment: DEFAULT_VIEW_ENVIRONMENT,
});

describe('useImpactMetricViews', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('starts empty with no active view', () => {
        const { result } = renderHook(() => useImpactMetricViews());
        expect(result.current.views).toEqual([]);
        expect(result.current.activeViewId).toBeNull();
        expect(result.current.activeView).toBeNull();
    });

    it('adds a view, sets it active, and persists it', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let created: ReturnType<typeof result.current.addView> | undefined;
        act(() => {
            created = result.current.addView(baseInput());
        });

        expect(result.current.views).toHaveLength(1);
        expect(result.current.activeViewId).toBe(created!.id);
        expect(result.current.activeView?.title).toBe('My view');
    });

    it('updates an existing view in place', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let id = '';
        act(() => {
            id = result.current.addView(baseInput()).id;
        });
        act(() => {
            result.current.updateView(id, {
                ...baseInput(),
                title: 'Renamed',
            });
        });

        expect(result.current.views[0].title).toBe('Renamed');
    });

    it('deletes the active view and falls back to the first remaining', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let firstId = '';
        let secondId = '';
        act(() => {
            firstId = result.current.addView({
                ...baseInput(),
                title: 'first',
            }).id;
        });
        act(() => {
            secondId = result.current.addView({
                ...baseInput(),
                title: 'second',
            }).id;
        });
        expect(result.current.activeViewId).toBe(secondId);

        act(() => {
            result.current.deleteView(secondId);
        });
        expect(result.current.views).toHaveLength(1);
        expect(result.current.activeViewId).toBe(firstId);
    });

    it('duplicates a view with a (copy) suffix', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let id = '';
        act(() => {
            id = result.current.addView(baseInput()).id;
        });

        let copy: MetricView | null = null;
        act(() => {
            copy = result.current.duplicateView(id);
        });

        expect(result.current.views).toHaveLength(2);
        expect((copy as MetricView | null)?.title).toBe('My view (copy)');
        expect(result.current.activeViewId).toBe(
            (copy as MetricView | null)?.id,
        );
    });
});
