import { VFC, useState } from 'react';
import { Share } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { LinkField } from 'component/admin/users/LinkField/LinkField';

export const ShareLink: VFC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const url = new URL(window.location.href);
    url.searchParams.set('share', 'true');

    return (
        <>
            <Button
                startIcon={<Share />}
                variant='outlined'
                onClick={() => setIsOpen(true)}
            >
                Share
            </Button>
            <Dialogue
                open={isOpen}
                onClick={() => setIsOpen(false)}
                primaryButtonText='Close'
                title='Share insights'
            >
                <Box>
                    <Typography variant='body1'>
                        Link below will lead to insights dashboard with
                        currently selected filter.
                    </Typography>
                    <LinkField
                        inviteLink={url.toString()}
                        successTitle='Successfully copied the link.'
                        errorTitle='Could not copy the link.'
                    />
                </Box>
            </Dialogue>
        </>
    );
};
