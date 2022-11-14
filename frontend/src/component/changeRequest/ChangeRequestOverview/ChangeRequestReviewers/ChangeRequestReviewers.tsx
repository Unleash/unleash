import { Box, Paper, styled, Typography } from '@mui/material';
import { FC } from 'react';

const StyledBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

export const ChangeRequestReviewers: FC = ({ children }) => {
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                marginTop: theme.spacing(2),
                padding: theme.spacing(4),
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <StyledBox>Reviewers</StyledBox>
            <Typography variant="body1" color="text.secondary">
                Approved by
            </Typography>
            {children}
        </Paper>
    );
};
