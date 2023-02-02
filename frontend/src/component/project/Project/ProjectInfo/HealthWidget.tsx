import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import {
    StyledArrowIcon,
    StyledProjectInfoWidgetContainer,
    StyledDivPercentageContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledWidgetTitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import { WidgetFooterLink } from './WidgetFooterLink';

interface IHealthWidgetProps {
    projectId: string;
    health: number;
    total?: number;
    stale?: number;
}

export const HealthWidget = ({ projectId, health }: IHealthWidgetProps) => {
    const { uiConfig } = useUiConfig();

    if (uiConfig?.flags?.newProjectOverview) {
        return (
            <StyledProjectInfoWidgetContainer>
                <StyledWidgetTitle data-loading>
                    Project health
                </StyledWidgetTitle>
                <StyledDivPercentageContainer>
                    <PercentageCircle percentage={health} />
                </StyledDivPercentageContainer>
                <StyledParagraphEmphasizedText data-loading>
                    {health}%
                </StyledParagraphEmphasizedText>
                <WidgetFooterLink to={`/projects/${projectId}/health`}>
                    View project health
                </WidgetFooterLink>
            </StyledProjectInfoWidgetContainer>
        );
    }

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
