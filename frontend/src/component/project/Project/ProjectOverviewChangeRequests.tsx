import { Box, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { FC } from 'react';

export const ChangeRequestContainer = styled(Box)(({ theme }) => ({
    margin: '0',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    width: '100%',
    padding: theme.spacing(1, 3.25),
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    fontSize: theme.fontSizes.smallBody,
}));

const ColorBox = styled(Box)(({ theme }) => ({
    borderRadius: '8px',
    padding: theme.spacing(1, 2),
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    alignItems: 'center',
    whiteSpace: 'nowrap',
}));

const ApplyBox = styled(ColorBox)(({ theme }) => ({
    background: theme.palette.success.light,
}));

const ReviewBox = styled(ColorBox)(({ theme }) => ({
    background: theme.palette.secondary.light,
}));

const ChangeRequestCount = styled(Typography)(({ theme }) => ({
    fontSize: theme.spacing(2),
    fontWeight: theme.fontWeight.bold,
}));

export const ProjectOverviewChangeRequests: FC<{ project: string }> = ({
    project,
}) => {
    return (
        <ChangeRequestContainer>
            <Box>Open change requests</Box>
            <ApplyBox>
                <span>To be applied</span>
                <ChangeRequestCount>10</ChangeRequestCount>
            </ApplyBox>
            <ReviewBox>
                <span>To be reviewed</span>
                <ChangeRequestCount>20</ChangeRequestCount>
            </ReviewBox>
            <Link to={`/projects/${project}/change-requests`}>
                View change requests
            </Link>
        </ChangeRequestContainer>
    );
};
