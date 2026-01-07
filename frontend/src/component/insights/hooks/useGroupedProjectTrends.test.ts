import { useGroupedProjectTrends } from './useGroupedProjectTrends.js';
import { renderHook } from '@testing-library/react';

describe('useGroupedProjectTrends', () => {
    test('returns an empty object when input data is empty', () => {
        const input: any[] = [];
        const { result } = renderHook(() => useGroupedProjectTrends(input));
        expect(result.current).toEqual({});
    });

    test('groups data by project correctly', () => {
        const input = [
            { project: 'project1', data: 'data1' },
            { project: 'project2', data: 'data2' },
            { project: 'project1', data: 'data3' },
        ];
        const { result } = renderHook(() => useGroupedProjectTrends(input));
        expect(result.current).toEqual({
            project1: [
                { project: 'project1', data: 'data1' },
                { project: 'project1', data: 'data3' },
            ],
            project2: [{ project: 'project2', data: 'data2' }],
        });
    });

    test('groups complex data by project correctly', () => {
        const input = [
            {
                project: 'project1',
                data: { some: { complex: { type: 'data1' } } },
            },
            {
                project: 'project2',
                data: { some: { complex: { type: 'data2' } } },
            },
            {
                project: 'project1',
                data: { some: { complex: { type: 'data3' } } },
            },
        ];
        const { result } = renderHook(() => useGroupedProjectTrends(input));
        expect(result.current).toEqual({
            project1: [
                {
                    project: 'project1',
                    data: { some: { complex: { type: 'data1' } } },
                },
                {
                    project: 'project1',
                    data: { some: { complex: { type: 'data3' } } },
                },
            ],
            project2: [
                {
                    project: 'project2',
                    data: { some: { complex: { type: 'data2' } } },
                },
            ],
        });
    });
});
