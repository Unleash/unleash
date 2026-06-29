import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { DialogWithAside } from './DialogWithAside';

export const meta: StoryMeta = {
    title: 'Common/DialogWithAside',
    background: 'application',
};

const PlaceholderAside = () => (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
            Aside panel
        </Typography>
        <Typography variant='body2'>
            This area is always 320 px wide and hidden below the md breakpoint.
            The close button in the header handles dismissal on all screen
            sizes.
        </Typography>
    </Box>
);

export const Default: Story = () => {
    const [open, setOpen] = useState(true);
    return (
        <>
            <Button variant='contained' onClick={() => setOpen(true)}>
                Open dialog
            </Button>
            <DialogWithAside
                open={open}
                onClose={() => setOpen(false)}
                title='Dialog title'
                aside={<PlaceholderAside />}
            >
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                        Main content
                    </Typography>
                    <Typography variant='body2'>
                        Children are rendered in the scrollable left column.
                    </Typography>
                </Box>
            </DialogWithAside>
        </>
    );
};

export const WithLongContent: Story = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant='contained' onClick={() => setOpen(true)}>
                Open dialog
            </Button>
            <DialogWithAside
                open={open}
                onClose={() => setOpen(false)}
                title='Scrolling content'
                aside={<PlaceholderAside />}
            >
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <Box key={i}>
                            <Typography
                                variant='body2'
                                sx={{ fontWeight: 'bold', mb: 0.5 }}
                            >
                                Section {i + 1}
                            </Typography>
                            <Typography variant='body2'>
                                Content scrolls inside the left column while the
                                aside and header stay fixed.
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </DialogWithAside>
        </>
    );
};
