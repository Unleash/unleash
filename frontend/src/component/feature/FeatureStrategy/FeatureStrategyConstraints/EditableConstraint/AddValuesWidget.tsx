import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { parseParameterStrings } from 'utils/parseParameter';
import { baseChipStyles } from './ValueList.tsx';
import { AddValuesPopover, type OnAddActions } from './AddValuesPopover.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';

// todo: MUI v6 / v7 upgrade: consider changing this to a Chip to align with the rest of the values and the single value selector. There was a fix introduced in v6 that makes you not lose focus on pressing esc: https://mui.com/material-ui/migration/upgrade-to-v6/#chip talk to Thomas for more info.
const AddValuesButton = styled('button')(({ theme }) => ({
    ...baseChipStyles(theme),
    color: theme.palette.primary.main,
    svg: {
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
    border: 'none',
    borderRadius: theme.shape.borderRadiusExtraLarge,
    display: 'flex',
    flexFlow: 'row nowrap',
    whiteSpace: 'nowrap',
    gap: theme.spacing(0.25),
    alignItems: 'center',
    padding: theme.spacing(0.5, 1.5, 0.5, 1.5),
    height: 'auto',
    cursor: 'pointer',
}));

interface AddValuesProps {
    onAddValues: (newValues: string[]) => void;
    helpText?: string;
    validator: (...values: string[]) => ConstraintValidatorOutput;
}

export const AddValuesWidget = forwardRef<HTMLButtonElement, AddValuesProps>(
    ({ onAddValues, helpText, validator }, ref) => {
        const [open, setOpen] = useState(false);
        const positioningRef = useRef<HTMLButtonElement>(null);
        useImperativeHandle(
            ref,
            () => positioningRef.current as HTMLButtonElement,
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
                <AddValuesButton
                    ref={positioningRef}
                    onClick={() => setOpen(true)}
                    type='button'
                    data-testid='CONSTRAINT_ADD_VALUES_BUTTON'
                >
                    <Add />
                    <span>Add values</span>
                </AddValuesButton>

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
