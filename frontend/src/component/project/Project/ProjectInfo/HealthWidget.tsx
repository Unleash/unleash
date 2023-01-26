import {
    StyledArrowIcon,
    StyledCount,
    StyledDivInfoContainer,
    StyledDivPercentageContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledParagraphSubtitle,
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
            <StyledDivInfoContainer>
                <StyledParagraphSubtitle data-loading>
                    Project health
                </StyledParagraphSubtitle>
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
            </StyledDivInfoContainer>
        );
    }

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
