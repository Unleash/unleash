import {
    MenuItem,
    Select,
    styled,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import type { TimeUnit } from '../hooks/useTransitionConditionInput.ts';

const StyledInputGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    width: '100px',
}));

interface IMilestoneProgressionTimeInputProps {
    timeValue: number;
    timeUnit: TimeUnit;
    onTimeValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onTimeUnitChange: (event: SelectChangeEvent<unknown>) => void;
    disabled?: boolean;
    error?: boolean;
}

const handleNumericPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedText)) {
        e.preventDefault();
    }
};

const stopEnterPropagation = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.stopPropagation();
    }
};

export const MilestoneProgressionTimeInput = ({
    timeValue,
    timeUnit,
    onTimeValueChange,
    onTimeUnitChange,
    disabled,
    error,
}: IMilestoneProgressionTimeInputProps) => {
    return (
        <StyledInputGroup>
            <TextField
                type='number'
                value={timeValue}
                onChange={onTimeValueChange}
                onPaste={handleNumericPaste}
                error={error}
                sx={{
                    width: `max(60px, ${String(timeValue).length + 8}ch)`,
                    maxWidth: '300px',
                }}
                size='large'
                disabled={disabled}
                slotProps={{
                    htmlInput: {
                        pattern: '[0-9]*',
                        'aria-label': 'Time duration value',
                        'aria-describedby': 'time-unit-select',
                    },
                }}
            />
            <StyledSelect
                value={timeUnit}
                onChange={onTimeUnitChange}
                size='large'
                aria-label='Time unit'
                id='time-unit-select'
                disabled={disabled}
            >
                <MenuItem value='minutes' onKeyDown={stopEnterPropagation}>
                    Minutes
                </MenuItem>
                <MenuItem value='hours' onKeyDown={stopEnterPropagation}>
                    Hours
                </MenuItem>
                <MenuItem value='days' onKeyDown={stopEnterPropagation}>
                    Days
                </MenuItem>
            </StyledSelect>
        </StyledInputGroup>
    );
};
