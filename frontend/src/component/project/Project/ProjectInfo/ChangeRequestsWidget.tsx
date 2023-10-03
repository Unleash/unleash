import { FC } from 'react';
import useLoading from 'hooks/useLoading';
import { Box, styled, Typography } from '@mui/material';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';

import {
    StyledCount,
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { useProjectChangeRequests } from 'hooks/api/getters/useProjectChangeRequests/useProjectChangeRequests';
import { WidgetFooterLink } from './WidgetFooterLink';

const LOADING_LABEL = 'change-requests-widget';

interface IChangeRequestsWidgetProps {
    projectId: string;
}

const StyledContentBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
}));

const StyledChangeBox = styled(Box)(({ theme }) => ({
    flex: 1,
    textAlign: 'left',
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusMedium,
    alignItems: 'center',
    minWidth: 175,
}));

const StyledChangeRequestStatusInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledApprovedCount = styled(StyledCount)(({ theme }) => ({
    background: theme.palette.seen.recent,
    padding: theme.spacing(0, 1),
    marginRight: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
}));

const StyledInReviewCount = styled(StyledCount)(({ theme }) => ({
    background: theme.palette.seen.primary,
    padding: theme.spacing(0, 1),
    marginRight: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing(0.5),
}));

const ChangeRequestsLabel = () => (
    <Typography
        component="span"
        variant="body2"
        color="text.secondary"
        lineHeight={1}
        data-loading={LOADING_LABEL}
    >
        change requests
    </Typography>
);

export const ChangeRequestsWidget: FC<IChangeRequestsWidgetProps> = ({
    projectId,
}) => {
    const { changeRequests, loading } = useProjectChangeRequests(projectId);
    const loadingRef = useLoading(loading, `[data-loading="${LOADING_LABEL}"]`);
    const toBeApplied = changeRequests?.filter(
        (changeRequest: IChangeRequest) => changeRequest?.state === 'Approved'
    ).length;
    const toBeReviewed = changeRequests?.filter(
        (changeRequest: IChangeRequest) => changeRequest?.state === 'In review'
    ).length;

    return (
        <StyledProjectInfoWidgetContainer ref={loadingRef}>
            <StyledWidgetTitle>Open change requests</StyledWidgetTitle>
            <StyledContentBox>
                <StyledChangeBox
                    sx={{ background: theme => theme.palette.success.light }}
                >
                    <StyledSubtitle>To be applied</StyledSubtitle>
                    <StyledChangeRequestStatusInfo>
                        <StyledApprovedCount data-loading={LOADING_LABEL}>
                            {toBeApplied || 0}
                        </StyledApprovedCount>{' '}
                        <ChangeRequestsLabel />
                    </StyledChangeRequestStatusInfo>
                </StyledChangeBox>
                <StyledChangeBox
                    sx={{ background: theme => theme.palette.secondary.light }}
                >
                    <StyledSubtitle>To be reviewed</StyledSubtitle>
                    <StyledChangeRequestStatusInfo>
                        <StyledInReviewCount data-loading={LOADING_LABEL}>
                            {toBeReviewed || 0}
                        </StyledInReviewCount>{' '}
                        <ChangeRequestsLabel />
                    </StyledChangeRequestStatusInfo>
                </StyledChangeBox>
            </StyledContentBox>
            <WidgetFooterLink to={`/projects/${projectId}/change-requests`}>
                View change requests
            </WidgetFooterLink>
        </StyledProjectInfoWidgetContainer>
    );
};
