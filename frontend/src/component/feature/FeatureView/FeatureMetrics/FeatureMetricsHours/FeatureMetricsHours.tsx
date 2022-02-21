import GeneralSelect, {
    OnGeneralSelectChange,
} from '../../../../common/GeneralSelect/GeneralSelect';

interface IFeatureMetricsHoursProps {
    hoursBack: number;
    setHoursBack: (value: number) => void;
}

export const FEATURE_METRIC_HOURS_BACK_MAX = 48;

export const FeatureMetricsHours = ({
    hoursBack,
    setHoursBack,
}: IFeatureMetricsHoursProps) => {
    const onChange: OnGeneralSelectChange = event => {
        setHoursBack(parseFeatureMetricsHour(event.target.value));
    };

    return (
        <GeneralSelect
            label="Period"
            name="feature-metrics-period"
            id="feature-metrics-period"
            options={hourOptions}
            value={String(hoursBack)}
            onChange={onChange}
            fullWidth
        />
    );
};

const parseFeatureMetricsHour = (value: unknown) => {
    switch (value) {
        case '1':
            return 1;
        case '24':
            return 24;
        default:
            return FEATURE_METRIC_HOURS_BACK_MAX;
    }
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
        key: `${FEATURE_METRIC_HOURS_BACK_MAX}`,
        label: `Last ${FEATURE_METRIC_HOURS_BACK_MAX} hours`,
    },
];
