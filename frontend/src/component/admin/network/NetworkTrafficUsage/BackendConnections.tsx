import type { FC } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Box } from '@mui/material';
import { PeriodSelector } from './PeriodSelector';
import { Bar } from 'react-chartjs-2';
import { customHighlightPlugin } from 'component/common/Chart/customHighlightPlugin';
import { getChartLabel } from './chart-functions';
import { useConsumptionStats } from './hooks/useStats';
import { StyledBox, TopRow } from './SharedComponents';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useChartDataSelection } from './hooks/useChartDataSelection';

export const BackendConnections: FC = () => {
    usePageTitle('Network - Backend Connections');

    const { isOss } = useUiConfig();

    const { chartDataSelection, setChartDataSelection, options } =
        useChartDataSelection();

    const { chartData } = useConsumptionStats(chartDataSelection);

    return (
        <ConditionallyRender
            condition={isOss()}
            show={<Alert severity='warning'>Not enabled.</Alert>}
            elseShow={
                <>
                    <StyledBox>
                        <TopRow>
                            <Box>
                                1 connection = 7200 backend SDK requests per day
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
export default BackendConnections;
