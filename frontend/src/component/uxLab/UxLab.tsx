import { type FC, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    keyframes,
    LinearProgress,
    styled,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { usePageTitle } from 'hooks/usePageTitle';

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

const slideIn = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(5),
    padding: theme.spacing(4),
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    animation: `${slideIn} 0.4s ease-out`,
}));

const HeroBanner = styled(Box)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(5, 4),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -60,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: alpha(theme.palette.common.white, 0.08),
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -40,
        left: '30%',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: alpha(theme.palette.common.white, 0.05),
    },
}));

const HeroContent = styled(Box)({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
});

const HeroTitle = styled(Typography)({
    fontWeight: 800,
    fontSize: '2rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
});

const HeroSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    opacity: 0.9,
    maxWidth: 600,
    lineHeight: 1.6,
}));

const HeroActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    flexWrap: 'wrap',
}));

const HeroButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 3),
    fontWeight: 700,
    textTransform: 'none',
    fontSize: theme.fontSizes.bodySize,
}));

const FloatingIcon = styled(Box)({
    position: 'absolute',
    right: 40,
    top: '50%',
    transform: 'translateY(-50%)',
    animation: `${float} 3s ease-in-out infinite`,
    opacity: 0.2,
    fontSize: 120,
    display: 'flex',
    '@media (max-width: 800px)': {
        display: 'none',
    },
});

const SectionTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2.5),
}));

const CardsGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: theme.spacing(2.5),
}));

const StyledCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'accentColor',
})<{ accentColor: string }>(({ theme, accentColor }) => ({
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    transition: 'all 0.25s ease',
    position: 'relative',
    overflow: 'visible',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        borderRadius: `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0`,
        background: accentColor,
    },
    '&:hover': {
        borderColor: accentColor,
        boxShadow: `0 4px 20px ${alpha(accentColor, 0.15)}`,
        transform: 'translateY(-2px)',
    },
}));

const CardIconWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'accentColor',
})<{ accentColor: string }>(({ theme, accentColor }) => ({
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: alpha(accentColor, 0.1),
    color: accentColor,
    flexShrink: 0,
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
    const colors: Record<string, { bg: string; text: string }> = {
        'In progress': {
            bg: alpha(theme.palette.warning.main, 0.12),
            text: theme.palette.warning.dark,
        },
        'Coming soon': {
            bg: alpha(theme.palette.info.main, 0.12),
            text: theme.palette.info.dark,
        },
        Exploring: {
            bg: alpha(theme.palette.secondary.main, 0.12),
            text: theme.palette.secondary.dark,
        },
    };
    const color = colors[status] || {
        bg: theme.palette.grey[100],
        text: theme.palette.grey[700],
    };
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 700,
        fontSize: theme.fontSizes.smallerBody,
        borderRadius: 20,
    };
});

