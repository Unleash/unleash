import type { WeekData } from 'component/insights/componentsChart/NewProductionFlagsChart/types.ts';

export const calculateMedian = (
    datasets: { data: WeekData[] }[],
): string | number => {
    const weekData: Record<string, number> = {};
    for (const set of datasets) {
        for (const { week, newProductionFlags } of set.data) {
            if (newProductionFlags === undefined) {
                continue;
            }
            weekData[week] = (weekData[week] ?? 0) + newProductionFlags;
        }
    }

    const values: number[] = Object.values(weekData).toSorted((a, b) => a - b);
    if (values.length === 0) {
        return 'N/A';
    }
    const middle = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
        return (values[middle - 1] + values[middle]) / 2;
    } else {
        return values[middle];
    }
};
