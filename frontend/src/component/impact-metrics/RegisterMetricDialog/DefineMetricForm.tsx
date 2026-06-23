import { type FormEvent, useId, useState } from 'react';
import {
    Radio,
    RadioGroup,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import { Card } from './RegisterMetricDialog.styles';
import { FormField } from 'component/common/FormField/FormField';
import { FormGroup } from 'component/common/FormGroup/FormGroup';
import { useRegisterImpactMetricApi } from 'hooks/api/actions/useImpactMetricsApi/useRegisterImpactMetricApi';
import type { RegisterImpactMetricSchemaType } from 'openapi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

type DefineMetricFormProps = {
    formId: string;
    onSubmitted: (metricName: string) => void;
};

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    // Gap owns the spacing; drop the FormFields' own bottom margin so it isn't
    // doubled up.
    '&& > *': {
        marginBottom: 0,
    },
}));

const RadioCardContainer = styled(Card)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    background: theme.palette.background.default,
    paddingInlineStart: theme.spacing(0.5),
    '.MuiRadio-root': {
        marginBlockStart: `calc(-1 * ${theme.spacing(1.5)})`,
    },
}));

const RadioCard = ({ value, description, examples }) => {
    const radioId = useId();
    const descriptionId = useId();
    const exampleId = useId();

    return (
        <RadioCardContainer>
            <Radio
                id={radioId}
                value={value}
                aria-describedby={`${descriptionId} ${exampleId}`}
            />
            <div>
                <label
                    data-card-action
                    htmlFor={radioId}
                    style={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                >
                    {value}
                </label>
                <Typography id={descriptionId}>{description}</Typography>
                <Typography
                    variant='body2'
                    id={exampleId}
                    sx={{
                        color: 'text.secondary',
                        mt: 1,
                    }}
                >
                    Examples: {examples}
                </Typography>
            </div>
        </RadioCardContainer>
    );
};

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

export const DefineMetricForm = ({
    formId,
    onSubmitted,
}: DefineMetricFormProps) => {
    const defaultMetricType = 'counter';
    const [metricName, setMetricName] = useState('');
    const [metricType, setMetricType] =
        useState<RegisterImpactMetricSchemaType>(defaultMetricType);
    const { registerImpactMetric, loading } = useRegisterImpactMetricApi();
    const { setToastApiError } = useToast();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading) {
            return;
        }
        try {
            await registerImpactMetric({
                name: metricName.trim(),
                type: metricType,
            });
            onSubmitted(metricName.trim());
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <StyledForm id={formId} onSubmit={handleSubmit}>
            <FormField
                label='Metric name'
                description='Use letters, numbers, colons, and underscores. Be descriptive and specific.'
            >
                <TextField
                    value={metricName}
                    onChange={(event) => setMetricName(event.target.value)}
                    placeholder='e.g., checkout_error_count'
                    variant='outlined'
                    size='large'
                    fullWidth
                    required
                    slotProps={{
                        htmlInput: {
                            pattern: '^[a-zA-Z_:][a-zA-Z0-9_:]*$',
                            title: 'The name must contain only alphanumeric characters, underscores, and colons. It must start with a letter.',
                        },
                    }}
                />
            </FormField>

            <FormField label='Metric type'>
                <FormGroup>
                    <StyledRadioGroup
                        aria-label='Metric type'
                        onChange={(e) =>
                            setMetricType(
                                e.target
                                    .value as RegisterImpactMetricSchemaType,
                            )
                        }
                        defaultValue={defaultMetricType}
                        name='metricType'
                    >
                        <RadioCard
                            value='counter'
                            description='Tracks values that only increase (e.g., error counts, request counts)'
                            examples={'client_error_count, total_purchases'}
                        />
                        <RadioCard
                            value='gauge'
                            description='Tracks values that can go up or down (e.g., active users, queue size'
                            examples={'active_connections, memory_usage'}
                        />
                        <RadioCard
                            value='histogram'
                            description='Tracks the distribution of values, (e.g., response times, payload sizes)'
                            examples={'request_duration_ms, payload_size_bytes'}
                        />
                    </StyledRadioGroup>
                </FormGroup>
            </FormField>
        </StyledForm>
    );
};
