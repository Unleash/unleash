import {
    StyledArrowIcon,
    StyledDivInfoContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledParagraphSubtitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';

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
        <StyledDivInfoContainer>
            <StyledParagraphSubtitle data-loading>
                Project members
            </StyledParagraphSubtitle>
            <StyledParagraphEmphasizedText data-loading>
                {memberCount}
            </StyledParagraphEmphasizedText>
            <StyledLink data-loading to={link}>
                <StyledSpanLinkText data-loading>view more </StyledSpanLinkText>
                <StyledArrowIcon data-loading />
            </StyledLink>
        </StyledDivInfoContainer>
    );
};
