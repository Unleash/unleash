import { useState } from 'react';
import { IconButton, styled, Tooltip } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { CommandBarDialog } from './CommandBarDialog.tsx';
import { InlineCommandBar } from './InlineCommandBar.tsx';
import { useCommandBarPlaceholder } from './useCommandBarHotkey.ts';

const StyledIconButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
    color: open ? theme.palette.primary.main : theme.palette.neutral.main,
}));

const CompactCommandBar = () => {
    const [open, setOpen] = useState(false);
    const placeholder = useCommandBarPlaceholder();

    return (
        <>
            <Tooltip title={placeholder} arrow>
                <StyledIconButton
                    size='large'
                    open={open}
                    onClick={() => setOpen(true)}
                    aria-label={placeholder}
                >
                    <SearchIcon />
                </StyledIconButton>
            </Tooltip>
            <CommandBarDialog open={open} onOpenChange={setOpen} />
        </>
    );
};

export const CommandBar = () => {
    const theme = useTheme();
    const isCompact = useMediaQuery(theme.breakpoints.down('md'));

    return isCompact ? <CompactCommandBar /> : <InlineCommandBar />;
};
