import { VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { GO_BACK } from 'constants/navigate';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IErrorProps {
    error: Error;
}

export const Error: VFC<IErrorProps> = ({ error }) => {
    const navigate = useNavigate();
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
