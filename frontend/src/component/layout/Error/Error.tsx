import { useEffect, VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IErrorProps {
    error: Error;
}

export const Error: VFC<IErrorProps> = ({ error }) => {
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();

    useEffect(() => {
        const { message, stack = 'unknown' } = error;

        trackEvent('unknown_ui_error', {
            props: {
                location: window?.location?.href || 'unknown',
                message,
                stack,
            },
        });
    }, []);

    return (
        <Box sx={{ backgroundColor: 'neutral.light', height: '100%', p: 4 }}>
            <Dialogue
                open={true}
                title="Something went wrong"
                primaryButtonText="Go back"
                onClick={() => {
                    navigate('/');
                    window?.location?.reload();
                }}
                secondaryButtonText="Reload this page"
                onClose={() => {
                    window?.location?.reload();
                }}
                maxWidth="xl"
            >
                <Box component="pre" sx={{ color: 'error.main' }}>
                    {error.message}
                </Box>
                <ConditionallyRender
                    condition={Boolean(error.stack)}
                    show={
                        <Box component="pre" sx={{ color: 'error.main' }}>
                            {error.stack}
                        </Box>
                    }
                />
            </Dialogue>
        </Box>
    );
};
