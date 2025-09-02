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
