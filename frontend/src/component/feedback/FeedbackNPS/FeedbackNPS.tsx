import { useContext, useMemo, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    useTheme,
    styled,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactComponent as UnleashLogo } from 'assets/icons/logoBg.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/icons/logoWhiteBg.svg';
import AnimateOnMount from 'component/common/AnimateOnMount/AnimateOnMount';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
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
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';

const StyledHeader = styled('h3')(({ theme }) => ({
    margin: 0,
    color: theme.palette.text.primary,
    marginLeft: theme.spacing(1),
}));

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
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const animations = useMemo(
        () => ({
            start: {
                ...fadeInTopStart(theme),
                zIndex: theme.zIndex.tooltip,
                right: theme.spacing(4),
                top: theme.spacing(2),
                left: 'auto',
                maxWidth: '400px',
                ...(isSmallScreen && {
                    right: theme.spacing(3),
                    left: theme.spacing(3),
                    top: theme.spacing(5),
                    display: 'flex',
                    maxWidth: '600px',
                }),
            },
            enter: fadeInTopEnter,
            leave: fadeInTopLeave,
        }),
        [theme, isSmallScreen]
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
                className="dropdown-outline"
                sx={{
                    borderRadius: `${theme.shape.borderRadiusLarge}px`,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 9999,
                    boxShadow: theme.boxShadows.elevated,
                    padding: theme.spacing(4),
                    flexGrow: 1,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: theme.spacing(1.5),
                        position: 'relative',
                    }}
                >
                    <Tooltip title="Close" arrow>
                        <IconButton
                            sx={theme => ({
                                position: 'absolute',
                                right: theme.spacing(-4),
                                top: theme.spacing(-4),
                            })}
                            onClick={() => setShowFeedback(false)}
                            size="large"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <ThemeMode
                            darkmode={<UnleashLogoWhite />}
                            lightmode={<UnleashLogo />}
                        />
                        <StyledHeader>Unleash feedback</StyledHeader>
                    </Box>

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

                    <Box
                        sx={{
                            textAlign: 'right',
                            marginTop: theme.spacing(2.5),
                        }}
                    >
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
