import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useImpactMetricViews } from './useImpactMetricViews';
import type { MetricView } from '../views/types';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

const baseInput = (): ViewInput => ({
    title: 'My view',
    featureNames: ['flag-a'],
    metrics: [
        {
            id: 'metric-id',
            metricName: 'unleash_counter_my_metric',
            displayName: 'My metric',
            aggregationMode: 'count',
            labelSelectors: {},
            source: 'internal',
            title: undefined,
            yAxisMin: 'auto',
            timeRange: 'month',
        },
    ],
    timeRange: 'month',
    environment: 'production',
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

    it('adds a view, marks it active, and stamps id + timestamps', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        const input = baseInput();
        let created: MetricView | undefined;
        act(() => {
            created = result.current.addView(input);
        });

        expect(created).toEqual({
            ...input,
            id: expect.any(String),
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
        });
        expect(result.current.views).toEqual([created]);
        expect(result.current.activeViewId).toBe(created?.id);
    });

    it('updates an existing view in place, leaving others untouched', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let firstId = '';
        let secondId = '';
        act(() => {
            firstId = result.current.addView(baseInput()).id;
            secondId = result.current.addView({
                ...baseInput(),
                title: 'Second',
            }).id;
        });

        act(() => {
            result.current.updateView(firstId, {
                ...baseInput(),
                title: 'Renamed',
            });
        });

        const first = result.current.views.find((v) => v.id === firstId);
        const second = result.current.views.find((v) => v.id === secondId);
        expect(first?.title).toBe('Renamed');
        expect(second?.title).toBe('Second');
    });

    it('deletes a view and falls the active view back to the first remaining', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let firstId = '';
        let secondId = '';
        act(() => {
            firstId = result.current.addView(baseInput()).id;
            secondId = result.current.addView({
                ...baseInput(),
                title: 'Second',
            }).id;
        });
        expect(result.current.activeViewId).toBe(secondId);

        act(() => {
            result.current.deleteView(secondId);
        });

        expect(result.current.views).toHaveLength(1);
        expect(result.current.activeViewId).toBe(firstId);
    });

    it('duplicates a view with a new id and a "(copy)" title', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let sourceId = '';
        act(() => {
            sourceId = result.current.addView(baseInput()).id;
        });

        act(() => {
            result.current.duplicateView(sourceId);
        });

        const copy = result.current.views.find((v) => v.id !== sourceId);
        expect(result.current.views).toHaveLength(2);
        expect(copy?.title).toBe('My view (copy)');
        expect(result.current.activeViewId).toBe(copy?.id);
    });

    it('round-trips the optional showTopMovers flag, leaving it absent when unset', () => {
        const { result } = renderHook(() => useImpactMetricViews());

        let withFlag: MetricView | undefined;
        let withoutFlag: MetricView | undefined;
        act(() => {
            withFlag = result.current.addView({
                ...baseInput(),
                showTopMovers: true,
            });
            withoutFlag = result.current.addView(baseInput());
        });

        expect(withFlag?.showTopMovers).toBe(true);
        expect(withoutFlag).not.toHaveProperty('showTopMovers');
    });

    it('persists views across a remount', () => {
        const first = renderHook(() => useImpactMetricViews());
        act(() => {
            first.result.current.addView({
                ...baseInput(),
                title: 'Persisted',
            });
        });
        first.unmount();

        const second = renderHook(() => useImpactMetricViews());
        expect(second.result.current.views).toHaveLength(1);
        expect(second.result.current.views[0].title).toBe('Persisted');
        expect(second.result.current.activeView?.title).toBe('Persisted');
    });
});
