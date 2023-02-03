import {
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { StatusBox } from '../ProjectStats/StatusBox';
import { WidgetFooterLink } from './WidgetFooterLink';
import { Box } from '@mui/material';

interface IProjectMembersWidgetProps {
    projectId: string;
    memberCount: number;
    change?: number;
}

export const ProjectMembersWidget = ({
    projectId,
    memberCount,
    change = 0,
}: IProjectMembersWidgetProps) => {
    const { uiConfig } = useUiConfig();

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${projectId}/settings/access`;
    }

    return (
        <StyledProjectInfoWidgetContainer>
            <StyledWidgetTitle data-loading>Project members</StyledWidgetTitle>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <StatusBox boxText={`${memberCount}`} change={change} />
            </Box>
            <WidgetFooterLink to={link}>View all members</WidgetFooterLink>
        </StyledProjectInfoWidgetContainer>
    );
};
