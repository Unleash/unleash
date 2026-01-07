import { useState } from 'react';

import Close from '@mui/icons-material/Close';
import Help from '@mui/icons-material/Help';
import { Box, IconButton, Popover, styled } from '@mui/material';
import { PlaygroundGuidance } from '../PlaygroundGuidance/PlaygroundGuidance.tsx';

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: theme.shape.borderRadiusExtraLarge,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(8, 4),
        maxWidth: '500px',
    },
}));

export const PlaygroundGuidancePopper = () => {
    const [anchor, setAnchorEl] = useState<null | Element>(null);

    const onOpen = (event: React.FormEvent<HTMLButtonElement>) =>
        setAnchorEl(event.currentTarget);

    const onClose = () => setAnchorEl(null);

    const open = Boolean(anchor);

    return (
        <Box>
            <IconButton onClick={onOpen} aria-label='Open Playground guidance'>
                <Help />
            </IconButton>

            <StyledPopover
                open={open}
                anchorEl={anchor}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                sx={(theme) => ({
                    zIndex: theme.zIndex.tooltip,
                    background: 'none',
                })}
            >
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 25, top: 15 }}
                >
                    <Close />
                </IconButton>
                <PlaygroundGuidance />
            </StyledPopover>
        </Box>
    );
};
