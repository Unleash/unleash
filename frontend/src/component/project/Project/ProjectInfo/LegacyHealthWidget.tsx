import { Box, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { flexRow } from 'themes/themeStyles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { StyledProjectInfoWidgetContainer } from './ProjectInfo.styles';

interface ILegacyHealthWidgetProps {
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

const StyledDivPercentageContainer = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    ...flexRow,
    justifyContent: 'center',
    color: theme.palette.primary.main,
    [theme.breakpoints.down('md')]: {
        position: 'absolute',
        bottom: theme.spacing(1.5),
        right: theme.spacing(1.5),
    },
}));

const StyledSpanLinkText = styled('p')(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledArrowIcon = styled(ArrowForwardIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
}));

/**
 * @deprecated
 */
export const LegacyHealthWidget = ({
    projectId,
    health,
}: ILegacyHealthWidgetProps) => (
    <StyledProjectInfoWidgetContainer>
        <StyledDivPercentageContainer>
            <PercentageCircle percentage={health} />
        </StyledDivPercentageContainer>
        <Typography data-loading sx={{ marginTop: theme => theme.spacing(2) }}>
            Overall health rating
        </Typography>
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
