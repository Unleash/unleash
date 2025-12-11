import { useMemo, useState } from 'react';
import type { ChartDataSelection } from '../chart-data-selection.js';
import { periodsRecord, selectablePeriods } from '../selectable-periods.js';
import { createBarChartOptions } from '../bar-chart-options.js';
import useTheme from '@mui/material/styles/useTheme';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { parseMonthString } from '../dates.js';

export const useChartDataSelection = (includedTraffic?: number) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const [chartDataSelection, setChartDataSelection] =
        useState<ChartDataSelection>({
            grouping: 'daily',
            month: selectablePeriods[0].key,
        });

    const options = useMemo(() => {
        return createBarChartOptions(
            theme,
            (tooltipItems: any) => {
                if (chartDataSelection.grouping === 'daily') {
                    const periodItem = periodsRecord[chartDataSelection.month];
                    const tooltipDate = new Date(
                        periodItem.year,
                        periodItem.month,
                        Number.parseInt(tooltipItems[0].label, 10),
                    );
                    return tooltipDate.toLocaleDateString(
                        locationSettings?.locale ?? 'en-US',
                        {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        },
                    );
                } else {
                    const month = parseMonthString(tooltipItems[0].label);
                    if (Number.isNaN(month.getTime())) {
                        return 'Current month to date';
                    }
                    return month.toLocaleDateString(
                        locationSettings?.locale ?? 'en-US',
                        {
                            month: 'long',
                            year: 'numeric',
                        },
                    );
                }
            },
            includedTraffic,
            chartDataSelection.grouping === 'daily',
        );
    }, [theme, chartDataSelection, includedTraffic]);

    return { chartDataSelection, setChartDataSelection, options };
};
