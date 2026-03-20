import type { FC } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { MetricType } from '../../../types.ts';

export type MetricTypeSelectorProps = {
    value: MetricType;
    onChange: (type: MetricType) => void;
};

export const MetricTypeSelector: FC<MetricTypeSelectorProps> = ({
    value,
    onChange,
}) => (
    <FormControl variant='outlined' size='small'>
        <InputLabel id='metric-type-select-label'>Metric Type</InputLabel>
        <Select
            labelId='metric-type-select-label'
            value={value}
            onChange={(e) => onChange(e.target.value as MetricType)}
            label='Metric Type'
        >
            <MenuItem value='counter'>Counter</MenuItem>
            <MenuItem value='gauge'>Gauge</MenuItem>
            <MenuItem value='histogram'>Histogram</MenuItem>
        </Select>
    </FormControl>
);
