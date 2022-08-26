import { useContext, useState } from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import classnames from 'classnames';
import CloseIcon from '@mui/icons-material/Close';
import { ReactComponent as Logo } from 'assets/icons/logoPlain.svg';
import { useStyles } from 'component/feedback/FeedbackNPS/FeedbackNPS.styles';
import AnimateOnMount from 'component/common/AnimateOnMount/AnimateOnMount';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useThemeStyles } from 'themes/themeStyles';
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
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();
    const feedbackId = PNPS_FEEDBACK_ID;

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
            start={themeStyles.fadeInTopStart}
            enter={themeStyles.fadeInTopEnter}
            leave={themeStyles.fadeInTopLeave}
            container={styles.animateContainer}
        >
            <div className={styles.feedback}>
                <div
                    className={classnames(
                        styles.container,
                        themeStyles.contentSpacingY
                    )}
                >
                    <Tooltip title="Close" arrow>
                        <IconButton
                            className={styles.close}
                            onClick={() => setShowFeedback(false)}
                            size="large"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                    <Logo className={styles.logo} />
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

                    <div>
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
                                        className={styles.cancel}
                                        onClick={() => setAnsweredNotNow(true)}
                                    >
                                        Not now
                                    </Button>
                                </>
                            }
                        />
                    </div>
                </div>
            </div>
        </AnimateOnMount>
    );
};
