import { styled } from '@mui/material';
import GeneralSelect, {
    IGeneralSelectProps,
} from 'component/common/GeneralSelect/GeneralSelect';

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

export const FEATURE_METRIC_HOURS_BACK_MAX = 48;

export const FeatureMetricsHours = ({
    hoursBack,
    setHoursBack,
}: IFeatureMetricsHoursProps) => {
    const onChange: IGeneralSelectProps['onChange'] = key => {
        setHoursBack(parseFeatureMetricsHour(key));
    };

    return (
        <div>
            <StyledTitle>Period</StyledTitle>
            <GeneralSelect
                name="feature-metrics-period"
                id="feature-metrics-period"
                options={hourOptions}
                value={String(hoursBack)}
                onChange={onChange}
                fullWidth
            />
        </div>
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
