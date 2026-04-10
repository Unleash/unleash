import type { FC } from 'react';
import { FormControl, InputLabel, Select } from '@mui/material';

export type TimeRange = 'hour' | 'day' | 'week' | 'month';

export type RangeSelectorProps = {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
    label?: string;
    children: React.ReactNode;
};

export const RangeSelector: FC<RangeSelectorProps> = ({
    value,
    onChange,
    label = 'Time',
    children,
}) => (
    <FormControl variant='outlined' size='small'>
        {label ? (
            <InputLabel id='range-select-label'>{label}</InputLabel>
        ) : null}
        <Select
            labelId='range-select-label'
            value={value}
            onChange={(e) => onChange(e.target.value as TimeRange)}
            label={label}
        >
            {children}
        </Select>
    </FormControl>
);
