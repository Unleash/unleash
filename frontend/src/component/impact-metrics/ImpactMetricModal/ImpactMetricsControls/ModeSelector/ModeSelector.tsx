import type { FC } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { AggregationMode } from '../../../types.ts';

export type ModeSelectorProps = {
    value: AggregationMode;
    onChange: (mode: AggregationMode) => void;
    metricType: 'counter' | 'gauge' | 'histogram' | 'unknown';
    label?: string;
};

type AggregationModeOption = { key: AggregationMode; label: string };

const counterOptions: AggregationModeOption[] = [
    { key: 'rps', label: 'Rate per second' },
    { key: 'count', label: 'Count' },
];

const gaugeOptions: AggregationModeOption[] = [
    { key: 'avg', label: 'Average' },
    { key: 'sum', label: 'Sum' },
];

const histogramOptions: AggregationModeOption[] = [
    { key: 'p50', label: '50th percentile' },
    { key: 'p95', label: '95th percentile' },
    { key: 'p99', label: '99th percentile' },
];

const optionsByType: Record<string, AggregationModeOption[]> = {
    counter: counterOptions,
    gauge: gaugeOptions,
    histogram: histogramOptions,
    unknown: [...counterOptions, ...gaugeOptions, ...histogramOptions],
};

export const getAggregationModeOptions = (
    metricType: ModeSelectorProps['metricType'],
): AggregationModeOption[] =>
    optionsByType[metricType] ?? optionsByType.unknown;

export const ModeSelector: FC<ModeSelectorProps> = ({
    value,
    onChange,
    metricType,
    label = 'Aggregation Mode',
}) => {
    const options = getAggregationModeOptions(metricType);

    return (
        <FormControl variant='outlined' size='large'>
            {label ? (
                <InputLabel id='mode-select-label'>{label}</InputLabel>
            ) : null}
            <Select
                labelId='mode-select-label'
                value={value}
                onChange={(e) => onChange(e.target.value as AggregationMode)}
                label={label}
            >
                {options.map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
