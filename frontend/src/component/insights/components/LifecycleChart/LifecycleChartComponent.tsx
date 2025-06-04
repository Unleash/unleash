import { type ReactNode, useState, type FC } from 'react';
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
    BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import merge from 'deepmerge';
import {
    ChartTooltip,
    type TooltipState,
} from '../LineChart/ChartTooltip/ChartTooltip.tsx';

function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter((i) => i));
}

const LifecycleChartComponent: FC<{
    data: ChartData<'bar', unknown>;
    aspectRatio?: number;
    cover?: ReactNode;
    overrideOptions?: ChartOptions<'bar'>;
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

    // const options = useMemo(
    //     () =>
    //         mergeAll([
    //             createOptions(
    //                 theme,
    //                 locationSettings,
    //                 setTooltip,
    //                 Boolean(cover),
    //             ),
    //             overrideOptions ?? {},
    //         ]),
    //     [theme, locationSettings, overrideOptions, cover],
    // );

    return (
        <>
            <Bar
                key={cover ? 'cover' : 'chart'}
                // options={options}
                data={data}
                // plugins={[customHighlightPlugin]}
                height={100}
                width={100 * aspectRatio}
            />
            <ChartTooltip tooltip={tooltip} />
        </>
    );
};

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    TimeScale,
    Tooltip,
    Legend,
    Filler,
);

// for lazy-loading
export default LifecycleChartComponent;
