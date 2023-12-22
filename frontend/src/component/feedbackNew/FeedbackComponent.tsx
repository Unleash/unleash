import { Box, Button, styled, TextField } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFeedback } from './useFeedback';
import React from 'react';

export const ParentContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    width: '100vw',
    height: '100vh',
    '&::after': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(32, 32, 33, 0.40)',
        zIndex: theme.zIndex.fab,
    },
}));
export const StyledContainer = styled('div')(({ theme }) => ({
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    opacity: 1,
    borderRadius: theme.spacing(2.5, 0, 0, 2.5),
    background: `linear-gradient(307deg, #3D3980 0%, #615BC2 26.77%, #6A63E0 48.44%, #6A63E0 72.48%, #8154BF 99.99%)`,
    backgroundColor: theme.palette.primary.main,
    zIndex: theme.zIndex.sticky,
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

export const FormSubTitle = styled(Box)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.spacing(1.75),
    lineHeight: theme.spacing(2.5),
}));

export const StyledButton = styled(Button)(({ theme }) => ({
    width: '100%',
}));

const StyledScoreContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    alignItems: 'flex-start',
}));

const StyledScoreInput = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const StyledScoreHelp = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.spacing(1.75),
}));

const ScoreHelpContainer = styled('span')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
}));

const StyledScoreValue = styled('label')(({ theme }) => ({
    '& input': {
        clip: 'rect(0 0 0 0)',
        position: 'absolute',
    },
    '& span': {
        display: 'grid',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.background.elevation2,
        width: theme.spacing(4),
        height: theme.spacing(4),
        borderRadius: theme.spacing(12.5),
        userSelect: 'none',
        cursor: 'pointer',
    },
    '& input:checked + span': {
        fontWeight: theme.typography.fontWeightBold,
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    '& input:hover + span': {
        outline: '2px solid',
        outlineOffset: 2,
        outlineColor: theme.palette.primary.main,
    },
}));

export const FeedbackComponent = () => {
    const { feedbackData, showFeedback, closeFeedback } = useFeedback();

    // if (!feedbackData) return null;

    return (
        <ConditionallyRender
            condition={showFeedback === false}
            show={
                <ParentContainer>
                    <StyledContainer>
                        <StyledContent>
                            <StyledTitle>
                                Help us to improve Unleash
                            </StyledTitle>
                            <StyledForm>
                                <FormTitle>
                                    How easy wasy it to configure the strategy?
                                </FormTitle>
                                <StyledScoreContainer>
                                    <StyledScoreInput>
                                        {[1, 2, 3, 4, 5, 6, 7].map((score) => (
                                            <StyledScoreValue key={score}>
                                                <input
                                                    type='radio'
                                                    name='score'
                                                    value={score}
                                                />
                                                <span>{score}</span>
                                            </StyledScoreValue>
                                        ))}
                                    </StyledScoreInput>
                                    <ScoreHelpContainer>
                                        <StyledScoreHelp>
                                            Very difficult
                                        </StyledScoreHelp>
                                        <StyledScoreHelp>
                                            Very easy
                                        </StyledScoreHelp>
                                    </ScoreHelpContainer>
                                </StyledScoreContainer>
                                <Box>
                                    <FormSubTitle>
                                        What do you like most about the strategy
                                        configuration?
                                    </FormSubTitle>
                                    <TextField
                                        label='Your answer here'
                                        style={{ width: '100%' }}
                                        multiline
                                        rows={3}
                                        variant='outlined'
                                        size='small'
                                        InputLabelProps={{
                                            style: {
                                                fontSize: '14px',
                                            },
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <FormSubTitle>
                                        What should be improved in the strategy
                                        configuration?
                                    </FormSubTitle>
                                    <TextField
                                        label='Your answer here'
                                        style={{ width: '100%' }}
                                        multiline
                                        rows={3}
                                        InputLabelProps={{
                                            style: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        variant='outlined'
                                        size='small'
                                    />
                                </Box>
                                <StyledButton
                                    variant='contained'
                                    color='primary'
                                    type='submit'
                                    onClick={closeFeedback}
                                >
                                    Send Feedback
                                </StyledButton>
                            </StyledForm>
                        </StyledContent>
                    </StyledContainer>
                </ParentContainer>
            }
        />
    );
};
