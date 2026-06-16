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

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    borderRadius: 100,
    '&:focus-visible': {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineColor: theme.palette.primary.main,
        borderRadius: '100%',
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        width: theme.spacing(40),
        borderRadius: `${theme.shape.borderRadiusSmall}px`,
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
const LEARNING_LAB_URL = 'https://docs.getunleash.io/';

const EVENT_NAME = 'help-resources';

type LinkItem = {
    name: string;
    url: string;
    icon: React.ReactNode;
    label: string;
};

type ActionItem = {
    name: string;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
};

type HelpItem = LinkItem | ActionItem;

export const HelpResources = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const { trackEvent } = useEventTracker();

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
        trackEvent(EVENT_NAME, { props: { eventType: 'opened' } });
    };

    const handleClose = () => setAnchorEl(null);

    const handleOptionClick = (option: string) => {
        trackEvent(EVENT_NAME, { props: { eventType: 'click', option } });
        handleClose();
    };

    const { openFeedback } = useFeedback('general', 'automatic');

    const helpItems: HelpItem[] = [
        {
            name: 'documentation',
            url: DOCUMENTATION_URL,
            icon: <MenuBookIcon fontSize='small' />,
            label: 'Documentation',
        },
        {
            name: 'learning-lab',
            url: LEARNING_LAB_URL,
            icon: <SchoolOutlinedIcon fontSize='small' />,
            label: 'Learning Lab',
        },
        {
            name: 'github',
            url: GITHUB_URL,
            icon: <GitHubIcon fontSize='small' />,
            label: 'GitHub',
        },
        {
            name: 'give-feedback',
            onClick: () =>
                openFeedback({
                    title: 'How easy is it to use Unleash?',
                    positiveLabel: 'What do you like most about Unleash?',
                    areasForImprovementsLabel:
                        'What should be improved in Unleash?',
                }),
            icon: <ChatOutlinedIcon fontSize='small' />,
            label: 'Give feedback',
        },
        {
            name: 'slack',
            url: SLACK_URL,
            icon: <SlackIcon />,
            label: 'Slack community',
        },
    ];

    return (
        <>
            <Tooltip title='Help & Resources' arrow>
                <StyledIconButton
                    size='large'
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
                    href={LEARNING_LAB_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => handleOptionClick('learning-lab-featured')}
                    disableGutters
                >
                    <StyledLearningLabIcon />
                    <StyledLearningLabContent>
                        <StyledPortalTitle variant='subtitle2'>
                            Learning Lab
                        </StyledPortalTitle>
                        <StyledDimText variant='body2'>
                            Learn Unleash at your own pace. Watch short videos
                            on FeatureOps, feature flags, and AI-native
                            development.
                        </StyledDimText>
                        <StyledVisitLink>
                            <StyledBoldText variant='body2' color='inherit'>
                                Visit Learning Lab
                            </StyledBoldText>
                            <ArrowForwardIcon fontSize='small' />
                        </StyledVisitLink>
                    </StyledLearningLabContent>
                </StyledFeaturedMenuItem>
                {helpItems.map((item) =>
                    'url' in item ? (
                        <StyledMenuItem
                            key={item.name}
                            component='a'
                            href={item.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={() => handleOptionClick(item.name)}
                        >
                            {item.icon}
                            {item.label}
                        </StyledMenuItem>
                    ) : (
                        <StyledMenuItem
                            key={item.name}
                            onClick={() => {
                                handleOptionClick(item.name);
                                item.onClick();
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </StyledMenuItem>
                    ),
                )}
            </StyledMenu>
        </>
    );
};
