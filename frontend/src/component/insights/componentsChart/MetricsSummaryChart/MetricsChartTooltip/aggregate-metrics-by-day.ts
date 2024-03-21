import type { InstanceInsightsSchema } from 'openapi';

export function aggregateDataPerDate(
    items: InstanceInsightsSchema['metricsSummaryTrends'],
) {
    return items.reduce(
        (acc, item) => {
            if (!acc[item.date]) {
                acc[item.date] = {
                    totalFlags: 0,
                    totalNo: 0,
                    totalRequests: 0,
                    totalYes: 0,
                };
            }

            acc[item.date].totalFlags += item.totalFlags;
            acc[item.date].totalNo += item.totalNo;
            acc[item.date].totalRequests += item.totalRequests;
            acc[item.date].totalYes += item.totalYes;

            return acc;
        },
        {} as {
            [date: string]: {
                totalFlags: number;
                totalNo: number;
                totalRequests: number;
                totalYes: number;
            };
        },
    );
}
