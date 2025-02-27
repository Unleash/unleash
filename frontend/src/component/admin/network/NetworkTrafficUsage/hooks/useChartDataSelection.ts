import { useMemo, useState } from 'react';
import type { ChartDataSelection } from '../chart-data-selection';
import { periodsRecord, selectablePeriods } from '../selectable-periods';
import { createBarChartOptions } from '../bar-chart-options';
import useTheme from '@mui/material/styles/useTheme';
import { useLocationSettings } from 'hooks/useLocationSettings';

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
                        Number.parseInt(tooltipItems[0].label),
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
                    const timestamp = Date.parse(tooltipItems[0].label);
                    if (Number.isNaN(timestamp)) {
                        return 'Current month to date';
                    }
                    return new Date(timestamp).toLocaleDateString(
                        locationSettings?.locale ?? 'en-US',
                        {
                            month: 'long',
                            year: 'numeric',
                        },
                    );
                }
            },
            includedTraffic,
        );
    }, [theme, chartDataSelection]);

    return { chartDataSelection, setChartDataSelection, options };
};
