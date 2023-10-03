import { useState } from 'react';

import { Close, Help } from '@mui/icons-material';
import { Box, IconButton, Popper, Paper } from '@mui/material';
import { PlaygroundGuidance } from '../PlaygroundGuidance/PlaygroundGuidance';

export const PlaygroundGuidancePopper = () => {
    const [anchor, setAnchorEl] = useState<null | Element>(null);

    const onOpen = (event: React.FormEvent<HTMLButtonElement>) =>
        setAnchorEl(event.currentTarget);

    const onClose = () => setAnchorEl(null);

    const open = Boolean(anchor);

    const id = 'playground-guidance-popper';

    return (
        <Box>
            <IconButton onClick={onOpen} aria-describedby={id}>
                <Help />
            </IconButton>

            <Popper
                id={id}
                open={open}
                anchorEl={anchor}
                sx={theme => ({ zIndex: theme.zIndex.tooltip })}
            >
                <Paper
                    sx={theme => ({
                        padding: theme.spacing(8, 4),
                        maxWidth: '500px',
                        borderRadius: `${theme.shape.borderRadiusExtraLarge}px`,
                    })}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 25, top: 15 }}
                    >
                        <Close />
                    </IconButton>
                    <PlaygroundGuidance />
                </Paper>
            </Popper>
        </Box>
    );
};
