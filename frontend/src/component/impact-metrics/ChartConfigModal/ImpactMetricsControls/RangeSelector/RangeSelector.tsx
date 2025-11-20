import type { FC } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export type TimeRange = 'hour' | 'day' | 'week' | 'month';

export type RangeSelectorProps = {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
};

export const RangeSelector: FC<RangeSelectorProps> = ({ value, onChange }) => (
    <FormControl variant='outlined' size='small'>
        <InputLabel id='range-select-label'>Time</InputLabel>
        <Select
            labelId='range-select-label'
            value={value}
            onChange={(e) => onChange(e.target.value as TimeRange)}
            label='Time Range'
        >
            <MenuItem value='hour'>Last hour</MenuItem>
            <MenuItem value='day'>Last 24 hours</MenuItem>
            <MenuItem value='week'>Last 7 days</MenuItem>
            <MenuItem value='month'>Last 30 days</MenuItem>
        </Select>
    </FormControl>
);
