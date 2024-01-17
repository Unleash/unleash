import { styled } from '@mui/material';
import GeneralSelect, {
    IGeneralSelectProps,
} from 'component/common/GeneralSelect/GeneralSelect';
import { subWeeks, subMonths, differenceInHours } from 'date-fns';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useExtendedFeatureMetrics } from '../useExtendedFeatureMetrics';

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: 0,
    marginBottom: theme.spacing(1),
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.thin,
    color: theme.palette.text.secondary,
}));

interface IFeatureMetricsHoursProps {
    hoursBack: number;
    setHoursBack: (value: number) => void;
}

export const FEATURE_METRIC_HOURS_BACK_DEFAULT = 48;

export const FeatureMetricsHours = ({
    hoursBack,
    setHoursBack,
}: IFeatureMetricsHoursProps) => {
    const { trackEvent } = usePlausibleTracker();
    const onChange: IGeneralSelectProps['onChange'] = (key) => {
        setHoursBack(parseInt(key));
        trackEvent('feature-metrics', {
            props: {
                eventType: 'change-period',
                hoursBack: key,
            },
        });
    };
    const extendedOptions = useExtendedFeatureMetrics();
    const options = extendedOptions
        ? [...hourOptions, ...daysOptions]
        : hourOptions;

    return (
        <div>
            <StyledTitle>Period</StyledTitle>
            <GeneralSelect
                name='feature-metrics-period'
                id='feature-metrics-period'
                options={options}
                value={String(hoursBack)}
                onChange={onChange}
                fullWidth
            />
        </div>
    );
};

const hourOptions: { key: `${number}`; label: string }[] = [
    {
        key: '1',
        label: 'Last hour',
    },
    {
        key: '24',
        label: 'Last 24 hours',
    },
    {
        key: '48',
        label: 'Last 48 hours',
    },
];

const now = new Date();

const daysOptions: { key: `${number}`; label: string }[] = [
    {
        key: `${differenceInHours(now, subWeeks(now, 1))}`,
        label: 'Last week',
    },
    {
        key: `${differenceInHours(now, subMonths(now, 1))}`,
        label: 'Last month',
    },
    {
        key: `${differenceInHours(now, subMonths(now, 3))}`,
        label: 'Last 3 months',
    },
];

export const FEATURE_METRIC_HOURS_BACK_MAX = differenceInHours(
    now,
    subMonths(now, 3),
);
