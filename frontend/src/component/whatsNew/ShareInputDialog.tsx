import {
    Button,
    Dialog,
    IconButton,
    Tooltip,
    styled,
    Typography,
} from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import copy from 'copy-to-clipboard';
import { useEventTracker } from 'hooks/useEventTracker';
import useToast from 'hooks/useToast';

const BETA_INPUT_EMAIL = 'beta@getunleash.io';
const SURVEY_URL = 'https://forms.gle/7tTX4LcyDY6DwYMDA';

const buildInputMailto = (title: string) => {
    const subject = encodeURIComponent(`Input on ${title}`);
    const body = encodeURIComponent(
        `Hi Unleash team,\n\nI'd like to share some input on ${title}:\n\n`,
    );
    return `mailto:${BETA_INPUT_EMAIL}?subject=${subject}&body=${body}`;
};

const StyledShareInputDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(56),
        padding: theme.spacing(3),
    },
}));

const StyledDialogCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: theme.palette.neutral.main,
}));

const StyledDialogTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
    paddingRight: theme.spacing(3),
})) as typeof Typography;

const StyledDialogDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
}));

const StyledEmailRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
}));

const StyledEmailPill = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    height: theme.spacing(4.5),
    padding: theme.spacing(0.5, 0.5, 0.5, 2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    flex: 1,
    wordBreak: 'break-all',
    ...theme.typography.body1,
    color: theme.palette.text.primary,
}));

const StyledSurveyPrompt = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
})) as typeof Typography;

const StyledSurveyLink = styled('a')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    color: theme.palette.links,
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'underline',
}));

const StyledSurveyLinkIcon = styled(OpenInNew)(({ theme }) => ({
    fontSize: theme.spacing(2.25),
}));

const StyledContentCopyOutlinedIcon = styled(ContentCopyOutlinedIcon)(
    ({ theme }) => ({
        fill: theme.palette.text.secondary,
    }),
);

type ShareInputDialogProps = {
    open: boolean;
    onClose: () => void;
    featureTitle: string;
};

export const ShareInputDialog = ({
    open,
    onClose,
    featureTitle,
}: ShareInputDialogProps) => {
    const { trackEvent } = useEventTracker();
    const { setToastData } = useToast();

    const handleCopy = () => {
        if (copy(BETA_INPUT_EMAIL)) {
            setToastData({
                type: 'success',
                text: 'Email address copied to clipboard.',
            });
            trackEvent('whats-new-page', {
                props: {
                    eventType: 'share-input-email-copy',
                    feature: featureTitle,
                },
            });
        }
    };

    const handleMailto = () => {
        trackEvent('whats-new-page', {
            props: {
                eventType: 'share-input-compose-email-click',
                feature: featureTitle,
            },
        });
    };

    const handleSurvey = () => {
        trackEvent('whats-new-page', {
            props: {
                eventType: 'share-input-survey-click',
                feature: featureTitle,
            },
        });
    };

    return (
        <StyledShareInputDialog open={open} onClose={onClose}>
            <StyledDialogCloseButton
                aria-label='Close'
                size='small'
                onClick={onClose}
            >
                <CloseIcon fontSize='small' />
            </StyledDialogCloseButton>
            <StyledDialogTitle component='h2' variant='h3'>
                Share your input
            </StyledDialogTitle>
            <StyledDialogDescription variant='body2'>
                We'd love to hear your thoughts on this. Email us directly, or
                fill out the survey below.
            </StyledDialogDescription>
            <StyledEmailRow>
                <StyledEmailPill>
                    {BETA_INPUT_EMAIL}
                    <Tooltip title='Copy email' arrow>
                        <IconButton
                            onClick={handleCopy}
                            size='small'
                            aria-label='Copy email address'
                        >
                            <StyledContentCopyOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </StyledEmailPill>
                <Button
                    color='primary'
                    variant='outlined'
                    href={buildInputMailto(featureTitle)}
                    onClick={handleMailto}
                >
                    Compose email
                </Button>
            </StyledEmailRow>
            <StyledSurveyPrompt>
                or{' '}
                <StyledSurveyLink
                    href={SURVEY_URL}
                    rel='noopener noreferrer'
                    target='_blank'
                    onClick={handleSurvey}
                >
                    fill out our survey
                    <StyledSurveyLinkIcon />
                </StyledSurveyLink>
            </StyledSurveyPrompt>
        </StyledShareInputDialog>
    );
};
