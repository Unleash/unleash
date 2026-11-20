import { useRef, useState } from 'react';
import { Dialog, IconButton, styled, Tooltip } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { CommandBarPanel } from './CommandBarPanel.tsx';
import {
    useCommandBarHotkey,
    useCommandBarPlaceholder,
} from './useCommandBarHotkey.ts';

const StyledCompactDialog = styled(Dialog)(({ theme }) => ({
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

const StyledIconButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
    color: open ? theme.palette.primary.main : theme.palette.neutral.main,
}));

export const CommandBar = () => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const compactIconRef = useRef<HTMLButtonElement>(null);
    const theme = useTheme();
    const isCompact = useMediaQuery(theme.breakpoints.down('md'));
    const [compactExpanded, setCompactExpanded] = useState(false);
    const placeholder = useCommandBarPlaceholder();

    useCommandBarHotkey([compactIconRef, searchContainerRef], () => {
        if (isCompact) {
            setCompactExpanded(!compactExpanded);
        } else if (document.activeElement === searchInputRef.current) {
            searchInputRef.current?.blur();
        } else {
            searchInputRef.current?.focus();
        }
    });

    if (isCompact) {
        return (
            <>
                <Tooltip title={placeholder} arrow>
                    <StyledIconButton
                        ref={compactIconRef}
                        size='large'
                        open={compactExpanded}
                        onClick={() => setCompactExpanded(true)}
                        aria-label={placeholder}
                    >
                        <SearchIcon />
                    </StyledIconButton>
                </Tooltip>
                <StyledCompactDialog
                    open={compactExpanded}
                    onClose={() => setCompactExpanded(false)}
                    fullWidth
                    maxWidth='sm'
                >
                    <CommandBarPanel
                        variant='dialog'
                        containerRef={searchContainerRef}
                        inputRef={searchInputRef}
                        onDismiss={() => setCompactExpanded(false)}
                    />
                </StyledCompactDialog>
            </>
        );
    }

    return (
        <CommandBarPanel
            variant='inline'
            containerRef={searchContainerRef}
            inputRef={searchInputRef}
        />
    );
};
