import {
    StyledArrowIcon,
    StyledDivInfoContainer,
    StyledDivPercentageContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledParagraphSubtitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import PercentageCircle from 'common/PercentageCircle/PercentageCircle';

interface IHealthWidgetProps {
    projectId: string;
    health: number;
}
export const HealthWidget = ({ projectId, health }: IHealthWidgetProps) => {
    return (
        <StyledDivInfoContainer>
            <StyledDivPercentageContainer>
                <PercentageCircle percentage={health} />
            </StyledDivPercentageContainer>
            <StyledParagraphSubtitle data-loading>
                Overall health rating
            </StyledParagraphSubtitle>
            <StyledParagraphEmphasizedText data-loading>
                {health}%
            </StyledParagraphEmphasizedText>
            <StyledLink data-loading to={`/projects/${projectId}/health`}>
                <StyledSpanLinkText data-loading>view more </StyledSpanLinkText>
                <StyledArrowIcon data-loading />
            </StyledLink>
        </StyledDivInfoContainer>
    );
};
