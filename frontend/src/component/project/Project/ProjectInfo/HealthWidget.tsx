import { Box, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { flexRow } from 'themes/themeStyles';
import {
    StyledArrowIcon,
    StyledProjectInfoWidgetContainer,
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

export const StyledParagraphEmphasizedText = styled('p')(({ theme }) => ({
    fontSize: '1.5rem',
    [theme.breakpoints.down('md')]: {
        fontSize: theme.fontSizes.bodySize,
        marginBottom: theme.spacing(4),
    },
}));

export const StyledDivPercentageContainer = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

export const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    ...flexRow,
    justifyContent: 'center',
    color: theme.palette.primary.main,
    [theme.breakpoints.down('md')]: {
        position: 'absolute',
        bottom: theme.spacing(1.5),
    },
}));

export const HealthWidget = ({ projectId, health }: IHealthWidgetProps) => {
    const { uiConfig } = useUiConfig();

    if (uiConfig?.flags?.newProjectOverview) {
        return (
            <StyledProjectInfoWidgetContainer>
                <StyledWidgetTitle data-loading>
                    Project health
                </StyledWidgetTitle>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: theme => theme.spacing(2),
                    }}
                >
                    <StyledDivPercentageContainer>
                        <PercentageCircle percentage={health} />
                    </StyledDivPercentageContainer>
                    <StyledParagraphEmphasizedText data-loading>
                        {health}%
                    </StyledParagraphEmphasizedText>
                </Box>
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
            <Typography data-loading>Overall health rating</Typography>
            <Box sx={{ marginBottom: theme => theme.spacing(2.5) }}>
                <StyledParagraphEmphasizedText data-loading>
                    {health}%
                </StyledParagraphEmphasizedText>
            </Box>
            <StyledLink data-loading to={`/projects/${projectId}/health`}>
                <StyledSpanLinkText data-loading>view more </StyledSpanLinkText>
                <StyledArrowIcon data-loading />
            </StyledLink>
        </StyledProjectInfoWidgetContainer>
    );
};
