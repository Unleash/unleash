import { alpha, Box, Button, styled, Typography } from '@mui/material';
import type { SignupStepContent } from './SignupDialog';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledContent = styled(Box)({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

const StyledCheck = styled(CheckCircleOutlineIcon)(({ theme }) => ({
    fontSize: theme.spacing(6),
    color: theme.palette.success.main,
    marginBottom: theme.spacing(2),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(3),
    width: '100%',
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(1.5),
    fontSize: theme.typography.h1.fontSize,
    textAlign: 'center',
}));

const StyledDemoSection = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(82),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
}));

const StyledChoices = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    rowGap: theme.spacing(2.5),
    columnGap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
    },
}));

const StyledChoiceCard = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'featured',
})<{ featured?: boolean }>(({ theme, featured }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    justifySelf: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5),
    border: `1px solid ${
        featured ? theme.palette.primary.main : theme.palette.divider
    }`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: featured
        ? alpha(theme.palette.primary.main, 0.06)
        : theme.palette.background.paper,
    textAlign: 'left',
}));

const StyledChoiceHeader = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
});

const StyledChoiceTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledDuration = styled('span')(({ theme }) => ({
    flexShrink: 0,
    padding: theme.spacing(0.25, 0.75),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.primary.main,
    background: theme.palette.background.paper,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledIntroList = styled('ol')(({ theme }) => ({
    margin: 0,
    paddingLeft: theme.spacing(2.5),
    color: theme.palette.text.primary,
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: 1.45,
}));

const StyledChoiceNote = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: 1.45,
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    textAlign: 'center',
}));

const StyledChoiceButton = styled(Button)({
    width: '100%',
    marginTop: 'auto',
});

const StyledReopenHint = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    textAlign: 'center',
}));

export const SignupDialogComplete: SignupStepContent = ({
    data,
    onNext,
    onBack,
    isSubmitting,
    error,
}) => {
    const offerTour = useUiFlag('onboardingIntroTour');
    const advancedTopics = useUiFlag('onboardingIntroTourAdvancedTopics');
    const description =
        data.inviteEmails.length === 0
            ? "Choose how you'd like to get started."
            : "Your teammate invitations are on the way. Choose how you'd like to get started.";

    return (
        <StyledContent data-public>
            <StyledCheck />
            <StyledHeader>
                <StyledTitle>Welcome to Unleash</StyledTitle>
                <StyledDescription>{description}</StyledDescription>
            </StyledHeader>
            {offerTour ? (
                <StyledDemoSection>
                    <StyledChoices>
                        <StyledChoiceCard featured>
                            <StyledChoiceHeader>
                                <StyledChoiceTitle
                                    variant='h3'
                                    sx={{ color: 'primary.main' }}
                                >
                                    Learn the basics
                                </StyledChoiceTitle>
                                <StyledDuration>
                                    {advancedTopics ? '5 min' : '2 min'}
                                </StyledDuration>
                            </StyledChoiceHeader>
                            <StyledIntroList>
                                <li>Release a feature gradually</li>
                                <li>Target the right users</li>
                                <li>Run experiments</li>
                                {advancedTopics ? (
                                    <>
                                        <li>Automate a rollout</li>
                                        <li>Follow live impact metrics</li>
                                        <li>Contain an issue automatically</li>
                                    </>
                                ) : null}
                            </StyledIntroList>
                            <StyledChoiceNote>
                                A playful sandbox with a live view of every
                                change. No setup required.
                            </StyledChoiceNote>
                            <StyledChoiceButton
                                variant='contained'
                                onClick={() => onNext('tour')}
                                disabled={isSubmitting}
                                data-testid='SIGNUP_TAKE_TOUR_BUTTON'
                            >
                                Learn the basics
                            </StyledChoiceButton>
                        </StyledChoiceCard>
                        <StyledChoiceCard>
                            <StyledChoiceTitle variant='h3'>
                                Set up a project
                            </StyledChoiceTitle>
                            <Typography variant='body2' color='textSecondary'>
                                Go straight to Unleash and start creating real
                                feature flags.
                            </Typography>
                            <StyledChoiceButton
                                variant='outlined'
                                onClick={() => onNext('complete')}
                                disabled={isSubmitting}
                                data-testid='SIGNUP_SKIP_TOUR_BUTTON'
                            >
                                Open Unleash
                            </StyledChoiceButton>
                        </StyledChoiceCard>
                    </StyledChoices>
                    <StyledReopenHint>
                        You can reopen Unleash Intro at any time from the Help
                        menu.
                    </StyledReopenHint>
                </StyledDemoSection>
            ) : (
                <Button
                    variant='contained'
                    onClick={() => onNext('complete')}
                    disabled={isSubmitting}
                >
                    Start using Unleash
                </Button>
            )}
            {error && (
                <Button
                    variant='text'
                    onClick={onBack}
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
                >
                    Back
                </Button>
            )}
        </StyledContent>
    );
};
