import { renderHook } from '@testing-library/react';
import { useProjectsSearchAndSort } from './useProjectsSearchAndSort.js';
import type { ProjectSchema } from 'openapi';

const projects: ProjectSchema[] = [
    {
        name: 'A - Eagle',
        id: '1',
        createdAt: '2024-01-01',
        lastUpdatedAt: '2024-01-10',
        lastReportedFlagUsage: '2024-01-15',
        favorite: false,
    },
    {
        name: 'B - Horse',
        id: '2',
        createdAt: '2024-02-01',
        lastUpdatedAt: '2024-02-10',
        lastReportedFlagUsage: '2024-02-15',
    },
    {
        name: 'C - Koala',
        id: '3',
        createdAt: '2024-01-15',
        lastUpdatedAt: '2024-01-20',
        lastReportedFlagUsage: '2024-01-25',
        favorite: false,
    },
    {
        name: 'D - Shark',
        id: '4',
        createdAt: '2024-03-01',
        lastUpdatedAt: '2024-03-10',
        lastReportedFlagUsage: '2024-03-15',
        favorite: true,
    },
    {
        name: 'E - Tiger',
        id: '5',
        createdAt: '2024-01-20',
        lastUpdatedAt: '2024-01-30',
        lastReportedFlagUsage: '2024-02-05',
    },
    {
        name: 'F - Zebra',
        id: '6',
        createdAt: '2024-02-15',
        lastUpdatedAt: '2024-02-20',
        lastReportedFlagUsage: '2024-02-25',
        favorite: true,
    },
];

describe('useProjectsSearchAndSort', () => {
    it('should handle projects with no sorting key (default behavior)', () => {
        const { result } = renderHook(() => useProjectsSearchAndSort(projects));

        expect(
            result.current.map(
                (project) =>
                    `${project.name}${project.favorite ? ' - favorite' : ''}`,
            ),
        ).toEqual([
            'D - Shark - favorite',
            'F - Zebra - favorite',
            'A - Eagle',
            'B - Horse',
            'C - Koala',
            'E - Tiger',
        ]);
    });

    it('should return projects sorted by creation date in descending order', () => {
        const { result } = renderHook(() =>
            useProjectsSearchAndSort(projects, undefined, 'created'),
        );

        expect(
            result.current.map(
                (project) =>
                    `${project.name} - ${project.createdAt}${project.favorite ? ' - favorite' : ''}`,
            ),
        ).toEqual([
            'D - Shark - 2024-03-01 - favorite',
            'F - Zebra - 2024-02-15 - favorite',
            'B - Horse - 2024-02-01',
            'E - Tiger - 2024-01-20',
            'C - Koala - 2024-01-15',
            'A - Eagle - 2024-01-01',
        ]);
    });

    it('should return projects sorted by last updated date in descending order', () => {
        const { result } = renderHook(() =>
            useProjectsSearchAndSort(projects, undefined, 'updated'),
        );

        expect(
            result.current.map(
                (project) =>
                    `${project.name} - ${project.lastUpdatedAt}${project.favorite ? ' - favorite' : ''}`,
            ),
        ).toEqual([
            'D - Shark - 2024-03-10 - favorite',
            'F - Zebra - 2024-02-20 - favorite',
            'B - Horse - 2024-02-10',
            'E - Tiger - 2024-01-30',
            'C - Koala - 2024-01-20',
            'A - Eagle - 2024-01-10',
        ]);
    });

    it('should return projects sorted by last reported flag usage in descending order', () => {
        const { result } = renderHook(() =>
            useProjectsSearchAndSort(projects, undefined, 'seen'),
        );

        expect(
            result.current.map(
                (project) =>
                    `${project.name} - ${project.lastReportedFlagUsage}${project.favorite ? ' - favorite' : ''}`,
            ),
        ).toEqual([
            'D - Shark - 2024-03-15 - favorite',
            'F - Zebra - 2024-02-25 - favorite',
            'B - Horse - 2024-02-15',
            'E - Tiger - 2024-02-05',
            'C - Koala - 2024-01-25',
            'A - Eagle - 2024-01-15',
        ]);
    });

    it('should filter projects by query and return sorted by name', () => {
        const { result } = renderHook(() =>
            useProjectsSearchAndSort(projects, 'e', 'name'),
        );

        expect(
            result.current.map(
                (project) =>
                    `${project.name}${project.favorite ? ' - favorite' : ''}`,
            ),
        ).toEqual([
            'F - Zebra - favorite',
            'A - Eagle',
            'B - Horse',
            'E - Tiger',
        ]);
    });

    it('should handle query that does not match any projects', () => {
        const { result } = renderHook(() =>
            useProjectsSearchAndSort(projects, 'Nonexistent'),
        );

        expect(result.current).toEqual([]);
    });

    it('should handle query that matches some projects', () => {
        const { result } = renderHook(() =>
            useProjectsSearchAndSort(projects, 'R'),
        );

        expect(
            result.current.map(
                (project) =>
                    `${project.name}${project.favorite ? ' - favorite' : ''}`,
            ),
        ).toEqual([
            'D - Shark - favorite',
            'F - Zebra - favorite',
            'B - Horse',
            'E - Tiger',
        ]);
    });

    it('should be able to deal with updates', () => {
        const hook = renderHook(
            (sortBy: string) =>
                useProjectsSearchAndSort(
                    [
                        {
                            name: 'Project A',
                            id: '1',
                            createdAt: '2024-01-01',
                            lastUpdatedAt: '2024-03-10',
                            lastReportedFlagUsage: '2024-01-15',
                        },
                        {
                            name: 'Project B',
                            id: '2',
                            createdAt: '2024-02-01',
                            lastUpdatedAt: '2024-02-10',
                            lastReportedFlagUsage: '2024-02-15',
                        },
                    ],
                    undefined,
                    sortBy as any,
                ),
            {
                initialProps: 'created',
            },
        );

        expect(hook.result.current.map((project) => project.name)).toEqual([
            'Project B',
            'Project A',
        ]);

        hook.rerender('updated');
        expect(hook.result.current.map((project) => project.name)).toEqual([
            'Project A',
            'Project B',
        ]);

        hook.rerender('seen');
        expect(hook.result.current.map((project) => project.name)).toEqual([
            'Project B',
            'Project A',
        ]);
    });

    it('should use createdAt if lastUpdatedAt is not available', () => {
        const { result } = renderHook(
            (sortBy: string) =>
                useProjectsSearchAndSort(
                    [
                        {
                            name: 'Project A',
                            id: '1',
                            createdAt: '2024-01-01',
                            lastUpdatedAt: '2024-01-02',
                        },
                        {
                            name: 'Project B',
                            id: '2',
                            createdAt: '2024-02-01',
                        },
                    ],
                    undefined,
                    sortBy as any,
                ),
            {
                initialProps: 'updated',
            },
        );

        expect(result.current.map((project) => project.name)).toEqual([
            'Project B',
            'Project A',
        ]);
    });
});
