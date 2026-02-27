import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import type { FC } from 'react';
import { ValueChip } from './ValueList.tsx';
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
    removeValue: () => void;
    currentValue?: string;
    helpText?: string;
    editingOpen: boolean;
    setEditingOpen: (open: boolean) => void;
    validator: (value: string) => ConstraintValidatorOutput;
};

export const AddRegexConstraintValueWidget: FC<Props> = ({
    currentValue,
    removeValue,
    setEditingOpen,
    editingOpen,
    validator,
}) => {
    const handleClick = () => {
        if (!currentValue) {
            setEditingOpen(true);
            return;
        }
        const [isValid] = validator(currentValue);

        if (!isValid) {
            setEditingOpen(true);
            return;
        }

        setEditingOpen(!editingOpen);
    };

    return (
        <StyledChip
            hasValue={!!currentValue}
            label={currentValue || 'Add value'}
            onClick={handleClick}
            icon={currentValue ? undefined : <Add />}
            onDelete={currentValue ? removeValue : undefined}
        />
    );
};
