import { useEffect, type VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IErrorProps {
    error: Error;
}

const ZendeskButton = () => {
    const openZendeskSupport = () => {
        window?.open('https://getunleash.zendesk.com', '_blank');
    };
    return <Button onClick={openZendeskSupport}>Open a ticket</Button>;
};

export const LayoutError: VFC<IErrorProps> = ({ error }) => {
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const { isOss } = useUiConfig();
    const showZendeskButton = !isOss();

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
                title='Something went wrong'
                primaryButtonText='Go back'
                onClick={() => {
                    navigate('/');
                    window?.location?.reload();
                }}
                secondaryButtonText='Reload this page'
                onClose={() => {
                    window?.location?.reload();
                }}
                maxWidth='xl'
                customButton={
                    <ConditionallyRender
                        condition={showZendeskButton}
                        show={<ZendeskButton />}
                        elseShow={undefined}
                    />
                }
            >
                <Box component='pre' sx={{ color: 'error.main' }}>
                    {error.message}
                </Box>
                <ConditionallyRender
                    condition={Boolean(error.stack)}
                    show={
                        <Box component='pre' sx={{ color: 'error.main' }}>
                            {error.stack}
                        </Box>
                    }
                />
            </Dialogue>
        </Box>
    );
};
