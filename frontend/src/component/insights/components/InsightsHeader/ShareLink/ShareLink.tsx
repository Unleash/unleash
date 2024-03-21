import { type VFC, useEffect, useState } from 'react';
import Share from '@mui/icons-material/Share';
import { Box, Button, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { LinkField } from 'component/admin/users/LinkField/LinkField';
import { useSearchParams } from 'react-router-dom';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const createShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('share', 'true');
    return url.toString();
};

export const ShareLink: VFC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const { trackEvent } = usePlausibleTracker();

    useEffect(() => {
        if (searchParams.get('share')) {
            // Remove share query param from URL
            setSearchParams((params) => {
                params.delete('share');
                return params;
            });

            trackEvent('insights-share', {
                props: {
                    eventType: 'link-opened',
                },
            });
        }
    }, [searchParams]);

    const onCopyEvent = () => {
        trackEvent('insights-share', {
            props: {
                eventType: 'link-copied',
            },
        });
    };

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
                        inviteLink={createShareLink()}
                        successTitle='Successfully copied the link.'
                        errorTitle='Could not copy the link.'
                        onCopy={onCopyEvent}
                    />
                </Box>
            </Dialogue>
        </>
    );
};
