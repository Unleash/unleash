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
} from './ChartTooltip/ChartTooltip.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';
import { createOptions } from './createChartOptions.ts';
import merge from 'deepmerge';
import { customHighlightPlugin } from 'component/common/Chart/customHighlightPlugin.ts';
import { GraphCover } from 'component/insights/GraphCover.tsx';

const StyledContainer = styled('div')(({ theme }) => ({
    position: 'relative',
}));

function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter((i) => i));
}

const LineChartComponent: FC<{
    data: ChartData<'line', unknown>;
    aspectRatio?: number;
    cover?: ReactNode;
    overrideOptions?: ChartOptions<'line'>;
    TooltipComponent?: ({
        tooltip,
    }: {
        tooltip: TooltipState | null;
    }) => ReturnType<FC>;
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
        () =>
            mergeAll([
                createOptions(
                    theme,
                    locationSettings,
                    setTooltip,
                    Boolean(cover),
                ),
                overrideOptions ?? {},
            ]),
        [theme, locationSettings, setTooltip, overrideOptions, cover],
    );

    return (
        <StyledContainer>
            <Line
                key={cover ? 'cover' : 'chart'}
                options={options}
                data={data}
                plugins={[customHighlightPlugin({ width: 26 })]}
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
                    <GraphCover>{cover !== true ? cover : ' '}</GraphCover>
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
