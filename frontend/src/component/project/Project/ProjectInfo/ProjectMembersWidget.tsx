import {
    StyledArrowIcon,
    StyledProjectInfoWidgetContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledWidgetTitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IProjectMembersWidgetProps {
    projectId: string;
    memberCount: number;
}

export const ProjectMembersWidget = ({
    projectId,
    memberCount,
}: IProjectMembersWidgetProps) => {
    const { uiConfig } = useUiConfig();

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${projectId}/settings/access`;
    }

    return (
        <StyledProjectInfoWidgetContainer>
            <StyledWidgetTitle data-loading>Project members</StyledWidgetTitle>
            <StyledParagraphEmphasizedText data-loading>
                {memberCount}
            </StyledParagraphEmphasizedText>
            <StyledLink data-loading to={link}>
                <StyledSpanLinkText data-loading>view more </StyledSpanLinkText>
                <StyledArrowIcon data-loading />
            </StyledLink>
        </StyledProjectInfoWidgetContainer>
    );
};
