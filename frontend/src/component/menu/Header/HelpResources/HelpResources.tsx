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
import GitHubIcon from '@mui/icons-material/GitHub';
import SlackIcon from 'assets/icons/menu/slack.svg?react';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LearningLabIcon from 'assets/icons/menu/learning-lab.svg?react';
import { useFeedback } from 'component/feedbackNew/useFeedback';

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
        minWidth: theme.spacing(36),
        maxWidth: theme.spacing(48),
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
        margin: theme.spacing(1, 1, 0.5),
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
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    '& svg': {
        color: theme.palette.neutral.main,
    },
}));

const DOCUMENTATION_URL = 'https://docs.getunleash.io/';
const GITHUB_URL = 'https://github.com/Unleash/unleash';
const SLACK_URL = 'https://slack.unleash.run/';
const LEARNING_LAB_URL = 'https://docs.getunleash.io/';

export const HelpResources = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const handleClose = () => setAnchorEl(null);

    const { openFeedback } = useFeedback('general', 'automatic');

    const handleGiveFeedback = () => {
        handleClose();
        openFeedback({
            title: 'How easy is it to use Unleash?',
            positiveLabel: 'What do you like most about Unleash?',
            areasForImprovementsLabel: 'What should be improved in Unleash?',
        });
    };

    return (
        <>
            <Tooltip title='Help & Resources' arrow>
                <StyledIconButton
                    size='large'
                    onClick={(e) => setAnchorEl(e.currentTarget)}
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
                    onClick={handleClose}
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
                <StyledMenuItem
                    component='a'
                    href={DOCUMENTATION_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={handleClose}
                >
                    <MenuBookIcon fontSize='small' />
                    Documentation
                </StyledMenuItem>
                <StyledMenuItem
                    component='a'
                    href={GITHUB_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={handleClose}
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
                    onClick={handleClose}
                >
                    <SlackIcon />
                    Slack community
                </StyledMenuItem>
            </StyledMenu>
        </>
    );
};
