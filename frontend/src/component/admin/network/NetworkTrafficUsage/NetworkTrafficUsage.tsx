import { useMemo, type VFC, useState, useEffect } from 'react';
import useTheme from '@mui/material/styles/useTheme';
import styled from '@mui/material/styles/styled';
import { usePageTitle } from 'hooks/usePageTitle';
import Select from 'component/common/select';
import Box from '@mui/system/Box';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Link } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import {
    Chart as ChartJS,
    type ChartOptions,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    type Chart,
    type Tick,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { useInstanceTrafficMetrics } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import type { Theme } from '@mui/material/styles/createTheme';
import Grid from '@mui/material/Grid';
import { useUiFlag } from 'hooks/useUiFlag';
import { NetworkTrafficUsagePlanSummary } from './NetworkTrafficUsagePlanSummary';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
    type ChartDatasetType,
    useTrafficDataEstimation,
} from 'hooks/useTrafficData';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(5),
}));

const customHighlightPlugin = {
    id: 'customLine',
    beforeDraw: (chart: Chart) => {
        const width = 46;
        if (chart.tooltip?.opacity && chart.tooltip.x) {
            const x = chart.tooltip.caretX;
            const yAxis = chart.scales.y;
            const ctx = chart.ctx;
            ctx.save();
            const gradient = ctx.createLinearGradient(
                x,
                yAxis.top,
                x,
                yAxis.bottom + 34,
            );
            gradient.addColorStop(0, 'rgba(129, 122, 254, 0)');
            gradient.addColorStop(1, 'rgba(129, 122, 254, 0.12)');
            ctx.fillStyle = gradient;
            ctx.roundRect(
                x - width / 2,
                yAxis.top,
                width,
                yAxis.bottom - yAxis.top + 34,
                5,
            );
            ctx.fill();
            ctx.restore();
        }
    },
};

