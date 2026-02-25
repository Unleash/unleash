import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import {
    type ReactNode,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { ValueChip } from './ValueList.tsx';
import type { OnAddActions } from './AddValuesPopover.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';
import { AddRegexValuePopover } from './AddRegexValuePopover.tsx';

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
    helpText?: ReactNode;
    validator: (value: string) => ConstraintValidatorOutput;
    caseInsensitive: boolean;
    onToggleCaseSensitivity: () => void;
    inverted: boolean;
    onToggleInverted: () => void;
};

export const AddRegexConstraintValueWidget = forwardRef<HTMLDivElement, Props>(
    (
        {
            currentValue,
            caseInsensitive,
            onAddValue,
            removeValue,
            helpText,
            validator,
            onToggleCaseSensitivity,
            inverted,
            onToggleInverted,
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
                setError(
                    `Values cannot be longer than 100 characters (current: ${newValue.length})`,
                );
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
                <AddRegexValuePopover
                    initialValue={currentValue}
                    caseInsensitive={caseInsensitive}
                    onToggleCaseSensitivity={onToggleCaseSensitivity}
                    onAdd={handleAdd}
                    helpText={helpText}
                    open={open}
                    anchorEl={positioningRef.current}
                    onClose={() => setOpen(false)}
                    inverted={inverted}
                    onToggleInverted={onToggleInverted}
                />
            </>
        );
    },
);
