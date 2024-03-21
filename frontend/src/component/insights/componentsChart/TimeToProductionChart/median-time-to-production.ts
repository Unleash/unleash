import type { InstanceInsightsSchema } from 'openapi';

type GroupedDataByDate<T> = Record<string, T[]>;

type DateResult<T> = Record<string, T>;

export function medianTimeToProduction(
    projectsData: InstanceInsightsSchema['projectFlagTrends'],
): DateResult<number> {
    const groupedData: GroupedDataByDate<number> = {};
    projectsData.forEach((item) => {
        const { date, timeToProduction } = item;
        if (!groupedData[date]) {
            groupedData[date] = [];
        }
        if (timeToProduction !== undefined) {
            groupedData[date].push(timeToProduction);
        }
    });

    // Calculate the median time to production for each date
    const medianByDate: DateResult<number> = {};
    Object.entries(groupedData).forEach(([date, times]) => {
        const sortedTimes = times.sort((a, b) => a - b);
        const midIndex = Math.floor(sortedTimes.length / 2);

        const median =
            sortedTimes.length % 2 === 0
                ? (sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2
                : sortedTimes[midIndex];

        medianByDate[date] = median;
    });
    return medianByDate;
}
