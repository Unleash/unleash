import { Box, Paper, styled, Typography } from '@mui/material';
import React, { FC } from 'react';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';

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
                <ConditionallyRender
                    condition={React.Children.count(children) > 0}
                    show={'Approved by'}
                    elseShow={'No approvals yet'}
                />
            </Typography>
            {children}
        </Paper>
    );
};
