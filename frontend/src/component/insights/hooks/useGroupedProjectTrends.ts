import { useMemo } from 'react';

export type GroupedDataByProject<T> = Record<string, T>;

export function groupDataByProject<T extends { project: string }>(
    data: T[],
): GroupedDataByProject<T[]> {
    if (!data || data.length === 0 || !('project' in data[0])) {
        return {};
    }

    const groupedData: GroupedDataByProject<T[]> = {};

    data.forEach((item) => {
        const { project } = item;
        if (!groupedData[project]) {
            groupedData[project] = [];
        }
        groupedData[project].push(item);
    });

    return groupedData;
}

export const useGroupedProjectTrends = <
    T extends {
        project: string;
    },
>(
    input: T[],
) =>
    useMemo<GroupedDataByProject<T[]>>(
        () => groupDataByProject<T>(input),
        [JSON.stringify(input)],
    );
