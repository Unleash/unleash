import {
    MenuItem,
    Select,
    styled,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import type { TransitionUnit } from '../hooks/useTransitionConditionInput.ts';
import { useUiFlag } from 'hooks/useUiFlag.ts';

const StyledInputGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledSelect = styled(Select)({
    minWidth: '100px',
});

interface TransitionConditionInputProps {
    value: number;
    unit: TransitionUnit;
    onValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUnitChange: (event: SelectChangeEvent<unknown>) => void;
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

export const TransitionConditionInput = ({
    value,
    unit,
    onValueChange,
    onUnitChange,
    disabled,
    error,
}: TransitionConditionInputProps) => {
    const exposureBasedAutomationEnabled = useUiFlag('exposureBasedAutomation');

    return (
        <StyledInputGroup>
            <TextField
                type='number'
                value={value}
                onChange={onValueChange}
                onPaste={handleNumericPaste}
                error={error}
                sx={{
                    width: `max(60px, ${String(value).length + 8}ch)`,
                    maxWidth: '300px',
                }}
                size='large'
                disabled={disabled}
                slotProps={{
                    htmlInput: {
                        pattern: '[0-9]*',
                        'aria-label': 'Condition value',
                        'aria-describedby': 'condition-unit-select',
                    },
                }}
            />
            <StyledSelect
                value={unit}
                onChange={onUnitChange}
                size='large'
                aria-label='Condition unit'
                id='condition-unit-select'
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
                {exposureBasedAutomationEnabled || unit === 'exposures' ? (
                    <MenuItem
                        value='exposures'
                        onKeyDown={stopEnterPropagation}
                    >
                        Exposures
                    </MenuItem>
                ) : null}
            </StyledSelect>
        </StyledInputGroup>
    );
};
