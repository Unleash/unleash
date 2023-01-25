import {
    StyledArrowIcon,
    StyledProjectInfoWidgetContainer,
    StyledDivPercentageContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledWidgetTitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';

interface IHealthWidgetProps {
    projectId: string;
    health: number;
}
export const HealthWidget = ({ projectId, health }: IHealthWidgetProps) => {
    return (
        <StyledProjectInfoWidgetContainer>
            <StyledDivPercentageContainer>
                <PercentageCircle percentage={health} />
            </StyledDivPercentageContainer>
            <StyledWidgetTitle data-loading>
                Overall health rating
            </StyledWidgetTitle>
            <StyledParagraphEmphasizedText data-loading>
                {health}%
            </StyledParagraphEmphasizedText>
            <StyledLink data-loading to={`/projects/${projectId}/health`}>
                <StyledSpanLinkText data-loading>view more </StyledSpanLinkText>
                <StyledArrowIcon data-loading />
            </StyledLink>
        </StyledProjectInfoWidgetContainer>
    );
};
