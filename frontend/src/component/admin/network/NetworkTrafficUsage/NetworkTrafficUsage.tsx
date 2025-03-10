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
import { customHighlightPlugin } from 'component/common/Chart/customHighlightPlugin';
import { useTrafficLimit } from './hooks/useTrafficLimit';
import { PeriodSelector } from './PeriodSelector';
import { useUiFlag } from 'hooks/useUiFlag';
import { OverageInfo, RequestSummary } from './RequestSummary';
import { currentMonth } from './dates';
import { getChartLabel } from './chart-functions';
import { useTrafficStats } from './hooks/useStats';
import { BoldText, StyledBox, TopRow } from './SharedComponents';
import { useChartDataSelection } from './hooks/useChartDataSelection';

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

    const includedTraffic = useTrafficLimit();

    const { chartDataSelection, setChartDataSelection, options } =
        useChartDataSelection(includedTraffic);

    const {
        chartData,
        usageTotal,
        overageCost,
        estimatedMonthlyCost,
        requestSummaryUsage,
    } = useTrafficStats(includedTraffic, chartDataSelection);

    const showOverageCalculations =
        chartDataSelection.grouping === 'daily' &&
        includedTraffic > 0 &&
        usageTotal - includedTraffic > 0 &&
        estimateTrafficDataCost;

    const showConsumptionBillingWarning =
        (chartDataSelection.grouping === 'monthly' ||
            chartDataSelection.month === currentMonth) &&
        includedTraffic > 0 &&
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
                                <RouterLink to='https://docs.getunleash.io/reference/unleash-edge'>
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
                                    includedTraffic={includedTraffic}
                                />
                                {showOverageCalculations && (
                                    <OverageInfo
                                        overageCost={overageCost}
                                        overages={usageTotal - includedTraffic}
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
                            plugins={[customHighlightPlugin()]}
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
