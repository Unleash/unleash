import { useLocationSettings } from 'hooks/useLocationSettings';
import { getDateFnsLocale } from '../getDateFnsLocale.ts';
import type { ChartTypeRegistry, TooltipItem } from 'chart.js';
import { format, startOfWeek } from 'date-fns';

export const useBatchedTooltipDate = <T extends keyof ChartTypeRegistry>(
    fallback: string = 'Unknown date range',
) => {
    const { locationSettings } = useLocationSettings();
    const locale = getDateFnsLocale(locationSettings.locale);
    return (datapoints: TooltipItem<T>[]) => {
        const dataPoint = datapoints[0].raw as any;
        if (
            'date' in dataPoint &&
            typeof dataPoint.date === 'string' &&
            'endDate' in dataPoint &&
            typeof dataPoint.endDate === 'string'
        ) {
            const startDate = format(
                startOfWeek(new Date(dataPoint.date), {
                    locale,
                    weekStartsOn: 1,
                }),
                `PP`,
                { locale },
            );
            const endDate = format(new Date(dataPoint.endDate), `PP`, {
                locale,
            });
            return `${startDate} – ${endDate}`;
        }

        return fallback;
    };
};
