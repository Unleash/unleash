import { lazy, type ReactNode, Suspense, useContext, useState } from 'react';
import {
    Badge,
    Box,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { lighten } from '@mui/material/styles';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import SlackIcon from 'assets/icons/menu/slack.svg?react';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LearningLabIcon from 'assets/icons/menu/learning-lab.svg?react';
import { HelpMenuHint } from './HelpMenuHint.tsx';
import { HelpMenuAnnouncement } from './HelpMenuAnnouncement.tsx';
import { useHelpButtonHint } from './HelpButtonHintContext.tsx';
import {
    relocationHintCampaignOver,
    useHelpMenuRelocationHint,
} from './useHelpMenuRelocationHint.ts';
import { FloatingOnboardingChecklistContext } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistContext.tsx';
import { useOnboardingChecklistVisibility } from 'component/onboarding/floatingChecklist/useOnboardingChecklistVisibility.ts';
import { OnboardingProgressBadge } from 'component/onboarding/floatingChecklist/OnboardingProgressBadge.tsx';
import { Link } from 'react-router';
import { useFeedback } from 'component/feedbackNew/useFeedback';
import { useTracking } from 'hooks/useTracking';
import {
    openHelpMenuTracking,
    selectHelpResourceTracking,
} from './helpResourcesTracking.ts';
import { useUiFlag } from 'hooks/useUiFlag';
import { useVariant } from 'hooks/useVariant';
import { useIntro } from 'component/onboarding/intro/IntroProvider.tsx';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/storage.ts';
import { searchDocsTracking } from '../SearchDocs/searchDocsTracking.ts';

const LazySearchDocsChat = lazy(() =>
    import('../SearchDocs/SearchDocs.tsx').then((module) => ({
        default: module.SearchDocsChat,
    })),
);

const RELOCATION_DOT_SEEN_KEY = 'help-menu-relocation:menu-opened:v1';

const StyledIconButton = styled(IconButton)<{ open?: boolean }>(
    ({ theme, open }) => ({
        color: open ? theme.palette.primary.main : undefined,
    }),
);

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: theme.palette.primary.main,
        right: theme.spacing(1.4),
        top: theme.spacing(1.1),
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        width: theme.spacing(40),
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
}));

interface AnchorMenuItemProps {
    component?: React.ElementType;
    href?: string;
    target?: string;
    rel?: string;
    to?: string;
}

const StyledVisitLink = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color:
        theme.mode === 'dark'
            ? theme.palette.primary.main
            : theme.palette.primary.containerBorder,
    '& svg': {
        color:
            theme.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.primary.containerBorder,
    },
}));

const StyledFeaturedMenuItem = styled(MenuItem)<AnchorMenuItemProps>(
    ({ theme }) => ({
        margin: theme.spacing(1, 1, 1, 1.125),
        padding: theme.spacing(1.5, 2),
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
        backgroundColor: theme.palette.web.main,
        color: theme.palette.common.white,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
        '&:hover': {
            backgroundColor: lighten(theme.palette.web.main, 0.1),
            [`& ${StyledVisitLink}`]: { textDecoration: 'underline' },
        },
        '&.Mui-focusVisible': {
            backgroundColor: lighten(theme.palette.web.main, 0.1),
        },
    }),
);

const StyledPortalTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.common.white,
    fontWeight: 700,
}));

const StyledBoldText = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledDimText = styled(Typography)(({ theme }) => ({
    color: theme.palette.web.contrastText,
    lineHeight: '105%',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
}));

const StyledLearningLabIcon = styled(LearningLabIcon)({
    width: '75px',
    height: '50px',
    flexShrink: 0,
});

const StyledLearningLabContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const IntroHintIcon = styled(ExploreOutlinedIcon)(({ theme }) => ({
    color: theme.palette.neutral.main,
    width: 18,
    height: 18,
    verticalAlign: 'bottom',
}));

const StyledMenuItem = styled(MenuItem)<AnchorMenuItemProps>(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2, 1, 1.125),
    alignSelf: 'stretch',
    '& svg': {
        color: theme.palette.neutral.main,
        width: 18,
        height: 18,
    },
}));

const DOCUMENTATION_URL = 'https://docs.getunleash.io/';
const GITHUB_URL = 'https://github.com/Unleash/unleash';
const SLACK_URL = 'https://slack.unleash.run/';
const LEARNING_LAB_URL = 'https://learning.getunleash.io/';

interface ILearningLabVariant {
    url?: string;
    title?: string;
    description?: string;
    visitLabel?: string;
    menuLabel?: string;
}

const LEARNING_LAB_DEFAULTS: Required<ILearningLabVariant> = {
    url: LEARNING_LAB_URL,
    title: 'Learning Lab',
    description:
        'Learn Unleash at your own pace. Watch short videos on FeatureOps, feature flags, and AI-native development.',
    visitLabel: 'Visit Learning Lab',
    menuLabel: 'Learning Lab',
};

type HelpResourcesTriggerProps = {
    ref: (element: HTMLElement | null) => void;
    open: boolean;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
};

