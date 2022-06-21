import { Box, Paper, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ReactTimeAgo from 'react-timeago';
import { IProjectHealthReport } from 'interfaces/project';

const StyledBoxActive = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.success.dark,
    '& svg': {
        color: theme.palette.success.main,
    },
}));

const StyledBoxStale = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.warning.dark,
    '& svg': {
        color: theme.palette.warning.main,
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
}));

const StyledHeader = styled('h2')(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(1),
}));

const StyledHealthRating = styled('p')(({ theme }) => ({
    fontSize: '2rem',
    fontWeight: theme.fontWeight.bold,
}));

const StyledLastUpdated = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledList = styled('ul')(({ theme }) => ({
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    '& svg': {
        marginRight: theme.spacing(1),
    },
}));

const StyledAlignedItem = styled('p')(({ theme }) => ({
    marginLeft: theme.spacing(4),
}));

interface IReportCardProps {
    healthReport: IProjectHealthReport;
}

export const ReportCard = ({ healthReport }: IReportCardProps) => {
    const healthRatingColor =
        healthReport.health < 50
            ? 'error.main'
            : healthReport.health < 75
            ? 'warning.main'
            : 'success.main';

    const renderActiveToggles = () => (
        <StyledBoxActive>
            <CheckIcon />
            <span>{healthReport.activeCount} active toggles</span>
        </StyledBoxActive>
    );

    const renderStaleToggles = () => (
        <StyledBoxStale>
            <ReportProblemOutlinedIcon />
            <span>{healthReport.staleCount} stale toggles</span>
        </StyledBoxStale>
    );

    const renderPotentiallyStaleToggles = () => (
        <StyledBoxStale>
            <ReportProblemOutlinedIcon />
            <span>
                {healthReport.potentiallyStaleCount} potentially stale toggles
            </span>
        </StyledBoxStale>
    );

    return (
        <StyledPaper>
            <Box>
                <StyledHeader>Health rating</StyledHeader>
                <ConditionallyRender
                    condition={healthReport.health > -1}
                    show={
                        <>
                            <StyledHealthRating
                                sx={{ color: healthRatingColor }}
                            >
                                {healthReport.health}%
                            </StyledHealthRating>
                            <StyledLastUpdated>
                                Last updated:{' '}
                                <ReactTimeAgo
                                    date={healthReport.updatedAt}
                                    live={false}
                                />
                            </StyledLastUpdated>
                        </>
                    }
                />
            </Box>
            <Box>
                <StyledHeader>Toggle report</StyledHeader>
                <StyledList>
                    <li>
                        <ConditionallyRender
                            condition={Boolean(healthReport.activeCount)}
                            show={renderActiveToggles}
                        />
                    </li>
                    <ConditionallyRender
                        condition={Boolean(healthReport.activeCount)}
                        show={
                            <StyledAlignedItem>
                                Also includes potentially stale toggles.
                            </StyledAlignedItem>
                        }
                    />

                    <li>
                        <ConditionallyRender
                            condition={Boolean(healthReport.staleCount)}
                            show={renderStaleToggles}
                        />
                    </li>
                </StyledList>
            </Box>
            <Box>
                <StyledHeader>Potential actions</StyledHeader>
                <StyledList>
                    <li>
                        <ConditionallyRender
                            condition={Boolean(
                                healthReport.potentiallyStaleCount
                            )}
                            show={renderPotentiallyStaleToggles}
                        />
                    </li>
                </StyledList>
                <ConditionallyRender
                    condition={Boolean(healthReport.potentiallyStaleCount)}
                    show={
                        <StyledAlignedItem>
                            Review your feature toggles and delete unused
                            toggles.
                        </StyledAlignedItem>
                    }
                    elseShow={
                        <StyledAlignedItem>
                            No action is required
                        </StyledAlignedItem>
                    }
                />
            </Box>
        </StyledPaper>
    );
};
