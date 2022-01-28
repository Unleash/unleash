import { useContext, useState } from 'react';
import { Button, IconButton } from '@material-ui/core';
import classnames from 'classnames';
import CloseIcon from '@material-ui/icons/Close';

import { ReactComponent as Logo } from '../../../assets/icons/logo-plain.svg';
import { useCommonStyles } from '../../../common.styles';
import { useStyles } from './Feedback.styles';
import AnimateOnMount from '../AnimateOnMount/AnimateOnMount';
import ConditionallyRender from '../ConditionallyRender';
import { formatApiPath } from '../../../utils/format-path';
import { Action, Dispatch } from 'redux';
import UIContext from '../../../contexts/UIContext';
import useUser from '../../../hooks/api/getters/useUser/useUser';

interface IFeedbackProps {
    show?: boolean;
    hideFeedback: () => Dispatch<Action>;
    fetchUser: () => void;
    feedbackId: string;
    openUrl: string;
}

const Feedback = ({ feedbackId, openUrl }: IFeedbackProps) => {
    const { showFeedback, setShowFeedback } = useContext(UIContext);
    const { refetch, feedback } = useUser();
    const [answeredNotNow, setAnsweredNotNow] = useState(false);
    const styles = useStyles();
    const commonStyles = useCommonStyles();

    const onConfirm = async () => {
        const url = formatApiPath('api/admin/feedback');

        try {
            await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feedbackId }),
            });
            await refetch();
        } catch {
            setShowFeedback(false);
        }

        // Await api call to register confirmation
        window.open(openUrl, '_blank');
        setTimeout(() => {
            setShowFeedback(false);
        }, 200);
    };

    const onDontShowAgain = async () => {
        const feedbackId = 'pnps';
        const url = formatApiPath(
            `api/admin/feedback/${encodeURIComponent(feedbackId)}`
        );

        try {
            await fetch(url, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feedbackId, neverShow: true }),
            });
            await refetch();
        } catch {
            setShowFeedback(false);
        }

        setTimeout(() => {
            setShowFeedback(false);
        }, 100);
    };

    const pnps = feedback.find(feedback => feedback.feedbackId === feedbackId);

    if (pnps?.given || pnps?.neverShow) {
        return null;
    }

    return (
        <AnimateOnMount
            mounted={showFeedback}
            start={commonStyles.fadeInTopStart}
            enter={commonStyles.fadeInTopEnter}
            leave={commonStyles.fadeInTopLeave}
            container={styles.animateContainer}
        >
            <div className={styles.feedback}>
                <div
                    className={classnames(
                        styles.container,
                        commonStyles.contentSpacingY
                    )}
                >
                    <IconButton
                        className={styles.close}
                        onClick={() => setShowFeedback(false)}
                    >
                        <CloseIcon />
                    </IconButton>
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

export default Feedback;
