import { Box, styled } from '@mui/material';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import {
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { WidgetFooterLink } from './WidgetFooterLink';

interface IHealthWidgetProps {
    projectId: string;
    health: number;
    total?: number;
    stale?: number;
}

const StyledParagraphEmphasizedText = styled('p')(({ theme }) => ({
    fontSize: '1.5rem',
    [theme.breakpoints.down('md')]: {
        fontSize: theme.fontSizes.bodySize,
        marginBottom: theme.spacing(4),
    },
}));

const StyledPercentageText = styled('p')(({ theme }) => ({
    fontSize: '1.5rem',
    [theme.breakpoints.down('md')]: {
        fontSize: theme.fontSizes.bodySize,
    },
}));

export const HealthWidget = ({ projectId, health }: IHealthWidgetProps) => {
    return (
        <StyledProjectInfoWidgetContainer>
            <StyledWidgetTitle data-loading>Project health</StyledWidgetTitle>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme => theme.spacing(2),
                }}
            >
                <StyledPercentageText>
                    <PercentageCircle percentage={health} />
                </StyledPercentageText>
                <StyledParagraphEmphasizedText data-loading>
                    {health}%
                </StyledParagraphEmphasizedText>
            </Box>
            <WidgetFooterLink to={`/projects/${projectId}/health`}>
                View project health
            </WidgetFooterLink>
        </StyledProjectInfoWidgetContainer>
    );
};
