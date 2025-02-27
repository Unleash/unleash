import type { FC } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import { Alert, Box } from '@mui/material';
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
import { PeriodSelector } from './PeriodSelector';
import { getChartLabel } from './chart-functions';
import { useTrafficStats } from './hooks/useStats';
import { StyledBox, TopRow } from './SharedComponents';
import { useChartDataSelection } from './hooks/useChartDataSelection';

const FrontendNetworkTrafficUsage: FC = () => {
    usePageTitle('Network - Frontend Traffic Usage');

    const { isOss } = useUiConfig();

    const { chartDataSelection, setChartDataSelection, options } =
        useChartDataSelection();

    const includedTraffic = 0;
    const { chartData } = useTrafficStats(
        includedTraffic,
        chartDataSelection,
        '/api/frontend',
    );

    return (
        <ConditionallyRender
            condition={isOss()}
            show={<Alert severity='warning'>Not enabled.</Alert>}
            elseShow={
                <>
                    <StyledBox>
                        <TopRow>
                            <Box>
                                Frontend traffic is determined by the total SDK
                                requests to the Frontend API
                            </Box>
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
export default FrontendNetworkTrafficUsage;
