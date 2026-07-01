import { useState } from 'react';
import {
    Box,
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
import LearningLabIcon from 'assets/icons/menu/learning-lab.svg?react';
import { useFeedback } from 'component/feedbackNew/useFeedback';
import { useEventTracker } from 'hooks/useEventTracker';
import { useUiFlag } from 'hooks/useUiFlag';
import { useVariant } from 'hooks/useVariant';

const StyledIconButton = styled(IconButton)<{ open?: boolean }>(
    ({ theme, open }) => ({
        color: open ? theme.palette.primary.main : undefined,
        '&:focus-visible': {
            outlineStyle: 'solid',
            outlineWidth: theme.spacing(0.5),
            outlineColor: theme.palette.primary.main,
        },
    }),
);

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
}

const StyledVisitLink = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color:
        theme.mode === 'dark'
            ? theme.palette.primary.main
            : theme.palette.secondary.border,
    '& svg': {
        color:
            theme.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.secondary.border,
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

const EVENT_NAME = 'help-resources';

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

export const HelpResources = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const { trackEvent } = useEventTracker();
    const learningLabFlag = useUiFlag('learningLab');
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
    const variant = learningLabFlag ? learningLabFlag.name : 'default';

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
        trackEvent(EVENT_NAME, {
            props: {
                eventType: 'opened',
                variant,
            },
        });
    };

    const handleClose = () => setAnchorEl(null);

    const handleOptionClick = (option: string) => {
        trackEvent(EVENT_NAME, {
            props: {
                eventType: 'click',
                option,
                variant,
            },
        });
        handleClose();
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

    return (
        <>
            <Tooltip title='Help & Resources' arrow>
                <StyledIconButton
                    size='large'
                    open={open}
                    onClick={handleOpen}
                    aria-haspopup='true'
                    aria-expanded={open}
                    aria-label='Help and resources'
                >
                    <HelpOutlineOutlinedIcon />
                </StyledIconButton>
            </Tooltip>
            <StyledMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <StyledFeaturedMenuItem
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
                <StyledMenuItem
                    component='a'
                    href={DOCUMENTATION_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => handleOptionClick('documentation')}
                >
                    <MenuBookIcon fontSize='small' />
                    Documentation
                </StyledMenuItem>
                <StyledMenuItem
                    component='a'
                    href={learningLabUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => handleOptionClick('learning-lab')}
                >
                    <SchoolOutlinedIcon fontSize='small' />
                    {learningLabMenuLabel}
                </StyledMenuItem>
                <StyledMenuItem
                    component='a'
                    href={GITHUB_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => handleOptionClick('github')}
                >
                    <GitHubIcon fontSize='small' />
                    GitHub
                </StyledMenuItem>
                <StyledMenuItem onClick={handleGiveFeedback}>
                    <ChatOutlinedIcon fontSize='small' />
                    Give feedback
                </StyledMenuItem>
                <StyledMenuItem
                    component='a'
                    href={SLACK_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => handleOptionClick('slack')}
                >
                    <SlackIcon />
                    Slack community
                </StyledMenuItem>
            </StyledMenu>
        </>
    );
};
