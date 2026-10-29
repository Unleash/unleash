import { useState } from 'react';
import { Button, Fade, styled, Typography } from '@mui/material';
import {
    StyledSurveyCard,
    StyledSurveyCardActions,
    StyledSurveyCardHeader,
    SurveyCardCloseButton,
} from 'component/feedbackModule/SurveyCard/SurveyCardLayout';

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}));

interface FeedbackNPSCardProps {
    open: boolean;
    onConfirm: () => void | Promise<void>;
    onDontShowAgain: () => void | Promise<void>;
    onClose: () => void;
}

export const FeedbackNPSCard = ({
    open,
    onConfirm,
    onDontShowAgain,
    onClose,
}: FeedbackNPSCardProps) => {
    const [answeredNotNow, setAnsweredNotNow] = useState(false);

    return (
        <Fade in={open} unmountOnExit>
            <StyledSurveyCard
                elevation={8}
                role='complementary'
                aria-label='Unleash feedback'
            >
                <StyledSurveyCardHeader>
                    <SurveyCardCloseButton
                        label='Close feedback'
                        onClick={onClose}
                    />
                </StyledSurveyCardHeader>
                <StyledContent>
                    <div>
                        <Typography variant='h3' component='h2'>
                            Unleash feedback
                        </Typography>
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 1 }}
                        >
                            {answeredNotNow
                                ? 'Alright, apologies for the disruption. Have a nice day!'
                                : 'Hi. Do you have 2 minutes to help us improve Unleash?'}
                        </Typography>
                    </div>
                    {answeredNotNow ? (
                        <Button variant='outlined' onClick={onDontShowAgain}>
                            Don't show again
                        </Button>
                    ) : (
                        <StyledSurveyCardActions>
                            <Button
                                variant='outlined'
                                onClick={() => setAnsweredNotNow(true)}
                            >
                                Not now
                            </Button>
                            <Button
                                variant='contained'
                                color='primary'
                                sx={{ flex: 1 }}
                                onClick={onConfirm}
                            >
                                Yes, no problem
                            </Button>
                        </StyledSurveyCardActions>
                    )}
                </StyledContent>
            </StyledSurveyCard>
        </Fade>
    );
};
