import { useState, VFC } from 'react';
import { Box, Paper, Button } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IFeedbackProps {
    id: string;
}

export const Feedback: VFC<IFeedbackProps> = ({ id }) => {
    const [selected, setSelected] = useState<'yes' | 'no'>();
    const { trackEvent } = usePlausibleTracker();

    const onTrackFeedback = (value: 'yes' | 'no') => {
        setSelected(value);
        trackEvent('project_overview', {
            props: {
                eventType: id,
                wasHelpful: value === 'yes',
            },
        });
    };

    return (
        <Paper
            elevation={0}
            sx={{
                background: theme => theme.palette.neutral.light,
                padding: theme => theme.spacing(1.5, 2),
                marginTop: theme => theme.spacing(1.5),
            }}
        >
            Was this information useful to you?
            <Box
                sx={{
                    display: 'flex',
                    gap: theme => theme.spacing(1),
                    marginTop: theme => theme.spacing(0.5),
                }}
            >
                <Button
                    size="small"
                    variant={selected === 'yes' ? 'contained' : 'outlined'}
                    sx={{ padding: 0 }}
                    onClick={() => onTrackFeedback('yes')}
                    disabled={Boolean(selected)}
                >
                    Yes
                </Button>
                <Button
                    size="small"
                    variant={selected === 'no' ? 'contained' : 'outlined'}
                    sx={{ padding: 0 }}
                    onClick={() => onTrackFeedback('no')}
                    disabled={Boolean(selected)}
                >
                    No
                </Button>
            </Box>
        </Paper>
    );
};
