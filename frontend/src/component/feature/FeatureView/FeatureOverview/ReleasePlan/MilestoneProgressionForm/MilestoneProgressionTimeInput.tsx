import {
    MenuItem,
    Select,
    styled,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import type { TimeUnit } from '../hooks/useMilestoneProgressionForm.js';

const StyledInputGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '60px',
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
}: IMilestoneProgressionTimeInputProps) => {
    return (
        <StyledInputGroup>
            <StyledTextField
                type='number'
                value={timeValue}
                onChange={onTimeValueChange}
                onPaste={handleNumericPaste}
                inputProps={{
                    pattern: '[0-9]*',
                    'aria-label': 'Time duration value',
                    'aria-describedby': 'time-unit-select',
                }}
                size='small'
                disabled={disabled}
            />
            <StyledSelect
                value={timeUnit}
                onChange={onTimeUnitChange}
                size='small'
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
