import { FC } from 'react';
import useLoading from 'hooks/useLoading';
import { Link as RouterLink } from 'react-router-dom';
import { Box, styled, Typography, Link } from '@mui/material';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';

import {
    StyledCount,
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { useProjectChangeRequests } from 'hooks/api/getters/useProjectChangeRequests/useProjectChangeRequests';

interface IChangeRequestsWidgetProps {
    projectId: string;
}

const StyledChangeBox = styled(Box)(({ theme }) => ({
    textAlign: 'left',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusMedium,
    alignItems: 'center',
}));

const StyledChangeRequestStatusInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledApprovedCount = styled(StyledCount)(({ theme }) => ({
    background: theme.palette.activityIndicators.recent,
    padding: theme.spacing(0, 1),
    marginRight: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
}));

const StyledInReviewCount = styled(StyledCount)(({ theme }) => ({
    background: theme.palette.activityIndicators.primary,
    padding: theme.spacing(0, 1),
    marginRight: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
}));

const ChangeRequestsLabel = () => (
    <Typography component="span" variant="body2" color="text.secondary">
        change requests
    </Typography>
);

export const ChangeRequestsWidget: FC<IChangeRequestsWidgetProps> = ({
    projectId,
}) => {
    const { changeRequests, loading } = useProjectChangeRequests(projectId);
    const loadingRef = useLoading(loading);
    const toBeApplied = changeRequests?.filter(
        (changeRequest: IChangeRequest) => changeRequest?.state === 'Approved'
    ).length;
    const toBeReviewed = changeRequests?.filter(
        (changeRequest: IChangeRequest) => changeRequest?.state === 'In review'
    ).length;

    return (
        <StyledProjectInfoWidgetContainer ref={loadingRef}>
            <StyledWidgetTitle>Open change requests</StyledWidgetTitle>

            <StyledChangeBox
                sx={{ background: theme => theme.palette.success.light }}
            >
                <Typography variant="body2">To be applied</Typography>
                <StyledChangeRequestStatusInfo>
                    <StyledApprovedCount>{toBeApplied}</StyledApprovedCount>{' '}
                    <ChangeRequestsLabel />
                </StyledChangeRequestStatusInfo>
            </StyledChangeBox>
            <StyledChangeBox
                sx={{ background: theme => theme.palette.secondary.light }}
            >
                <Typography variant="body2">To be reviewed</Typography>
                <StyledChangeRequestStatusInfo>
                    <StyledInReviewCount>{toBeReviewed}</StyledInReviewCount>{' '}
                    <ChangeRequestsLabel />
                </StyledChangeRequestStatusInfo>
            </StyledChangeBox>
            <Typography variant="body2" textAlign="center">
                <Link
                    component={RouterLink}
                    to={`/projects/${projectId}/change-requests`}
                >
                    View change requests
                </Link>
            </Typography>
        </StyledProjectInfoWidgetContainer>
    );
};
