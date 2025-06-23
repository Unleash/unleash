import type { FC } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Box,
    Autocomplete,
    TextField,
    Typography,
} from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { Highlighter } from 'component/common/Highlighter/Highlighter';

export interface ImpactMetricsControlsProps {
    selectedSeries: string;
    onSeriesChange: (series: string) => void;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    onRangeChange: (range: 'hour' | 'day' | 'week' | 'month') => void;
    beginAtZero: boolean;
    onBeginAtZeroChange: (beginAtZero: boolean) => void;
    metricSeries: (ImpactMetricsSeries & { name: string })[];
    loading?: boolean;
}

export const ImpactMetricsControls: FC<ImpactMetricsControlsProps> = ({
    selectedSeries,
    onSeriesChange,
    selectedRange,
    onRangeChange,
    beginAtZero,
    onBeginAtZeroChange,
    metricSeries,
    loading = false,
}) => (
    <Box
        sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(3),
            maxWidth: 400,
        })}
    >
        <Typography variant='body2' color='text.secondary'>
            Select a custom metric to see its value over time. This can help you
            understand the impact of your feature rollout on key outcomes, such
            as system performance, usage patterns or error rates.
        </Typography>

        <Autocomplete
            options={metricSeries}
            getOptionLabel={(option) => option.name}
            value={
                metricSeries.find((option) => option.name === selectedSeries) ||
                null
            }
            onChange={(_, newValue) => onSeriesChange(newValue?.name || '')}
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

        <FormControl variant='outlined' size='small' sx={{ minWidth: 200 }}>
            <InputLabel id='range-select-label'>Time</InputLabel>
            <Select
                labelId='range-select-label'
                value={selectedRange}
                onChange={(e) =>
                    onRangeChange(
                        e.target.value as 'hour' | 'day' | 'week' | 'month',
                    )
                }
                label='Time Range'
            >
                <MenuItem value='hour'>Last hour</MenuItem>
                <MenuItem value='day'>Last 24 hours</MenuItem>
                <MenuItem value='week'>Last 7 days</MenuItem>
                <MenuItem value='month'>Last 30 days</MenuItem>
            </Select>
        </FormControl>

        <FormControlLabel
            control={
                <Checkbox
                    checked={beginAtZero}
                    onChange={(e) => onBeginAtZeroChange(e.target.checked)}
                />
            }
            label='Begin at zero'
        />
    </Box>
);
