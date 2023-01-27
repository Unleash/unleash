import {
    StyledArrowIcon,
    StyledCount,
    StyledProjectInfoWidgetContainer,
    StyledDivPercentageContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledWidgetTitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Box, styled, Typography } from '@mui/material';

interface IHealthWidgetProps {
    projectId: string;
    health: number;
    total?: number;
    stale?: number;
}

const StyledWarning = styled('span')<{ active?: boolean }>(
    ({ theme, active }) => ({
        color: active ? theme.palette.warning.dark : 'inherit',
    })
);

export const HealthWidget = ({
    projectId,
    health,
    total,
    stale,
}: IHealthWidgetProps) => {
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
                <Typography data-loading>
                    <StyledCount>{total}</StyledCount> toggles in total
                </Typography>
                <Typography data-loading sx={{ marginBottom: 2 }}>
                    <StyledCount>
                        <StyledWarning active={Boolean(stale)}>
                            {stale}
                        </StyledWarning>
                    </StyledCount>{' '}
                    <StyledWarning active={Boolean(stale)}>
                        potentially stale
                    </StyledWarning>
                </Typography>
                <StyledLink data-loading to={`/projects/${projectId}/health`}>
                    <StyledSpanLinkText data-loading>
                        View project health
                    </StyledSpanLinkText>
                </StyledLink>
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
