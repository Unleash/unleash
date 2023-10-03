import { Button, styled } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledBanner = styled('div')(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.web.main,
    color: theme.palette.web.contrastText,
    padding: theme.spacing(1),
    [theme.breakpoints.down(768)]: {
        flexDirection: 'column',
    },
}));

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    flexShrink: 0,
    '&&&': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

const StyledQuestionsButton = styled(StyledButton)(({ theme }) => ({
    color: theme.palette.web.contrastText,
    border: `1px solid rgba(255, 255, 255, 0.5)`,
})) as typeof Button;

interface IDemoBannerProps {
    onPlans: () => void;
}

export const DemoBanner = ({ onPlans }: IDemoBannerProps) => {
    const { trackEvent } = usePlausibleTracker();

    return (
        <StyledBanner>
            <span>
                This is a <strong>demo of Unleash</strong>. Play around as much
                as you want. Reach out when you're ready.
            </span>
            <StyledButtons>
                <StyledQuestionsButton
                    variant="outlined"
                    sx={{ ml: 1 }}
                    href="https://slack.unleash.run/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                        trackEvent('demo-ask-questions');
                    }}
                >
                    Ask questions
                </StyledQuestionsButton>
                <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={onPlans}
                >
                    Get started
                </StyledButton>
            </StyledButtons>
        </StyledBanner>
    );
};
