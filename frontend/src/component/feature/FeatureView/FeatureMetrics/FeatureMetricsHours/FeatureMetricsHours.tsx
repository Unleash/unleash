import GeneralSelect, {
    type IGeneralSelectProps,
} from 'component/common/GeneralSelect/GeneralSelect';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';

interface IFeatureMetricsHoursProps {
    hoursBack: number;
    setHoursBack: (value: number) => void;
    label?: string;
}

export const FEATURE_METRIC_HOURS_BACK_DEFAULT = 48;

export const FeatureMetricsHours = ({
    hoursBack,
    setHoursBack,
    label = 'Period',
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
    const extendedUsageMetricsEnabled = useUiFlag('extendedUsageMetrics');
    const options = isEnterprise() && extendedUsageMetricsEnabled
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
            <GeneralSelect
                name='feature-metrics-period'
                label={label}
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
