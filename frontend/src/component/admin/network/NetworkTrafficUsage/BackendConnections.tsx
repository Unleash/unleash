import type { FC } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    Alert,
    Box,
    styled,
    Tooltip as TooltipComponent,
    Typography,
} from '@mui/material';
import { PeriodSelector } from './PeriodSelector.tsx';
import { Bar } from 'react-chartjs-2';
import { getChartLabel } from './chart-functions.ts';
import { useConsumptionStats } from './hooks/useStats.ts';
import { StyledBox, TopRow } from './SharedComponents.tsx';
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
import { useChartDataSelection } from './hooks/useChartDataSelection.ts';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { networkTrafficUsageHighlightPlugin } from './networkTrafficUsageHighlightPlugin.ts';

const ConnectionExplanationBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

// TODO: consider renaming to Connection Consumption
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
                                <Alert severity='info' icon={false}>
                                    <ConnectionExplanationBox>
                                        <Typography>
                                            1 connection = 7200 backend SDK
                                            requests per day
                                        </Typography>
                                        <TooltipComponent title='1 connection involves polling every 15 seconds and sending metrics every 60 seconds. This translates to 5 requests per minute, 300 requests per hour, and 7200 requests per day.'>
                                            <HelpOutline />
                                        </TooltipComponent>
                                    </ConnectionExplanationBox>
                                </Alert>
                            </Box>
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
export default BackendConnections;
