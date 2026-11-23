import { useRef } from 'react';
import { Dialog, styled } from '@mui/material';
import { COMMAND_BAR_LABEL_ID, CommandBarPanel } from './CommandBarPanel.tsx';
import { useCommandBarHotkey } from './useCommandBarHotkey.ts';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-container': { alignItems: 'flex-start' },
    '& .MuiDialog-paper': {
        overflow: 'visible',
        marginTop: theme.spacing(8),
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        background: 'transparent',
        boxShadow: 'none',
    },
}));

interface ICommandBarDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CommandBarDialog = ({
    open,
    onOpenChange,
}: ICommandBarDialogProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useCommandBarHotkey([containerRef], () => onOpenChange(!open));

    return (
        <StyledDialog
            open={open}
            onClose={() => onOpenChange(false)}
            fullWidth
            maxWidth='sm'
            aria-labelledby={COMMAND_BAR_LABEL_ID}
        >
            <CommandBarPanel
                variant='dialog'
                containerRef={containerRef}
                inputRef={inputRef}
                onDismiss={() => onOpenChange(false)}
            />
        </StyledDialog>
    );
};