const PLACEMENTS = {
    header: {
        hint: 'bottom-end',
        menu: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            transformOrigin: { vertical: 'top', horizontal: 'right' },
        },
    },
    sidebar: {
        hint: 'right-end',
        menu: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            transformOrigin: { vertical: 'bottom', horizontal: 'left' },
            marginThreshold: 8,
        },
    },
} as const;

interface IHelpResourcesProps {
    variant?: keyof typeof PLACEMENTS;
    renderTrigger?: (props: HelpResourcesTriggerProps) => ReactNode;
}

export const HelpResources = ({
    variant = 'header',
    renderTrigger,
}: IHelpResourcesProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [buttonEl, setButtonEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const trackOpenHelpMenu = useTracking(openHelpMenuTracking(variant));
    const trackSelectHelpResource = useTracking(
        selectHelpResourceTracking(variant),
    );
    const { open: openIntro } = useIntro();
    const learningLabFlag = useUiFlag('learningLab');
    const searchDocsWidget = useUiFlag('searchDocsWidget');
    const showSearchDocs = variant === 'sidebar' && searchDocsWidget;
    const [searchDocsOpen, setSearchDocsOpen] = useState(false);
    const learningLabVariant = useVariant<ILearningLabVariant>(
        learningLabFlag || undefined,
    );

    const learningLabUrl = learningLabVariant?.url ?? LEARNING_LAB_DEFAULTS.url;
    const learningLabTitle =
        learningLabVariant?.title ?? LEARNING_LAB_DEFAULTS.title;
    const learningLabDescription =
        learningLabVariant?.description ?? LEARNING_LAB_DEFAULTS.description;
    const learningLabVisitLabel =
        learningLabVariant?.visitLabel ?? LEARNING_LAB_DEFAULTS.visitLabel;
    const learningLabMenuLabel =
        learningLabVariant?.menuLabel ?? LEARNING_LAB_DEFAULTS.menuLabel;

    const floatingOnboardingChecklist = useContext(
        FloatingOnboardingChecklistContext,
    );
    const checklistVisibility = useOnboardingChecklistVisibility();
    const showGetStarted = Boolean(
        floatingOnboardingChecklist && checklistVisibility === 'visible',
    );

    const {
        activeHint,
        showHint: showHelpButtonHint,
        dismissHint: dismissHelpButtonHint,
        closeHint: closeHelpButtonHint,
        isHintSeen,
        markHintSeen,
    } = useHelpButtonHint();
    const hintOpen = activeHint !== null;
    const hintHighlightsButton = hintOpen && activeHint !== 'menu-regroup';

    useHelpMenuRelocationHint();
    const relocationHintEnabled = useUiFlag('helpMenuRelocationHint');
    const [relocationDotSeen, setRelocationDotSeen] = useState(() =>
        Boolean(getLocalStorageItem<boolean>(RELOCATION_DOT_SEEN_KEY)),
    );
    const showRelocationDot =
        relocationHintEnabled &&
        !relocationDotSeen &&
        !relocationHintCampaignOver();

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
        if (hintOpen) dismissHelpButtonHint();
        if (!relocationDotSeen) {
            setLocalStorageItem(RELOCATION_DOT_SEEN_KEY, true);
            setRelocationDotSeen(true);
        }
        if (!isHintSeen('menu-regroup')) markHintSeen('menu-regroup');
        trackOpenHelpMenu('succeeded');
    };

    const handleClose = () => setAnchorEl(null);

    const handleOptionClick = (option: string) => {
        trackSelectHelpResource('succeeded', { option });
        handleClose();
    };

    const handleGetStarted = () => {
        handleOptionClick('get-started');
        floatingOnboardingChecklist?.open();
    };

    const handleSearchDocs = () => {
        handleOptionClick('search-docs');
        setSearchDocsOpen(true);
    };

    const { openFeedback } = useFeedback('general', 'automatic');

    const handleGiveFeedback = () => {
        handleOptionClick('give-feedback');
        openFeedback({
            title: 'How would you rate your overall experience with Unleash?',
            positiveLabel: "What's working well for you in Unleash?",
            areasForImprovementsLabel:
                'What could be improved to make Unleash work better for you? ',
        });
    };

    const featuredLearningLabItem = (
        <StyledFeaturedMenuItem
            key='learning-lab-featured'
            component='a'
            href={learningLabUrl}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => handleOptionClick('learning-lab-featured')}
            disableGutters
        >
            <StyledLearningLabIcon />
            <StyledLearningLabContent>
                <StyledPortalTitle variant='subtitle2'>
                    {learningLabTitle}
                </StyledPortalTitle>
                <StyledDimText variant='body2'>
                    {learningLabDescription}
                </StyledDimText>
                <StyledVisitLink>
                    <StyledBoldText variant='body2' color='inherit'>
                        {learningLabVisitLabel}
                    </StyledBoldText>
                    <ArrowForwardIcon fontSize='small' />
                </StyledVisitLink>
            </StyledLearningLabContent>
        </StyledFeaturedMenuItem>
    );

    const getStartedItem = showGetStarted ? (
        <StyledMenuItem key='get-started' onClick={handleGetStarted}>
            <RocketLaunchOutlinedIcon fontSize='small' />
            Get started
            <Box sx={{ flexGrow: 1 }} />
            <OnboardingProgressBadge />
        </StyledMenuItem>
    ) : null;

    const whatsNewItem = (
        <StyledMenuItem
            key='whats-new'
            component={Link}
            to='/whats-new'
            onClick={() => handleOptionClick('whats-new')}
        >
            <NewReleasesOutlinedIcon fontSize='small' />
            What's new
        </StyledMenuItem>
    );

    const introItem = (
        <StyledMenuItem
            key='quick-tour'
            onClick={() => {
                handleOptionClick('quick-tour');
                openIntro({
                    onExited: () => showHelpButtonHint('intro-closed'),
                });
            }}
            data-testid='QUICK_TOUR_BUTTON'
        >
            <ExploreOutlinedIcon fontSize='small' />
            Unleash Intro
        </StyledMenuItem>
    );

    const searchDocsItem = showSearchDocs ? (
        <StyledMenuItem key='search-docs' onClick={handleSearchDocs}>
            <AutoAwesomeIcon fontSize='small' />
            Search docs
        </StyledMenuItem>
    ) : null;

    const documentationItem = (
        <StyledMenuItem
            key='documentation'
            component='a'
            href={DOCUMENTATION_URL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => handleOptionClick('documentation')}
        >
            <MenuBookIcon fontSize='small' />
            Documentation
        </StyledMenuItem>
    );

    const learningLabItem = (
        <StyledMenuItem
            key='learning-lab'
            component='a'
            href={learningLabUrl}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => handleOptionClick('learning-lab')}
        >
            <SchoolOutlinedIcon fontSize='small' />
            {learningLabMenuLabel}
        </StyledMenuItem>
    );

    const githubItem = (
        <StyledMenuItem
            key='github'
            component='a'
            href={GITHUB_URL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => handleOptionClick('github')}
        >
            <GitHubIcon fontSize='small' />
            GitHub
        </StyledMenuItem>
    );

    const giveFeedbackItem = (
        <StyledMenuItem key='give-feedback' onClick={handleGiveFeedback}>
            <ChatOutlinedIcon fontSize='small' />
            Give feedback
        </StyledMenuItem>
    );

    const slackItem = (
        <StyledMenuItem
            key='slack'
            component='a'
            href={SLACK_URL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => handleOptionClick('slack')}
        >
            <SlackIcon />
            Slack community
        </StyledMenuItem>
    );

    return (
        <>
            {renderTrigger ? (
                renderTrigger({ ref: setButtonEl, open, onClick: handleOpen })
            ) : (
                <Tooltip title='Help & Resources' arrow>
                    <StyledBadge
                        color='primary'
                        variant='dot'
                        overlap='circular'
                        invisible={!showRelocationDot}
                    >
                        <StyledIconButton
                            ref={setButtonEl}
                            size='large'
                            open={open || hintHighlightsButton}
                            onClick={handleOpen}
                            aria-haspopup='true'
                            aria-expanded={open}
                            aria-label='Help and resources'
                        >
                            <HelpOutlineOutlinedIcon />
                        </StyledIconButton>
                    </StyledBadge>
                </Tooltip>
            )}
            <HelpMenuAnnouncement
                open={activeHint === 'menu-regroup'}
                anchorEl={buttonEl}
                onDismiss={dismissHelpButtonHint}
                onClose={closeHelpButtonHint}
            />
            <HelpMenuHint
                open={activeHint === 'get-started'}
                anchorEl={buttonEl}
                placement={PLACEMENTS[variant].hint}
                onClose={dismissHelpButtonHint}
            >
                You can reopen the Get started checklist from here anytime
            </HelpMenuHint>
            <HelpMenuHint
                open={activeHint === 'intro-closed'}
                anchorEl={buttonEl}
                placement={PLACEMENTS[variant].hint}
                onClose={dismissHelpButtonHint}
            >
                You can restart the <IntroHintIcon /> Unleash Intro from here
                anytime
            </HelpMenuHint>
            <StyledMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                {...PLACEMENTS[variant].menu}
            >
                {variant === 'sidebar'
                    ? [
                          featuredLearningLabItem,
                          getStartedItem,
                          introItem,
                          <Divider key='divider-learn' />,
                          searchDocsItem,
                          documentationItem,
                          learningLabItem,
                          whatsNewItem,
                          <Divider key='divider-community' />,
                          githubItem,
                          slackItem,
                          giveFeedbackItem,
                      ]
                    : [
                          featuredLearningLabItem,
                          getStartedItem,
                          whatsNewItem,
                          introItem,
                          documentationItem,
                          learningLabItem,
                          githubItem,
                          giveFeedbackItem,
                          slackItem,
                      ]}
            </StyledMenu>
            {showSearchDocs && (
                <Suspense fallback={null}>
                    <LazySearchDocsChat
                        open={searchDocsOpen}
                        onOpenChange={setSearchDocsOpen}
                        tracking={searchDocsTracking('help-menu')}
                    />
                </Suspense>
            )}
        </>
    );
};
