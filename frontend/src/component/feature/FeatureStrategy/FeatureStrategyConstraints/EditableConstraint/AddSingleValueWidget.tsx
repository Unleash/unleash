import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ValueChip } from './ValueList.tsx';
import { AddValuesPopover, type OnAddActions } from './AddValuesPopover.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';

// No, escape handling doesn't work correctly with chips and popovers in MUI v5.
// This is an intentional trade-off for now because the chip makes it easy to
// use delete/backspace to clear the value and otherwise works pretty well (cf
// https://github.com/Unleash/unleash/pull/9859).
//
// In MUI v6 and onwards this will "just work"
// (https://mui.com/material-ui/migration/upgrade-to-v6/#chip)
const StyledChip = styled(ValueChip, {
    shouldForwardProp: (prop) => prop !== 'hasValue',
})<{ hasValue: boolean }>(({ theme, hasValue }) => ({
    color: hasValue ? 'inherit' : theme.palette.primary.main,
    width: 'max-content',
    '.MuiChip-icon': {
        transform: 'translateX(50%)',
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
}));

type Props = {
    onAddValue: (newValue: string) => void;
    removeValue: () => void;
    currentValue?: string;
    helpText?: string;
    inputType: 'text' | 'number';
    validator: (value: string) => ConstraintValidatorOutput;
};

export const AddSingleValueWidget = forwardRef<HTMLDivElement, Props>(
    (
        {
            currentValue,
            onAddValue,
            removeValue,
            helpText,
            inputType,
            validator,
        },
        ref,
    ) => {
        const [open, setOpen] = useState(false);
        const positioningRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(
            ref,
            () => positioningRef.current as HTMLDivElement,
        );

        const handleAdd = (newValue: string, { setError }: OnAddActions) => {
            if (newValue.length > 100) {
                setError('Values cannot be longer than 100 characters');
                return;
            }

            const [isValid, errorMessage] = validator(newValue);
            if (isValid) {
                onAddValue(newValue);
                setError('');
                setOpen(false);
            } else {
                setError(errorMessage);
                return;
            }
        };

        return (
            <>
                <StyledChip
                    hasValue={!!currentValue}
                    ref={positioningRef}
                    label={currentValue || 'Add value'}
                    onClick={() => setOpen(true)}
                    icon={currentValue ? undefined : <Add />}
                    onDelete={currentValue ? removeValue : undefined}
                />
                <AddValuesPopover
                    inputProps={{
                        inputMode: inputType === 'number' ? 'decimal' : 'text',
                    }}
                    initialValue={currentValue}
                    onAdd={handleAdd}
                    helpText={helpText}
                    open={open}
                    anchorEl={positioningRef.current}
                    onClose={() => setOpen(false)}
                />
            </>
        );
    },
);