const createBarChartOptions = (
    theme: Theme,
    tooltipTitleCallback: (tooltipItems: any) => string,
    includedTraffic?: number,
): ChartOptions<'bar'> => ({
    plugins: {
        annotation: {
            clip: false,
            annotations: {
                line: {
                    type: 'line',
                    borderDash: [5, 5],
                    yMin: includedTraffic ? includedTraffic / 30 : 0,
                    yMax: includedTraffic ? includedTraffic / 30 : 0,
                    borderColor: 'gray',
                    borderWidth: 1,
                    display: !!includedTraffic,

                    label: {
                        backgroundColor: 'rgba(192, 192, 192,  0.8)',
                        color: 'black',
                        padding: {
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                        },
                        content: 'Average daily requests included in your plan',
                        display: !!includedTraffic,
                    },
                },
            },
        },
        legend: {
            position: 'bottom',
            labels: {
                color: theme.palette.text.primary,
                pointStyle: 'circle',
                usePointStyle: true,
                boxHeight: 6,
                padding: 15,
                boxPadding: 5,
            },
        },
        tooltip: {
            backgroundColor: theme.palette.background.paper,
            titleColor: theme.palette.text.primary,
            bodyColor: theme.palette.text.primary,
            bodySpacing: 6,
            padding: {
                top: 20,
                bottom: 20,
                left: 30,
                right: 30,
            },
            borderColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 3,
            usePointStyle: true,
            caretSize: 0,
            boxPadding: 10,
            callbacks: {
                title: tooltipTitleCallback,
            },
        },
    },
    responsive: true,
    scales: {
        x: {
            stacked: true,
            ticks: {
                color: theme.palette.text.secondary,
            },
            grid: {
                display: false,
            },
        },
        y: {
            stacked: true,
            ticks: {
                color: theme.palette.text.secondary,
                maxTicksLimit: 5,
                callback: (
                    tickValue: string | number,
                    index: number,
                    ticks: Tick[],
                ) => {
                    if (typeof tickValue === 'string') {
                        return tickValue;
                    }
                    const value = Number.parseInt(tickValue.toString());
                    if (value > 999999) {
                        return `${value / 1000000}M`;
                    }
                    return value > 999 ? `${value / 1000}k` : value;
                },
            },
            grid: {
                drawBorder: false,
            },
        },
    },
    elements: {
        bar: {
            borderRadius: 5,
        },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
});

const proPlanIncludedRequests = 53_000_000;

export const NetworkTrafficUsage: VFC = () => {
    usePageTitle('Network - Data Usage');
    const theme = useTheme();

    const { isOss, isPro } = useUiConfig();

    const {
        record,
        period,
        setPeriod,
        selectablePeriods,
        getDayLabels,
        toChartData,
        toTrafficUsageSum,
        endpointsInfo,
        calculateOverageCost,
        calculateEstimatedMonthlyCost,
    } = useTrafficDataEstimation();

    const includedTraffic = isPro() ? proPlanIncludedRequests : 0;

    const options = useMemo(() => {
        return createBarChartOptions(
            theme,
            (tooltipItems: any) => {
                const periodItem = record[period];
                const tooltipDate = new Date(
                    periodItem.year,
                    periodItem.month,
                    Number.parseInt(tooltipItems[0].label),
                );
                return tooltipDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                });
            },
            includedTraffic,
        );
    }, [theme, period]);

    const traffic = useInstanceTrafficMetrics(period);

    const [labels, setLabels] = useState<number[]>([]);

    const [datasets, setDatasets] = useState<ChartDatasetType[]>([]);

    const [usageTotal, setUsageTotal] = useState<number>(0);

    const [overageCost, setOverageCost] = useState<number>(0);

    const [estimatedMonthlyCost, setEstimatedMonthlyCost] = useState<number>(0);

    const data = {
        labels,
        datasets,
    };

    const flagEnabled = useUiFlag('displayTrafficDataUsage');

    useEffect(() => {
        setDatasets(toChartData(labels, traffic, endpointsInfo));
    }, [labels, traffic]);

    useEffect(() => {
        if (record && period) {
            const periodData = record[period];
            setLabels(getDayLabels(periodData.dayCount));
        }
    }, [period]);

    useEffect(() => {
        if (data) {
            const usage = toTrafficUsageSum(data.datasets);
            setUsageTotal(usage);
            if (includedTraffic > 0) {
                const calculatedOverageCost = calculateOverageCost(
                    usage,
                    includedTraffic,
                );
                setOverageCost(calculatedOverageCost);

                setEstimatedMonthlyCost(
                    calculateEstimatedMonthlyCost(
                        period,
                        data.datasets,
                        includedTraffic,
                        new Date(),
                    ),
                );
            }
        }
    }, [data]);

    return (
        <ConditionallyRender
            condition={isOss() || !flagEnabled}
            show={<Alert severity='warning'>Not enabled.</Alert>}
            elseShow={
                <>
                    <ConditionallyRender
                        condition={includedTraffic > 0 && overageCost > 0}
                        show={
                            <Alert severity='warning' sx={{ mb: 4 }}>
                                <b>Heads up!</b> You are currently consuming
                                more requests than your plan includes and will
                                be billed according to our terms. Please see{' '}
                                <Link
                                    component={RouterLink}
                                    to='https://www.getunleash.io/pricing'
                                >
                                    this page
                                </Link>{' '}
                                for more information. In order to reduce your
                                traffic consumption, you may configure an{' '}
                                <Link
                                    component={RouterLink}
                                    to='https://docs.getunleash.io/reference/unleash-edge'
                                >
                                    Unleash Edge instance
                                </Link>{' '}
                                in your own datacenter.
                            </Alert>
                        }
                    />
                    <StyledBox>
                        <Grid container component='header' spacing={2}>
                            <Grid item xs={12} md={10}>
                                <NetworkTrafficUsagePlanSummary
                                    usageTotal={usageTotal}
                                    includedTraffic={includedTraffic}
                                    overageCost={overageCost}
                                    estimatedMonthlyCost={estimatedMonthlyCost}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Select
                                    id='dataperiod-select'
                                    name='dataperiod'
                                    options={selectablePeriods}
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    style={{
                                        minWidth: '100%',
                                        marginBottom: theme.spacing(2),
                                    }}
                                    formControlStyles={{ width: '100%' }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Bar
                                data={data}
                                plugins={[customHighlightPlugin]}
                                options={options}
                                aria-label='An instance metrics line chart with two lines: requests per second for admin API and requests per second for client API'
                            />
                        </Grid>
                    </StyledBox>
                </>
            }
        />
    );
};

// Register dependencies that we need to draw the chart.
ChartJS.register(
    annotationPlugin,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

// Use a default export to lazy-load the charting library.
export default NetworkTrafficUsage;
