import { renderHook } from '@testing-library/react';
import { useFilteredTrends } from './useFilteredTrends.js';

const mockProjectFlagTrends = [
    {
        week: '2024-01',
        project: 'project1',
    },
    {
        week: '2024-01',
        project: 'project2',
    },
    {
        week: '2024-02',
        project: 'project1',
    },
    {
        week: '2024-02',
        project: 'project3',
    },
];

describe('useFilteredFlagTrends', () => {
    it('should return all project flag trends when all projects option is selected', () => {
        const projects = ['*'];
        const { result } = renderHook(() =>
            useFilteredTrends(mockProjectFlagTrends, projects),
        );
        expect(result.current).toEqual(mockProjectFlagTrends);
    });

    it('should return all project flag trends project selection is empty', () => {
        const projects: string[] = [];
        const { result } = renderHook(() =>
            useFilteredTrends(mockProjectFlagTrends, projects),
        );
        expect(result.current).toEqual(mockProjectFlagTrends);
    });

    it('should return filtered project when specific project is selected', () => {
        const projects = ['project1'];
        const { result } = renderHook(() =>
            useFilteredTrends(mockProjectFlagTrends, projects),
        );
        expect(result.current).toEqual([
            {
                week: '2024-01',
                project: 'project1',
            },
            {
                week: '2024-02',
                project: 'project1',
            },
        ]);
    });

    it('should return filtered project flag trends when specific projects are selected', () => {
        const projects = ['project1', 'project2'];
        const { result } = renderHook(() =>
            useFilteredTrends(mockProjectFlagTrends, projects),
        );
        expect(result.current).toEqual([
            {
                week: '2024-01',
                project: 'project1',
            },
            {
                week: '2024-01',
                project: 'project2',
            },
            {
                week: '2024-02',
                project: 'project1',
            },
        ]);
    });

    it('should re-render if input has changed', () => {
        const projects = ['project1'];
        const { result, rerender } = renderHook(
            ({ input, projects }) => useFilteredTrends(input, projects),
            {
                initialProps: {
                    input: mockProjectFlagTrends,
                    projects,
                },
            },
        );

        rerender({
            input: [
                {
                    week: '2024-01',
                    project: 'project1',
                },
            ],
            projects,
        });

        expect(result.current).toEqual([
            {
                week: '2024-01',
                project: 'project1',
            },
        ]);
    });
});
