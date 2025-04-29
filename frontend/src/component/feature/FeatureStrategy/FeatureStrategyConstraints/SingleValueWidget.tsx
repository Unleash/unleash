import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ValueChip } from './ValueList';
import { AddValuesPopover, type OnAddActions } from './AddValuesPopover';

const AddValuesButton = styled(ValueChip, {
    shouldForwardProp: (prop) => prop !== 'hasValue',
})<{ hasValue: boolean }>(({ theme, hasValue }) => ({
    color: hasValue ? 'inherit' : theme.palette.primary.main,
    '.MuiChip-icon': {
        transform: 'translateX(50%)',
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
}));

interface AddValuesProps {
    onAddValue: (newValue: string) => void;
    removeValue: () => void;
    currentValue?: string;
}

export const SingleValueWidget = forwardRef<HTMLDivElement, AddValuesProps>(
    ({ currentValue, onAddValue, removeValue }, ref) => {
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

            onAddValue(newValue);
            setError('');
            setOpen(false);
        };

        return (
            <>
                <AddValuesButton
                    hasValue={!!currentValue}
                    ref={positioningRef}
                    label={currentValue || 'Add value'}
                    onClick={() => setOpen(true)}
                    icon={currentValue ? undefined : <Add />}
                    onDelete={currentValue ? removeValue : undefined}
                />
                <AddValuesPopover
                    currentValue={currentValue}
                    onAdd={handleAdd}
                    open={open}
                    anchorEl={positioningRef.current}
                    onClose={() => setOpen(false)}
                />
            </>
        );
    },
);
