import { styled } from '@mui/material';
import GeneralSelect, {
    type IGeneralSelectProps,
} from 'component/common/GeneralSelect/GeneralSelect';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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
        setHoursBack(Number.parseInt(key));
        trackEvent('feature-metrics', {
            props: {
                eventType: 'change-period',
                hoursBack: key,
            },
        });
    };
    const { isEnterprise } = useUiConfig();
    const options = isEnterprise()
        ? [...hourOptions, ...daysOptions]
        : hourOptions;

    const normalizedHoursBack = options
        .map((option) => Number(option.key))
        .includes(hoursBack)
        ? hoursBack
        : FEATURE_METRIC_HOURS_BACK_DEFAULT;

    useEffect(() => {
        if (hoursBack !== normalizedHoursBack) {
            setHoursBack(normalizedHoursBack);
        }
    }, [hoursBack]);

    return (
        <div>
            <StyledTitle>Period</StyledTitle>
            <GeneralSelect
                name='feature-metrics-period'
                id='feature-metrics-period'
                options={options}
                value={String(normalizedHoursBack)}
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

const daysOptions: { key: `${number}`; label: string }[] = [
    {
        key: `${7 * 24}`,
        label: 'Last 7 days',
    },
    {
        key: `${30 * 24}`,
        label: 'Last 30 days',
    },
    {
        key: `${90 * 24}`,
        label: 'Last 90 days',
    },
];
