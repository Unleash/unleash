import { useMemo, VFC, useState, useEffect } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, useTheme } from '@mui/material';
import { usePageTitle } from 'hooks/usePageTitle';
import Box from '@mui/system/Box';
import Select from 'component/common/select';
import {
    Chart as ChartJS,
    ChartOptions,
    CategoryScale,
    LinearScale,
    BarElement,
    ChartDataset,
    Title,
    Tooltip,
    Legend,
    ChartData,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { useInstanceTrafficMetrics } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { Theme } from '@emotion/react';
import { useLocationSettings } from 'hooks/useLocationSettings';

type ChartDatasetType = ChartDataset<'bar'>;

const padMonth = (month: number): string => {
    return month < 10 ? `0${month}` : `${month}`;
}

const toSelectablePeriod = (date: Date, label?: string): { key:string, dayCount: number, label: string } => {
    const period = `${date.getFullYear()}-${padMonth(date.getMonth() + 1)}`;
    const dayCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return {
        key: period,
        dayCount,
        label: label || date.toLocaleString('default', { month: 'long', year: 'numeric' }),
    };
};

const getSelectablePeriods = (): { key: string, dayCount: number, label: string }[] => {
    const current = new Date(Date.now());
    const selectablePeriods = [toSelectablePeriod(current, 'Current month')];
    for (let monthAdd = 1; monthAdd < 13; monthAdd++) {
        const date = new Date(current.getFullYear(), current.getMonth() - monthAdd, 1);
        selectablePeriods.push(toSelectablePeriod(date));
    }
    return selectablePeriods;
}

const toPeriodsRecord = (periods: { key: string, dayCount: number, label: string }[]): Record<string, { key: string, dayCount: number, label: string }> => {
    return periods.reduce((acc, period) => {
        acc[period.key] = period;
        return acc;
    }, {} as Record<string, { key: string, dayCount: number, label: string }>);
}

const getDayLabels = (dayCount: number): number[] => {
    return [...Array(dayCount).keys()].map((i) => i + 1);
}


const toChartData = (
    theme: Theme,
    days: number[],
    traffic?: any,
): ChartDatasetType[] => {
    if (!traffic || !traffic.usage || !traffic.usage.apiData) {
        return [];
    }

    const data = traffic.usage.apiData.map((item: any) => {
        const daysRec = days.reduce((acc, day: number) => {
            acc[`d${day}`] = 0;
            return acc;
        }, {} as Record<string, any>);
    
        for (const dayKey in item.days) {
            const day = item.days[dayKey];
            const dayNum = new Date(Date.parse(day.day)).getDate();
            daysRec[`d${dayNum}`] = day.trafficGroups[0].count;
        }
        return {
            label: item.apiPath,
            data: Object.values(daysRec),
            backgroundColor: theme.palette.primary.main,
        };
    });
    
    return data;
};

const createBarChartOptions = (theme: any, locationSettings: any): ChartOptions<'bar'> => ({
    plugins: {
        legend: {
          position: 'bottom',
        },
      },
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
});

export const NetworkTrafficUsage: VFC = () => {
    usePageTitle('Network - Data Usage');
    const { locationSettings } = useLocationSettings();
    const theme = useTheme();
    const options = useMemo(() => {
        return createBarChartOptions(theme, locationSettings);
    }, [theme, locationSettings]);

    const [selectablePeriods, setSelectablePeriods] = useState<{
        key: string;
        dayCount: number;
        label: string;
    }[]>(getSelectablePeriods());
    const [record, setRecord] = useState<Record<string, { key: string, dayCount: number, label: string }>>(toPeriodsRecord(selectablePeriods));
    const [period, setPeriod] = useState<string>(selectablePeriods[0].key);

    const traffic = useInstanceTrafficMetrics(period);

    const [labels, setLabels] = useState<number[]>([]);

    const [datasets, setDatasets] = useState<ChartDatasetType[]>([]);
    const [data, setData] = useState<ChartData<'bar', number[]>>({
        labels,
        datasets,
    });
    
    useEffect(() => {
        setDatasets(toChartData(theme, labels, traffic));
    }, [labels]);

    useEffect(() => {
        setData({
            labels,
            datasets,
        });
    }, [labels, datasets]);

    useEffect(() => {
        if (record && period) {
            const periodData = record[period];
            setLabels(getDayLabels(periodData.dayCount));
        }
    }, [period]);

    const onPeriodChange = (value: string) => {
        setPeriod(value);
    };

    return (
        <ConditionallyRender
            condition={data.datasets.length === 0 && !true}
            show={<Alert severity='warning'>No data available.</Alert>}
            elseShow={
                <>
                    <Select
                        id='dataperiod-select'
                        name='dataperiod'
                        label={'Select period:'}
                        options={selectablePeriods}
                        value={period}
                        onChange={(e) => onPeriodChange(e.target.value)}
                        style={{
                            minWidth: '100%',
                            marginBottom: theme.spacing(2),
                        }}
                        formControlStyles={{ width: '100%' }}
                        />
                    <Box sx={{ display: 'grid', gap: 4 }}>
                        <div style={{ height: 400 }}>
                            <Bar
                                data={data}
                                options={options}
                                aria-label='An instance metrics line chart with two lines: requests per second for admin API and requests per second for client API'
                            />
                        </div>
                    </Box>
                </>
            }
        />
    );
};

// Register dependencies that we need to draw the chart.
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

// Use a default export to lazy-load the charting library.
export default NetworkTrafficUsage;
