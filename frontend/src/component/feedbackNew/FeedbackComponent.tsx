import {
    Box,
    Button,
    ClickAwayListener,
    IconButton,
    Rating,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFeedbackContext } from './useFeedback.tsx';
import type React from 'react';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import useToast from 'hooks/useToast';
import type { ProvideFeedbackSchema } from 'openapi';
import { useUserFeedbackApi } from 'hooks/api/actions/useUserFeedbackApi/useUserFeedbackApi';
import { useUserSubmittedFeedback } from 'hooks/useSubmittedFeedback';
import type { IToast } from 'interfaces/toast';
import { useTheme } from '@mui/material/styles';
import type { FeedbackData, FeedbackMode } from './FeedbackContext.tsx';
import { useEventTracker } from 'hooks/useEventTracker';
import { useUiFlag } from 'hooks/useUiFlag';
import useUserType from './useUserType.ts';
import { BaseModal } from 'component/common/SidebarModal/SidebarModal';

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

export const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    width: '400px',
    padding: theme.spacing(3),
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'flex-start',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1.5),
    borderColor: 'rgba(0, 0, 0, 0.12)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.12)',

    '& > *': {
        width: '100%',
    },
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
    marginBottom: theme.spacing(0.5),
}));

export const StyledButton = styled(Button)(() => ({
    width: '100%',
}));

const StyledRating = styled(Rating)(({ theme }) => ({
    fontSize: theme.spacing(5),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    color: theme.palette.background.paper,
}));

const StyledButtonContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.25),
    alignItems: 'flex-start',
}));

export const FeedbackComponentWrapper = () => {
    const { feedbackData, showFeedback, closeFeedback, feedbackMode } =
        useFeedbackContext();

    if (!feedbackData || !feedbackMode) return null;

    return (
        <FeedbackComponent
            feedbackData={feedbackData}
            showFeedback={showFeedback}
            closeFeedback={closeFeedback}
            feedbackMode={feedbackMode}
        />
    );
};

interface IFeedbackComponent {
    feedbackData: FeedbackData;
    showFeedback: boolean;
    feedbackMode: FeedbackMode;
    closeFeedback: () => void;
}

