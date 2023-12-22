import { Box, styled } from '@mui/material';
import { ConditionallyRender } from '../common/ConditionallyRender/ConditionallyRender';
import { useFeedback } from './useFeedback';

export const StyledContainer = styled('div')(({ theme }) => ({
    position: 'fixed',
    top: 0,
    right: 0,
    width: '496px',
    height: '100vh',
    opacity: 1,
    backgroundColor: theme.palette.primary.main,
    zIndex: 300,

    '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        right: '496px',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(32, 32, 33, 0.40)',
    },
}));

export const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(6),
    flexDirection: 'column',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(8.5),
    alignSelf: 'stretch',
}));

export const StyledTitle = styled(Box)(({ theme }) => ({
    color: '#fff',
    fontSize: theme.spacing(3),
    fontWeight: 400,
    lineHeight: theme.spacing(2.5),
}));

export const StyledForm = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '400px',
    padding: theme.spacing(3),
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'flex-start',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1.5),
    borderColor: 'rgba(0, 0, 0, 0.12)',
    backgroundColor: '#fff',
    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.12)',
}));

export const FormTitle = styled(Box)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.spacing(2),
    lineHeight: theme.spacing(2.75),
    fontWeight: theme.typography.fontWeightBold,
}));

export const FeedbackComponent = () => {
    const { feedbackData, showFeedback, closeFeedback } = useFeedback();

    if (!feedbackData) return null;

    return (
        <ConditionallyRender
            condition={showFeedback}
            show={
                <StyledContainer>
                    <StyledContent>
                        <StyledTitle>Help us to improve Unleash</StyledTitle>
                        <StyledForm>
                            <FormTitle>
                                How easy wasy it to configure the strategy?
                            </FormTitle>
                        </StyledForm>
                    </StyledContent>
                    <button type='button' onClick={closeFeedback}>
                        Close Feedback
                    </button>
                </StyledContainer>
            }
        />
    );
};
