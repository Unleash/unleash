import { Box, Typography, Button } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

export const StaleDataNotification = ({
    refresh,
    show,
    afterSubmitAction,
}: any) => {
    console.log(afterSubmitAction);
    return (
        <ConditionallyRender
            condition={show}
            show={
                <Box
                    sx={{
                        position: 'fixed',
                        right: '20px',
                        bottom: '20px',
                        padding: '25px',
                        boxShadow: '1px 1px 2px rgba(0,0,0, 0.4)',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        maxWidth: '400px',
                        zIndex: 1000,
                    }}
                >
                    <Typography variant="h5" sx={{ my: 2, mb: 2 }}>
                        Your data is stale
                    </Typography>
                    <Typography variant="body1" sx={{ my: 2, mb: 3 }}>
                        The data you have been working on is stale, would you
                        like to refresh your data? This may happen if someone
                        has been making changes to the data while you were
                        working.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            refresh();
                            afterSubmitAction();
                        }}
                    >
                        Refresh data
                    </Button>
                </Box>
            }
        />
    );
};
