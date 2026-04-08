import type { FC } from 'react';
import {
    Autocomplete,
    TextField,
    Typography,
    Box,
    Button,
} from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

type SeriesOption = {
    name: string;
    displayName: string;
    help: string;
    source?: 'internal' | 'external';
};

export type MetricSelection = {
    series: string;
    source?: 'internal' | 'external';
};

export type SeriesSelectorProps = {
    value: string;
    onChange: (selection: MetricSelection) => void;
    options: SeriesOption[];
    loading?: boolean;
    label?: string;
};

const NoOptionsMessage = () => {
    const { trackEvent } = usePlausibleTracker();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant='body2' fontWeight='bold'>
                No impact metrics found
            </Typography>
            <Typography variant='body2' color='text.secondary'>
                Impact metrics need to be implemented in your code before they
                can be used in safeguards.
            </Typography>
            <Button
                variant='contained'
                size='small'
                href='https://docs.getunleash.io/reference/impact-metrics'
                target='_blank'
                rel='noopener noreferrer'
                sx={{ alignSelf: 'flex-start', mt: 1 }}
                onClick={() =>
                    trackEvent('impact-metrics', {
                        props: {
                            eventType: 'No options docs clicked',
                        },
                    })
                }
            >
                Set up your first metric
            </Button>
        </Box>
    );
};

const withSelectedValue = (
    options: SeriesOption[],
    value: string,
): SeriesOption[] => {
    if (value && !options.some((option) => option.name === value)) {
        return [...options, { name: value, displayName: value, help: '' }];
    }
    return options;
};

export const MetricSelector: FC<SeriesSelectorProps> = ({
    value,
    onChange,
    options,
    loading = false,
    label = 'Metric name',
}) => {
    const allOptions = withSelectedValue(options, value);

    return (
        <Autocomplete
            options={allOptions}
            getOptionLabel={(option) => option.displayName}
            value={allOptions.find((option) => option.name === value) || null}
            onChange={(_, newValue) => {
                const selected = newValue || options[0];
                onChange({
                    series: selected?.name || '',
                    source: selected?.source,
                });
            }}
            disabled={loading}
            renderOption={(props, option, { inputValue }) => (
                <Box component='li' {...props} key={option.name}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='body2'>
                            <Highlighter search={inputValue}>
                                {option.displayName}
                            </Highlighter>
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            <Highlighter search={inputValue}>
                                {option.help}
                            </Highlighter>
                        </Typography>
                    </Box>
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder='Search for a metric…'
                    variant='outlined'
                    size='small'
                    required
                />
            )}
            noOptionsText={<NoOptionsMessage />}
            sx={{ minWidth: 300 }}
        />
    );
};
