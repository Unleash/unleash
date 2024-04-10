import { useMemo } from 'react';

export const useAllDatapoints = <T extends { date: string }>(data: T[]) =>
    useMemo(() => {
        const allDataPoints = new Set<string>();

        data.forEach((item) => {
            allDataPoints.add(item.date);
        });

        return Array.from(allDataPoints).sort();
    }, [data]);
