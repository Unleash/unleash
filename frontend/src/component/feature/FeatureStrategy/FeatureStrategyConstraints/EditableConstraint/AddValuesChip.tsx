import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { parseParameterStrings } from 'utils/parseParameter';
import { ValueChip } from './ValueList.tsx';
import { AddValuesPopover, type OnAddActions } from './AddValuesPopover.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';

const StyledChip = styled(ValueChip)(({ theme }) => ({
    color: theme.palette.primary.main,
    width: 'max-content',
    '.MuiChip-icon': {
        transform: 'translateX(50%)',
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
}));

interface AddValuesProps {
    onAddValues: (newValues: string[]) => void;
    helpText?: string;
    validator: (...values: string[]) => ConstraintValidatorOutput;
}

export const AddValuesChip = forwardRef<HTMLDivElement, AddValuesProps>(
    ({ onAddValues, helpText, validator }, ref) => {
        const [open, setOpen] = useState(false);
        const positioningRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(
            ref,
            () => positioningRef.current as HTMLDivElement,
        );

        const handleAdd = (
            inputValues: string,
            { setError, clearInput }: OnAddActions,
        ) => {
            const newValues = parseParameterStrings(inputValues);

            if (newValues.length === 0) {
                setError('Values cannot be empty');
                return;
            }

            if (newValues.some((v) => v.length > 100)) {
                setError('Values cannot be longer than 100 characters');
                return;
            }

            const [isValid, errorMessage] = validator(...newValues);
            if (isValid) {
                onAddValues(newValues);
                clearInput();
                setError('');
            } else {
                setError(errorMessage);
            }
        };

        return (
            <>
                <StyledChip
                    ref={positioningRef}
                    icon={<Add />}
                    label='Add values'
                    onClick={() => setOpen(true)}
                    data-testid='CONSTRAINT_ADD_VALUES_BUTTON'
                />

                <AddValuesPopover
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
