import { type ReactNode, useMemo, useState, type FC } from 'react';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale,
    Chart,
    Filler,
    type ChartData,
    type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import {
    ChartTooltip,
    ChartTooltipContainer,
    type TooltipState,
} from './ChartTooltip/ChartTooltip';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';
import { createOptions } from './createChartOptions';

const StyledContainer = styled('div')(({ theme }) => ({
    position: 'relative',
}));

const StyledCover = styled('div')(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    zIndex: theme.zIndex.appBar,
    '&::before': {
        zIndex: theme.zIndex.fab,
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.palette.background.paper,
        opacity: 0.8,
    },
}));

const StyledCoverContent = styled('div')(({ theme }) => ({
    zIndex: theme.zIndex.modal,
    margin: 'auto',
    color: theme.palette.text.secondary,
    textAlign: 'center',
}));

// Vertical line on the hovered chart, filled with gradient. Highlights a section of a chart when you hover over datapoints
const customHighlightPlugin = {
    id: 'customLine',
    afterDraw: (chart: Chart) => {
        const width = 26;
        if (chart.tooltip?.opacity && chart.tooltip.x) {
            const x = chart.tooltip.caretX;
            const yAxis = chart.scales.y;
            const ctx = chart.ctx;
            ctx.save();
            const gradient = ctx.createLinearGradient(
                x,
                yAxis.top,
                x,
                yAxis.bottom,
            );
            gradient.addColorStop(0, 'rgba(129, 122, 254, 0)');
            gradient.addColorStop(1, 'rgba(129, 122, 254, 0.12)');
            ctx.fillStyle = gradient;
            ctx.fillRect(
                x - width / 2,
                yAxis.top,
                width,
                yAxis.bottom - yAxis.top,
            );
            ctx.restore();
        }
    },
};

const LineChartComponent: FC<{
    data: ChartData<'line', unknown>;
    aspectRatio?: number;
    cover?: ReactNode;
    overrideOptions?: ChartOptions<'line'>;
    TooltipComponent?: ({
        tooltip,
    }: { tooltip: TooltipState | null }) => ReturnType<FC>;
}> = ({
    data,
    aspectRatio = 2.5,
    cover,
    overrideOptions,
    TooltipComponent,
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const [tooltip, setTooltip] = useState<null | TooltipState>(null);
    const options = useMemo(
        () => ({
            ...createOptions(
                theme,
                locationSettings,
                setTooltip,
                Boolean(cover),
            ),
            ...overrideOptions,
        }),
        [theme, locationSettings, overrideOptions, cover],
    );

    return (
        <StyledContainer>
            <Line
                key={cover ? 'cover' : 'chart'}
                options={options}
                data={data}
                plugins={[customHighlightPlugin]}
                height={100}
                width={100 * aspectRatio}
            />
            <ConditionallyRender
                condition={!cover}
                show={
                    TooltipComponent ? (
                        <ChartTooltipContainer tooltip={tooltip}>
                            <TooltipComponent tooltip={tooltip} />
                        </ChartTooltipContainer>
                    ) : (
                        <ChartTooltip tooltip={tooltip} />
                    )
                }
                elseShow={
                    <StyledCover>
                        <StyledCoverContent>
                            {cover !== true ? cover : ' '}
                        </StyledCoverContent>
                    </StyledCover>
                }
            />
        </StyledContainer>
    );
};

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Tooltip,
    Legend,
    Filler,
);

// for lazy-loading
export default LineChartComponent;
