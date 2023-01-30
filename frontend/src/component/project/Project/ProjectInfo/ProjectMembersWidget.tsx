import {
    StyledLink,
    StyledProjectInfoWidgetContainer,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { StatusBox } from '../ProjectStats/StatusBox';

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
        <StyledProjectInfoWidgetContainer
            sx={{ padding: theme => theme.spacing(0, 0, 3, 0) }}
        >
            <StatusBox
                title={'Project members'}
                boxText={`${memberCount}`}
                change={change}
                fullWidthBodyText
            />
            <StyledLink data-loading to={link}>
                <StyledSpanLinkText data-loading>
                    View all members
                </StyledSpanLinkText>
            </StyledLink>
        </StyledProjectInfoWidgetContainer>
    );
};
