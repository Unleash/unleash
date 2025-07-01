import type { FC } from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

export type BeginAtZeroToggleProps = {
    value: boolean;
    onChange: (beginAtZero: boolean) => void;
};

export const BeginAtZeroToggle: FC<BeginAtZeroToggleProps> = ({
    value,
    onChange,
}) => (
    <FormControlLabel
        control={
            <Checkbox
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
        }
        label='Begin at zero'
    />
);
