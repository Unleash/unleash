import type { FC } from 'react';
import styled from '@mui/material/styles/styled';
import { usePageTitle } from 'hooks/usePageTitle';
import { Link as RouterLink } from 'react-router-dom';
import { Alert } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { PeriodSelector } from './PeriodSelector.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
import { OverageInfo, RequestSummary } from './RequestSummary.tsx';
import { currentMonth } from './dates.ts';
import { getChartLabel } from './chart-functions.ts';
import { useTrafficStats } from './hooks/useStats.ts';
import { BoldText, StyledBox, TopRow } from './SharedComponents.tsx';
import { useChartDataSelection } from './hooks/useChartDataSelection.ts';
import { useTrafficBundles } from '../../../../hooks/api/getters/useTrafficBundles/useTrafficBundles.ts';
import { networkTrafficUsageHighlightPlugin } from './networkTrafficUsageHighlightPlugin.ts';

const TrafficInfoBoxes = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, max-content))',
    flex: 1,
    gap: theme.spacing(2, 4),
}));

const NetworkTrafficUsage: FC = () => {
    usePageTitle('Network - Data Usage');

    const estimateTrafficDataCost = useUiFlag('estimateTrafficDataCost');

    const { isOss } = useUiConfig();

    const { trafficBundles } = useTrafficBundles();

    const totalTraffic =
        trafficBundles.includedTraffic + trafficBundles.purchasedTraffic;

    const { chartDataSelection, setChartDataSelection, options } =
        useChartDataSelection(totalTraffic);

    const {
        chartData,
        usageTotal,
        overageCost,
        estimatedMonthlyCost,
        requestSummaryUsage,
    } = useTrafficStats(totalTraffic, chartDataSelection);

    const showOverageCalculations =
        chartDataSelection.grouping === 'daily' &&
        chartDataSelection.month === currentMonth &&
        totalTraffic > 0 &&
        usageTotal - totalTraffic > 0 &&
        estimateTrafficDataCost;

    const isCurrentMonth =
        chartDataSelection.grouping === 'daily' &&
        chartDataSelection.month === currentMonth;
    const showConsumptionBillingWarning =
        (chartDataSelection.grouping === 'monthly' ||
            chartDataSelection.month === currentMonth) &&
        totalTraffic > 0 &&
        overageCost > 0;

    return (
        <ConditionallyRender
            condition={isOss()}
            show={<Alert severity='warning'>Not enabled.</Alert>}
            elseShow={
                <>
                    <ConditionallyRender
                        condition={showConsumptionBillingWarning}
                        show={
                            <Alert severity='warning' sx={{ mb: 4 }}>
                                <BoldText>Heads up!</BoldText> You are currently
                                consuming more requests than your plan includes
                                and will be billed according to our terms.
                                Please see{' '}
                                <RouterLink to='https://www.getunleash.io/pricing'>
                                    this page
                                </RouterLink>{' '}
                                for more information. In order to reduce your
                                traffic consumption, you may configure an{' '}
                                <RouterLink to='https://docs.getunleash.io/unleash-edge'>
                                    Unleash Edge instance
                                </RouterLink>{' '}
                                in your own datacenter.
                            </Alert>
                        }
                    />
                    <StyledBox>
                        <TopRow>
                            <TrafficInfoBoxes>
                                <RequestSummary
                                    period={chartDataSelection}
                                    usageTotal={requestSummaryUsage}
                                    includedTraffic={
                                        trafficBundles.includedTraffic
                                    }
                                    purchasedTraffic={
                                        trafficBundles.purchasedTraffic
                                    }
                                    currentMonth={isCurrentMonth}
                                />
                                {showOverageCalculations && (
                                    <OverageInfo
                                        overageCost={overageCost}
                                        overages={usageTotal - totalTraffic}
                                        estimatedMonthlyCost={
                                            estimatedMonthlyCost
                                        }
                                    />
                                )}
                            </TrafficInfoBoxes>
                            <PeriodSelector
                                selectedPeriod={chartDataSelection}
                                setPeriod={setChartDataSelection}
                            />
                        </TopRow>
                        <Bar
                            data={chartData}
                            plugins={[networkTrafficUsageHighlightPlugin]}
                            options={options}
                            aria-label={getChartLabel(chartDataSelection)}
                        />
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
