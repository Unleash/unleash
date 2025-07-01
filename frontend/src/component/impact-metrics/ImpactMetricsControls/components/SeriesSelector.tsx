import type { FC } from 'react';
import { Autocomplete, TextField, Typography, Box } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { Highlighter } from 'component/common/Highlighter/Highlighter';

type SeriesOption = ImpactMetricsSeries & { name: string };

export type SeriesSelectorProps = {
    value: string;
    onChange: (series: string) => void;
    options: SeriesOption[];
    loading?: boolean;
};

export const SeriesSelector: FC<SeriesSelectorProps> = ({
    value,
    onChange,
    options,
    loading = false,
}) => (
    <Autocomplete
        options={options}
        getOptionLabel={(option) => option.name}
        value={options.find((option) => option.name === value) || null}
        onChange={(_, newValue) => onChange(newValue?.name || '')}
        disabled={loading}
        renderOption={(props, option, { inputValue }) => (
            <Box component='li' {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='body2'>
                        <Highlighter search={inputValue}>
                            {option.name}
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
                label='Data series'
                placeholder='Search for a metric…'
                variant='outlined'
                size='small'
            />
        )}
        noOptionsText='No metrics available'
        sx={{ minWidth: 300 }}
    />
);
