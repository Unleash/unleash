import { useContext, useMemo, useState } from 'react';
import { Box, Button, IconButton, Tooltip, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactComponent as Logo } from 'assets/icons/logoPlain.svg';
import AnimateOnMount from 'component/common/AnimateOnMount/AnimateOnMount';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    contentSpacingY,
    fadeInTopEnter,
    fadeInTopLeave,
    fadeInTopStart,
} from 'themes/themeStyles';
import UIContext from 'contexts/UIContext';
import {
    PNPS_FEEDBACK_ID,
    showNPSFeedback,
} from 'component/feedback/FeedbackNPS/showNPSFeedback';
import { useAuthFeedback } from 'hooks/api/getters/useAuth/useAuthFeedback';
import { useAuthFeedbackApi } from 'hooks/api/actions/useAuthFeedbackApi/useAuthFeedbackApi';

interface IFeedbackNPSProps {
    openUrl: string;
}

export const FeedbackNPS = ({ openUrl }: IFeedbackNPSProps) => {
    const { showFeedback, setShowFeedback } = useContext(UIContext);
    const { createFeedback, updateFeedback } = useAuthFeedbackApi();
    const { feedback } = useAuthFeedback();
    const [answeredNotNow, setAnsweredNotNow] = useState(false);
    const theme = useTheme();
    const feedbackId = PNPS_FEEDBACK_ID;

    const animations = useMemo(
        () => ({
            start: { ...fadeInTopStart(theme), zIndex: theme.zIndex.tooltip },
            enter: fadeInTopEnter,
            leave: fadeInTopLeave,
        }),
        [theme]
    );

    const onConfirm = async () => {
        try {
            await createFeedback({ feedbackId });
        } catch (err) {
            console.warn(err);
            setShowFeedback(false);
        }
        // Await api call to register confirmation
        window.open(openUrl, '_blank');
        setTimeout(() => {
            setShowFeedback(false);
        }, 200);
    };

    const onDontShowAgain = async () => {
        try {
            await updateFeedback({ feedbackId, neverShow: true });
        } catch (err) {
            console.warn(err);
            setShowFeedback(false);
        }
        setTimeout(() => {
            setShowFeedback(false);
        }, 100);
    };

    if (!showNPSFeedback(feedback)) {
        return null;
    }

    return (
        <AnimateOnMount
            mounted={showFeedback}
            start={animations.start}
            enter={animations.enter}
            leave={animations.leave}
        >
            <Box
                sx={{
                    borderRadius: `${theme.shape.borderRadiusLarge}px`,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 9999,
                    boxShadow: theme.boxShadows.elevated,
                    padding: theme.spacing(3),
                    maxWidth: '400px',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        ...contentSpacingY(theme),
                    }}
                >
                    <Tooltip title="Close" arrow>
                        <IconButton
                            sx={{
                                position: 'absolute',
                                right: '-38px',
                                top: '-47px',
                                backgroundColor: theme.palette.background.paper,
                                boxShadow: theme.boxShadows.elevated,
                                '&:hover': {
                                    backgroundColor:
                                        theme.palette.background.paper,
                                },
                            }}
                            onClick={() => setShowFeedback(false)}
                            size="large"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                    <Logo
                        style={{
                            width: '25px',
                            height: '25px',
                        }}
                    />
                    <ConditionallyRender
                        condition={answeredNotNow}
                        show={
                            <p>
                                Alright, apologies for the disruption. Have a
                                nice day!
                            </p>
                        }
                        elseShow={
                            <p>
                                Hi. Do you have 2 minutes to help us improve
                                Unleash?{' '}
                            </p>
                        }
                    />

                    <Box>
                        <ConditionallyRender
                            condition={answeredNotNow}
                            show={
                                <Button
                                    variant="outlined"
                                    onClick={onDontShowAgain}
                                >
                                    Don't show again
                                </Button>
                            }
                            elseShow={
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={onConfirm}
                                    >
                                        Yes, no problem
                                    </Button>
                                    <Button
                                        sx={{
                                            marginLeft: theme =>
                                                theme.spacing(2),
                                        }}
                                        onClick={() => setAnsweredNotNow(true)}
                                    >
                                        Not now
                                    </Button>
                                </>
                            }
                        />
                    </Box>
                </Box>
            </Box>
        </AnimateOnMount>
    );
};
