import { Button, styled } from '@mui/material';

const StyledBanner = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.web.main,
    color: theme.palette.web.contrastText,
    padding: theme.spacing(1),
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

export const DemoBanner = ({ onPlans }: IDemoBannerProps) => (
    <StyledBanner>
        <span>
            This is a <strong>demo of Unleash</strong>. Play around as much as
            you want. Reach out when you're ready.
        </span>
        <StyledQuestionsButton
            variant="outlined"
            sx={{ ml: 1 }}
            href="https://slack.unleash.run/"
            target="_blank"
        >
            Ask questions
        </StyledQuestionsButton>
        <StyledButton variant="contained" color="primary" onClick={onPlans}>
            Get Unleash
        </StyledButton>
    </StyledBanner>
);