export const FeedbackComponent = ({
    feedbackData,
    showFeedback,
    closeFeedback,
    feedbackMode,
}: IFeedbackComponent) => {
    const { setToastData } = useToast();
    const userType = useUserType();
    const { trackEvent } = useEventTracker();
    const theme = useTheme();

    const { addFeedback } = useUserFeedbackApi();
    const { setHasSubmittedFeedback } = useUserSubmittedFeedback(
        feedbackData.category,
    );
    const feedbackComments = useUiFlag('feedbackComments');

    const dontAskAgain = () => {
        closeFeedback();
        setHasSubmittedFeedback(true);
        trackEvent('feedback', {
            props: {
                eventType: `dont ask again - ${feedbackData.category}`,
                category: feedbackData.category,
            },
        });
    };

    const [selectedScore, setSelectedScore] = useState<number | null>(null);

    const onSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selectedScore == null) return;
        const formData = new FormData(event.currentTarget);

        const payload: ProvideFeedbackSchema = {
            category: feedbackData.category,
            userType,
            difficultyScore: selectedScore,
            positive: formData.get('positive') as string,
            areasForImprovement: formData.get('areasForImprovement') as string,
        };

        let toastType: IToast['type'] = 'error';
        let toastTitle = 'Feedback not sent';

        try {
            await addFeedback(payload);
            trackEvent('feedback', {
                props: {
                    eventType: `submitted - ${feedbackData.category}`,
                    category: feedbackData.category,
                },
            });
            toastTitle = 'Feedback sent';
            toastType = 'success';
            setHasSubmittedFeedback(true);
        } catch (_e) {}

        setToastData({
            text: toastTitle,
            type: toastType,
        });
        closeFeedback();
    };

    const onScoreChange = (value: number | null) => {
        trackEvent('feedback', {
            props: {
                eventType: `score change - ${feedbackData.category}`,
                category: feedbackData.category,
            },
        });
        setSelectedScore(value);
    };

    return (
        <BaseModal open={showFeedback} onClose={closeFeedback} label='Feedback'>
            <ParentContainer>
                <ClickAwayListener onClickAway={() => closeFeedback()}>
                    <StyledContainer>
                        <Tooltip title='Close' arrow>
                            <StyledCloseButton
                                onClick={closeFeedback}
                                size='large'
                            >
                                <CloseIcon />
                            </StyledCloseButton>
                        </Tooltip>
                        <StyledContent>
                            <StyledTitle>Help us improve Unleash</StyledTitle>
                            <StyledForm onSubmit={onSubmission}>
                                <FormTitle>{feedbackData.title}</FormTitle>
                                <StyledRating
                                    name='difficultyScoreRating'
                                    max={5}
                                    value={selectedScore}
                                    onChange={(_, value) =>
                                        onScoreChange(value)
                                    }
                                />

                                {feedbackComments !== false &&
                                feedbackComments.enabled &&
                                feedbackComments.name === 'withoutComments' ? (
                                    <>
                                        <Box>
                                            <TextField
                                                placeholder='Your answer here'
                                                style={{
                                                    width: '100%',
                                                }}
                                                name='positive'
                                                hidden
                                                value={feedbackComments.name}
                                                multiline
                                                rows={3}
                                                variant='outlined'
                                                size='small'
                                                slotProps={{
                                                    inputLabel: {
                                                        style: {
                                                            fontSize:
                                                                theme.fontSizes
                                                                    .smallBody,
                                                        },
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box>
                                            <TextField
                                                placeholder='Your answer here'
                                                style={{
                                                    width: '100%',
                                                }}
                                                multiline
                                                name='areasForImprovement'
                                                rows={3}
                                                variant='outlined'
                                                size='small'
                                                hidden
                                                slotProps={{
                                                    inputLabel: {
                                                        style: {
                                                            fontSize:
                                                                theme.fontSizes
                                                                    .smallBody,
                                                        },
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <Box>
                                            <FormSubTitle>
                                                {feedbackData.positiveLabel}
                                            </FormSubTitle>
                                            <TextField
                                                placeholder='Your answer here'
                                                style={{
                                                    width: '100%',
                                                }}
                                                name='positive'
                                                multiline
                                                rows={3}
                                                variant='outlined'
                                                size='small'
                                                slotProps={{
                                                    inputLabel: {
                                                        style: {
                                                            fontSize:
                                                                theme.fontSizes
                                                                    .smallBody,
                                                        },
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box>
                                            <FormSubTitle>
                                                {
                                                    feedbackData.areasForImprovementsLabel
                                                }
                                            </FormSubTitle>
                                            <TextField
                                                placeholder='Your answer here'
                                                style={{
                                                    width: '100%',
                                                }}
                                                multiline
                                                name='areasForImprovement'
                                                rows={3}
                                                variant='outlined'
                                                size='small'
                                                slotProps={{
                                                    inputLabel: {
                                                        style: {
                                                            fontSize:
                                                                theme.fontSizes
                                                                    .smallBody,
                                                        },
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </>
                                )}

                                <StyledButtonContainer>
                                    <StyledButton
                                        disabled={!selectedScore}
                                        variant='contained'
                                        color='primary'
                                        type='submit'
                                    >
                                        Send Feedback
                                    </StyledButton>
                                    <ConditionallyRender
                                        condition={feedbackMode === 'manual'}
                                        show={
                                            <StyledButton
                                                variant='outlined'
                                                color='primary'
                                                onClick={dontAskAgain}
                                            >
                                                Don't ask me again
                                            </StyledButton>
                                        }
                                    />
                                </StyledButtonContainer>
                            </StyledForm>
                        </StyledContent>
                    </StyledContainer>
                </ClickAwayListener>
            </ParentContainer>
        </BaseModal>
    );
};
