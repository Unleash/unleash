import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import type { InstanceInsightsSchemaLifecycleTrendsItem } from 'openapi';

export const calculateMedian = (
    groupedLifecycleData: GroupedDataByProject<
        InstanceInsightsSchemaLifecycleTrendsItem[]
    >,
): string | number => {
    const weekData: Record<string, number> = {};
    for (const data of Object.values(groupedLifecycleData)) {
        for (const { week, newProductionFlags } of data) {
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
