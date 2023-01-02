import { Box, Paper, styled, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';

const StyledBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

export const ChangeRequestReviewersHeader: FC<{
    actualApprovals: number;
    minApprovals: number;
}> = ({ actualApprovals, minApprovals }) => {
    return (
        <>
            Reviewers{' '}
            <Typography component="span" color="text.secondary">
                ({actualApprovals}/{minApprovals} required)
            </Typography>
        </>
    );
};

export const ChangeRequestReviewers: FC<{ header: ReactNode }> = ({
    header,
    children,
}) => {
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                marginTop: theme.spacing(2),
                padding: theme.spacing(4),
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <StyledBox>{header}</StyledBox>
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
