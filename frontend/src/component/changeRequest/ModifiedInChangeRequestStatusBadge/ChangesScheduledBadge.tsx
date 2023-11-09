import { Box, useMediaQuery, useTheme } from '@mui/material';
import { StyledLink } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanelDetails/StyledRow';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Badge } from 'component/common/Badge/Badge';

export interface IChangesScheduledBadgeProps {
    scheduledChangeRequestIds: number[];
}
export const ChangesScheduledBadge = ({
    scheduledChangeRequestIds,
}: IChangesScheduledBadgeProps) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const project = useRequiredPathParam('projectId');
    if (isSmallScreen) {
        return null;
    }

    return (
        <Box sx={{ mr: 1.5 }}>
            <TooltipLink
                tooltip={
                    <>
                        {scheduledChangeRequestIds?.map((id, index) => (
                            <StyledLink
                                key={`${project}-${index}`}
                                to={`/projects/${project}/change-requests/${id}`}
                            >
                                Change request #{id}
                            </StyledLink>
                        ))}
                    </>
                }
            >
                <Badge color='warning'>Changes Scheduled</Badge>
            </TooltipLink>
        </Box>
    );
};
