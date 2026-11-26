import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectChartData } from './useProjectChartData.ts';

type Project = { id: string; name: string; createdAt: string };

const { useProjects, theme } = vi.hoisted(() => ({
    useProjects: vi.fn<() => { projects: Project[] }>(),
    theme: { palette: { charts: { series: ['#35a', '#b62'] } } },
}));

vi.mock('hooks/api/getters/useProjects/useProjects', () => ({
    default: useProjects,
}));
vi.mock('@mui/material', () => ({ useTheme: () => theme }));

const trends = {
    'project-a': [
        {
            project: 'project-a',
            date: '2026-11-20',
            week: '2026-47',
            health: 100,
            total: 2,
            active: 1,
            stale: 0,
            potentiallyStale: 0,
        },
        {
            project: 'project-a',
            date: '2026-11-21',
            week: '2026-47',
            health: 100,
            total: 3,
            active: 2,
            stale: 0,
            potentiallyStale: 0,
        },
    ],
};

const metadata = (name: string): Project[] => [
    {
        id: 'project-a',
        name,
        createdAt: '2025-02-01',
    },
];

describe('useProjectChartData', () => {
    beforeEach(() => {
        useProjects.mockReset();
    });

    it('refreshes legend labels and colors when project metadata loads', () => {
        useProjects.mockReturnValue({ projects: [] });
        const { result, rerender } = renderHook(() =>
            useProjectChartData(trends),
        );
        expect(result.current.datasets[0].label).toBe('project-a');

        useProjects.mockReturnValue({ projects: metadata('Project A') });
        rerender();

        expect(result.current.datasets[0]).toMatchObject({
            label: 'Project A',
            borderColor: '#35a',
            backgroundColor: '#35a',
            data: trends['project-a'],
        });
    });

    it('updates a renamed project without waiting for new trend data', () => {
        useProjects.mockReturnValue({ projects: metadata('Original name') });
        const { result, rerender } = renderHook(() =>
            useProjectChartData(trends),
        );
        expect(result.current.datasets[0].label).toBe('Original name');
        const sameData = result.current;
        rerender();
        expect(result.current).toBe(sameData);

        useProjects.mockReturnValue({ projects: metadata('New name') });
        rerender();

        expect(result.current.datasets[0].label).toBe('New name');
    });
});
