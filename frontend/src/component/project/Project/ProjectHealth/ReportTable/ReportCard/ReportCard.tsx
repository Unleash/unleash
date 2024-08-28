import { Box, Link, Paper, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Link as RouterLink } from 'react-router-dom';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IProjectHealthReport } from 'interfaces/project';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';

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
    justifyItems: 'center',
    display: 'flex',
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
            <span>{healthReport.activeCount} active flags</span>
        </StyledBoxActive>
    );

    const renderStaleToggles = () => (
        <StyledBoxStale>
            <ReportProblemOutlinedIcon />
            <span>{healthReport.staleCount} stale flags</span>
        </StyledBoxStale>
    );

    const renderPotentiallyStaleToggles = () => (
        <StyledBoxStale>
            <ReportProblemOutlinedIcon />
            <span>
                {healthReport.potentiallyStaleCount} potentially stale flags
            </span>
        </StyledBoxStale>
    );

    const StalenessInfoIcon = () => (
        <HtmlTooltip
            title={
                <>
                    If your flag exceeds the expected lifetime of its flag type
                    it will be marked as potentially stale.
                    <Box sx={{ mt: 2 }}>
                        <a
                            href='https://docs.getunleash.io/reference/technical-debt#stale-and-potentially-stale-toggles'
                            target='_blank'
                            rel='noreferrer'
                        >
                            Read more in the documentation
                        </a>
                    </Box>
                </>
            }
        >
            <InfoOutlined
                sx={{ color: (theme) => theme.palette.text.secondary, ml: 1 }}
            />
        </HtmlTooltip>
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
                                <TimeAgo
                                    date={healthReport.updatedAt}
                                    refresh={false}
                                />
                            </StyledLastUpdated>
                        </>
                    }
                />
            </Box>
            <Box>
                <StyledHeader>Flag report</StyledHeader>
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
                                Also includes potentially stale flags.
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
            <Box sx={{ flexBasis: '40%' }}>
                <StyledHeader>
                    Potential actions{' '}
                    <span>
                        <StalenessInfoIcon />
                    </span>
                </StyledHeader>
                <StyledList>
                    <li>
                        <ConditionallyRender
                            condition={Boolean(
                                healthReport.potentiallyStaleCount,
                            )}
                            show={renderPotentiallyStaleToggles}
                        />
                    </li>
                </StyledList>
                <ConditionallyRender
                    condition={Boolean(healthReport.potentiallyStaleCount)}
                    show={
                        <>
                            <StyledAlignedItem>
                                Review your feature flags and delete unused
                                flags.
                            </StyledAlignedItem>
                            <Box sx={{ mt: 2 }}>
                                <Link
                                    component={RouterLink}
                                    to={'/feature-toggle-type'}
                                >
                                    Configure feature types lifetime
                                </Link>
                            </Box>
                        </>
                    }
                    elseShow={<span>No action is required</span>}
                />
            </Box>
        </StyledPaper>
    );
};
