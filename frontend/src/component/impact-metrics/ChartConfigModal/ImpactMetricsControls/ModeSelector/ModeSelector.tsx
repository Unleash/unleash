import type { FC } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { AggregationMode } from '../../../types.ts';

export type ModeSelectorProps = {
    value: AggregationMode;
    onChange: (mode: AggregationMode) => void;
    metricType: 'counter' | 'gauge' | 'histogram' | 'unknown';
    label?: string;
};

const allOptions = [
    <MenuItem key='rps' value='rps'>
        Rate per second
    </MenuItem>,
    <MenuItem key='count' value='count'>
        Count
    </MenuItem>,
    <MenuItem key='avg' value='avg'>
        Average
    </MenuItem>,
    <MenuItem key='sum' value='sum'>
        Sum
    </MenuItem>,
    <MenuItem key='p50' value='p50'>
        50th percentile
    </MenuItem>,
    <MenuItem key='p95' value='p95'>
        95th percentile
    </MenuItem>,
    <MenuItem key='p99' value='p99'>
        99th percentile
    </MenuItem>,
];

const optionsByType: Record<string, JSX.Element[]> = {
    counter: [
        <MenuItem key='rps' value='rps'>
            Rate per second
        </MenuItem>,
        <MenuItem key='count' value='count'>
            Count
        </MenuItem>,
    ],
    gauge: [
        <MenuItem key='avg' value='avg'>
            Average
        </MenuItem>,
        <MenuItem key='sum' value='sum'>
            Sum
        </MenuItem>,
    ],
    histogram: [
        <MenuItem key='p50' value='p50'>
            50th percentile
        </MenuItem>,
        <MenuItem key='p95' value='p95'>
            95th percentile
        </MenuItem>,
        <MenuItem key='p99' value='p99'>
            99th percentile
        </MenuItem>,
    ],
};

export const ModeSelector: FC<ModeSelectorProps> = ({
    value,
    onChange,
    metricType,
    label = 'Aggregation Mode',
}) => {
    const options = optionsByType[metricType] ?? allOptions;

    return (
        <FormControl variant='outlined' size='small'>
            {label ? (
                <InputLabel id='mode-select-label'>{label}</InputLabel>
            ) : null}
            <Select
                labelId='mode-select-label'
                value={value}
                onChange={(e) => onChange(e.target.value as AggregationMode)}
                label={label}
            >
                {options}
            </Select>
        </FormControl>
    );
};