const VoteChip = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'voted',
})<{ voted: boolean }>(({ theme, voted }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 20,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: theme.fontSizes.smallBody,
    transition: 'all 0.2s ease',
    border: `1.5px solid ${voted ? theme.palette.primary.main : theme.palette.divider}`,
    backgroundColor: voted
        ? alpha(theme.palette.primary.main, 0.08)
        : 'transparent',
    color: voted ? theme.palette.primary.main : theme.palette.text.secondary,
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        color: theme.palette.primary.main,
    },
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    paddingLeft: theme.spacing(4),
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 15,
        top: 8,
        bottom: 8,
        width: 2,
        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.1)})`,
        borderRadius: 1,
    },
}));

const TimelineItem = styled(Box)(({ theme }) => ({
    position: 'relative',
    paddingBottom: theme.spacing(3),
    '&:last-child': {
        paddingBottom: 0,
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        left: -25,
        top: 8,
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: theme.palette.primary.main,
        border: `2px solid ${theme.palette.background.paper}`,
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
}));

const TimelineDate = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
}));

const TimelineTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    fontSize: theme.fontSizes.bodySize,
    marginTop: 2,
}));

const TimelineDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: 4,
    lineHeight: 1.5,
}));

const TagChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'tagType',
})<{ tagType: string }>(({ theme, tagType }) => {
    const variants: Record<string, { bg: string; text: string }> = {
        'New feature': {
            bg: alpha(theme.palette.success.main, 0.1),
            text: theme.palette.success.dark,
        },
        Beta: {
            bg: alpha(theme.palette.info.main, 0.1),
            text: theme.palette.info.dark,
        },
        Improvement: {
            bg: alpha(theme.palette.warning.main, 0.1),
            text: theme.palette.warning.dark,
        },
    };
    const variant = variants[tagType] || {
        bg: theme.palette.grey[100],
        text: theme.palette.grey[700],
    };
    return {
        backgroundColor: variant.bg,
        color: variant.text,
        fontWeight: 700,
        fontSize: 11,
        height: 22,
        borderRadius: 6,
    };
});

const ProgressRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
    flexGrow: 1,
    borderRadius: 4,
    height: 8,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '& .MuiLinearProgress-bar': {
        borderRadius: 4,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
}));

interface LabItem {
    id: string;
    title: string;
    description: string;
    status: string;
    votes: number;
    details: string;
    icon: FC<{ fontSize?: 'small' | 'medium' | 'large' }>;
    color: string;
}

interface ChangelogEntry {
    date: string;
    title: string;
    description: string;
    tag: string;
}

const labItems: LabItem[] = [
    {
        id: 'improved-flag-overview',
        title: 'Improved flag overview',
        description:
            'A redesigned flag overview with better filtering, grouping, and quick actions to help you manage flags at scale.',
        status: 'In progress',
        votes: 24,
        details:
            'We are rethinking how you browse and manage feature flags. The new overview will support saved views, bulk operations, and a more informative table layout with lifecycle indicators. We expect to ship the first iteration in the coming weeks.',
        icon: FlagOutlinedIcon,
        color: '#6C47FF',
    },
    {
        id: 'project-health-dashboard',
        title: 'Project health dashboard',
        description:
            'A birds-eye view of flag hygiene, stale flags, and adoption metrics per project.',
        status: 'In progress',
        votes: 18,
        details:
            'This dashboard will combine flag lifecycle data, staleness indicators, and team activity into a single view. The goal is to help project leads understand the health of their feature flags without digging into individual flags.',
        icon: DashboardOutlinedIcon,
        color: '#0091EA',
    },
    {
        id: 'change-request-improvements',
        title: 'Change request workflow',
        description:
            'Streamlined change requests with inline editing, better diff views, and faster approval flows.',
        status: 'Coming soon',
        votes: 31,
        details:
            'Based on feedback from enterprise users, we are redesigning the change request flow. Key improvements include inline strategy editing within the review view, a clearer diff visualization, and the ability to batch-approve related changes.',
        icon: FactCheckOutlinedIcon,
        color: '#00BFA5',
    },
    {
        id: 'onboarding-redesign',
        title: 'Onboarding experience redesign',
        description:
            'A guided flow that helps new users create their first flag, connect an SDK, and see results in minutes.',
        status: 'Exploring',
        votes: 12,
        details:
            'We are exploring how to reduce time-to-first-flag for new users. Ideas include an interactive setup wizard, pre-configured demo projects, and contextual tooltips throughout the UI.',
        icon: SchoolOutlinedIcon,
        color: '#FF6D00',
    },
];

const changelogEntries: ChangelogEntry[] = [
    {
        date: 'Mar 14, 2026',
        title: 'Release plan templates',
        description:
            'Create reusable release plan templates to standardize how your team rolls out features across environments.',
        tag: 'New feature',
    },
    {
        date: 'Mar 10, 2026',
        title: 'Impact metrics (beta)',
        description:
            'Measure the real-world impact of your feature flags with built-in metrics tracking and visualization.',
        tag: 'Beta',
    },
    {
        date: 'Mar 5, 2026',
        title: 'Improved search performance',
        description:
            'Flag search is now up to 3x faster with better relevance ranking and support for partial matches.',
        tag: 'Improvement',
    },
    {
        date: 'Feb 28, 2026',
        title: 'Custom metrics',
        description:
            'Define and track custom counters tied to your feature flags for deeper observability.',
        tag: 'New feature',
    },
];

export const UxLab: FC = () => {
    usePageTitle('UX Lab');
    const [votes, setVotes] = useState<Record<string, boolean>>({});
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>(
        Object.fromEntries(labItems.map((item) => [item.id, item.votes])),
    );
    const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [suggestionOpen, setSuggestionOpen] = useState(false);
    const [suggestionText, setSuggestionText] = useState('');
    const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

    const handleVote = (id: string) => {
        const alreadyVoted = votes[id];
        setVotes((prev) => ({ ...prev, [id]: !alreadyVoted }));
        setVoteCounts((prev) => ({
            ...prev,
            [id]: alreadyVoted ? prev[id] - 1 : prev[id] + 1,
        }));
    };

    const handleSuggestionSubmit = () => {
        setSuggestionSubmitted(true);
        setSuggestionText('');
        setTimeout(() => {
            setSuggestionOpen(false);
            setSuggestionSubmitted(false);
        }, 2000);
    };

    const selectedItem = labItems.find((item) => item.id === detailsOpen);

    return (
        <PageContainer>
            {/* Hero banner */}
            <HeroBanner>
                <HeroContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                        <Typography
                            variant='overline'
                            sx={{ fontWeight: 700, letterSpacing: '0.1em' }}
                        >
                            UX Lab
                        </Typography>
                    </Box>
                    <HeroTitle>
                        Help us shape the future of Unleash
                    </HeroTitle>
                    <HeroSubtitle>
                        Peek behind the curtain at what our UX team is building
                        next. Vote on what excites you, book a session to share
                        your thoughts, or drop us a suggestion.
                    </HeroSubtitle>
                    <HeroActions>
                        <HeroButton
                            variant='contained'
                            color='inherit'
                            startIcon={<CalendarMonthOutlinedIcon />}
                            onClick={() => setBookingOpen(true)}
                            sx={{
                                backgroundColor: 'common.white',
                                color: 'primary.dark',
                                '&:hover': {
                                    backgroundColor: 'grey.100',
                                },
                            }}
                        >
                            Book a UX session
                        </HeroButton>
                        <HeroButton
                            variant='outlined'
                            startIcon={<LightbulbOutlinedIcon />}
                            onClick={() => setSuggestionOpen(true)}
                            sx={{
                                borderColor: 'rgba(255,255,255,0.5)',
                                color: 'common.white',
                                '&:hover': {
                                    borderColor: 'common.white',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            Leave a suggestion
                        </HeroButton>
                    </HeroActions>
                </HeroContent>
                <FloatingIcon>
                    <ScienceOutlinedIcon fontSize='inherit' />
                </FloatingIcon>
            </HeroBanner>

            {/* Current work section */}
            <Box>
                <SectionTitle>
                    <ExploreOutlinedIcon
                        color='primary'
                        sx={{ fontSize: 28 }}
                    />
                    <Typography
                        variant='h3'
                        sx={{
                            fontWeight: 800,
                            fontSize: '1.4rem',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        What we're working on
                    </Typography>
                    <Chip
                        icon={
                            <TrendingUpIcon
                                sx={{ fontSize: '14px !important' }}
                            />
                        }
                        label={`${labItems.length} active`}
                        size='small'
                        color='primary'
                        variant='outlined'
                        sx={{ fontWeight: 600, ml: 0.5 }}
                    />
                </SectionTitle>
                <CardsGrid>
                    {labItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <StyledCard
                                key={item.id}
                                accentColor={item.color}
                                sx={{
                                    animation: `${slideIn} 0.4s ease-out`,
                                    animationDelay: `${index * 0.08}s`,
                                    animationFillMode: 'backwards',
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1.5,
                                            mb: 1.5,
                                        }}
                                    >
                                        <CardIconWrapper
                                            accentColor={item.color}
                                        >
                                            <Icon fontSize='small' />
                                        </CardIconWrapper>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant='subtitle1'
                                                    sx={{
                                                        fontWeight: 700,
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>
                                                <StatusChip
                                                    label={item.status}
                                                    status={item.status}
                                                    size='small'
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Typography
                                        variant='body2'
                                        color='text.secondary'
                                        sx={{ lineHeight: 1.6 }}
                                    >
                                        {item.description}
                                    </Typography>
                                </CardContent>
                                <CardActions
                                    sx={{
                                        justifyContent: 'space-between',
                                        px: 2.5,
                                        pb: 2.5,
                                        pt: 0,
                                    }}
                                >
                                    <Tooltip
                                        title={
                                            votes[item.id]
                                                ? 'Remove your vote'
                                                : 'Vote for this'
                                        }
                                    >
                                        <VoteChip
                                            voted={Boolean(votes[item.id])}
                                            onClick={() =>
                                                handleVote(item.id)
                                            }
                                        >
                                            {votes[item.id] ? (
                                                <ThumbUpIcon
                                                    sx={{ fontSize: 16 }}
                                                />
                                            ) : (
                                                <ThumbUpOutlinedIcon
                                                    sx={{ fontSize: 16 }}
                                                />
                                            )}
                                            {voteCounts[item.id]}
                                        </VoteChip>
                                    </Tooltip>
                                    <Button
                                        size='small'
                                        endIcon={
                                            <ArrowForwardIcon
                                                sx={{ fontSize: '16px !important' }}
                                            />
                                        }
                                        onClick={() =>
                                            setDetailsOpen(item.id)
                                        }
                                        sx={{
                                            fontWeight: 600,
                                            borderRadius: 20,
                                        }}
                                    >
                                        Learn more
                                    </Button>
                                </CardActions>
                            </StyledCard>
                        );
                    })}
                </CardsGrid>
            </Box>

            {/* New in Unleash section */}
            <Box>
                <SectionTitle>
                    <RocketLaunchOutlinedIcon
                        color='primary'
                        sx={{ fontSize: 28 }}
                    />
                    <Typography
                        variant='h3'
                        sx={{
                            fontWeight: 800,
                            fontSize: '1.4rem',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        New in Unleash
                    </Typography>
                </SectionTitle>
                <TimelineContainer>
                    {changelogEntries.map((entry, index) => (
                        <TimelineItem
                            key={entry.title}
                            sx={{
                                animation: `${slideIn} 0.4s ease-out`,
                                animationDelay: `${0.3 + index * 0.1}s`,
                                animationFillMode: 'backwards',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <TimelineDate>{entry.date}</TimelineDate>
                                <TagChip
                                    label={entry.tag}
                                    tagType={entry.tag}
                                    size='small'
                                />
                            </Box>
                            <TimelineTitle>{entry.title}</TimelineTitle>
                            <TimelineDescription>
                                {entry.description}
                            </TimelineDescription>
                        </TimelineItem>
                    ))}
                </TimelineContainer>
            </Box>

            {/* Details dialog */}
            <Dialog
                open={Boolean(detailsOpen)}
                onClose={() => setDetailsOpen(null)}
                maxWidth='sm'
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'visible',
                    },
                }}
            >
                {selectedItem && (
                    <>
                        <Box
                            sx={{
                                height: 6,
                                background: selectedItem.color,
                                borderRadius: '12px 12px 0 0',
                            }}
                        />
                        <DialogTitle sx={{ pb: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                    }}
                                >
                                    <CardIconWrapper
                                        accentColor={selectedItem.color}
                                    >
                                        <selectedItem.icon fontSize='small' />
                                    </CardIconWrapper>
                                    <Typography
                                        variant='h6'
                                        fontWeight={700}
                                    >
                                        {selectedItem.title}
                                    </Typography>
                                </Box>
                                <StatusChip
                                    label={selectedItem.status}
                                    status={selectedItem.status}
                                    size='small'
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Typography
                                variant='body1'
                                sx={{ mb: 2, lineHeight: 1.7 }}
                            >
                                {selectedItem.details}
                            </Typography>
                            <ProgressRow>
                                <ThumbUpIcon
                                    sx={{
                                        fontSize: 18,
                                        color: 'primary.main',
                                    }}
                                />
                                <Typography
                                    variant='body2'
                                    sx={{ fontWeight: 700 }}
                                >
                                    {voteCounts[selectedItem.id]} votes
                                </Typography>
                                <StyledLinearProgress
                                    variant='determinate'
                                    value={Math.min(
                                        (voteCounts[selectedItem.id] / 50) *
                                            100,
                                        100,
                                    )}
                                />
                            </ProgressRow>
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5, pt: 0 }}>
                            <Button
                                onClick={() => setDetailsOpen(null)}
                                sx={{ borderRadius: 20 }}
                            >
                                Close
                            </Button>
                            <Button
                                variant='contained'
                                onClick={() => {
                                    handleVote(selectedItem.id);
                                    setDetailsOpen(null);
                                }}
                                sx={{ borderRadius: 20, fontWeight: 700 }}
                                startIcon={
                                    votes[selectedItem.id] ? (
                                        <ThumbUpIcon />
                                    ) : (
                                        <ThumbUpOutlinedIcon />
                                    )
                                }
                            >
                                {votes[selectedItem.id]
                                    ? 'Remove vote'
                                    : 'Vote for this'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Book a session dialog */}
            <Dialog
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
                maxWidth='sm'
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box
                    sx={{
                        height: 6,
                        background: (theme) =>
                            `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: '12px 12px 0 0',
                    }}
                />
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <CalendarMonthOutlinedIcon color='primary' />
                        Book a UX session
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant='body1' sx={{ mb: 2, lineHeight: 1.6 }}>
                        We'd love to hear from you! Book a 30-minute session
                        with our UX team to share feedback, discuss pain points,
                        or preview upcoming features.
                    </Typography>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                    >
                        Sessions are available Monday through Friday. After
                        booking, you'll receive a calendar invite with a video
                        call link.
                    </Typography>
                    <TextField
                        label='Your email'
                        fullWidth
                        sx={{ mt: 3 }}
                        placeholder='name@company.com'
                    />
                    <TextField
                        label='What would you like to discuss?'
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ mt: 2 }}
                        placeholder='Tell us briefly what topics you would like to cover...'
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button
                        onClick={() => setBookingOpen(false)}
                        sx={{ borderRadius: 20 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={() => setBookingOpen(false)}
                        sx={{ borderRadius: 20, fontWeight: 700 }}
                    >
                        Request session
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Suggestion dialog */}
            <Dialog
                open={suggestionOpen}
                onClose={() => {
                    setSuggestionOpen(false);
                    setSuggestionSubmitted(false);
                }}
                maxWidth='sm'
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box
                    sx={{
                        height: 6,
                        background: (theme) =>
                            `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.secondary.main})`,
                        borderRadius: '12px 12px 0 0',
                    }}
                />
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <LightbulbOutlinedIcon sx={{ color: 'warning.main' }} />
                        Leave a suggestion
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {suggestionSubmitted ? (
                        <Box
                            sx={{
                                py: 4,
                                textAlign: 'center',
                                animation: `${slideIn} 0.3s ease-out`,
                            }}
                        >
                            <AutoAwesomeIcon
                                sx={{
                                    fontSize: 48,
                                    color: 'primary.main',
                                    mb: 2,
                                    animation: `${pulse} 1.5s ease-in-out infinite`,
                                }}
                            />
                            <Typography variant='h6' fontWeight={700}>
                                Thank you!
                            </Typography>
                            <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ mt: 1 }}
                            >
                                We review all submissions and will follow up if
                                we need more details.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Typography
                                variant='body1'
                                sx={{ mb: 2, lineHeight: 1.6 }}
                            >
                                Have an idea for how we can improve Unleash?
                                We're all ears. Share your thoughts and help us
                                build a better product.
                            </Typography>
                            <TextField
                                label='Your suggestion'
                                fullWidth
                                multiline
                                rows={4}
                                value={suggestionText}
                                onChange={(e) =>
                                    setSuggestionText(e.target.value)
                                }
                                placeholder='Describe your idea or suggestion...'
                                sx={{ mt: 1 }}
                            />
                        </>
                    )}
                </DialogContent>
                {!suggestionSubmitted && (
                    <DialogActions sx={{ p: 2.5, pt: 0 }}>
                        <Button
                            onClick={() => {
                                setSuggestionOpen(false);
                                setSuggestionSubmitted(false);
                            }}
                            sx={{ borderRadius: 20 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            onClick={handleSuggestionSubmit}
                            disabled={!suggestionText.trim()}
                            sx={{ borderRadius: 20, fontWeight: 700 }}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </PageContainer>
    );
};
