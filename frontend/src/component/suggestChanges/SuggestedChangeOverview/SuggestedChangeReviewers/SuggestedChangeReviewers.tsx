import { Box, Paper } from '@mui/material';

export const SuggestedChangeReviewers = () => {
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                marginTop: theme.spacing(2),
                padding: 2,
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <Box sx={theme => ({ padding: theme.spacing(2) })}>Reviewers</Box>
        </Paper>
    );
};
