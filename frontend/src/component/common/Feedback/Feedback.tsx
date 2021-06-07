import { useState } from 'react';
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

interface IFeedbackProps {
    show?: boolean;
    hideFeedback: () => Dispatch<Action>;
    fetchUser: () => void;
    feedbackId: string;
    openUrl: string;
}

const Feedback = ({
    show,
    hideFeedback,
    fetchUser,
    feedbackId,
    openUrl,
}: IFeedbackProps) => {
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
            await fetchUser();
        } catch {
            hideFeedback();
        }

        // Await api call to register confirmation
        window.open(openUrl, '_blank');
        setTimeout(() => {
            hideFeedback();
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
            await fetchUser();
        } catch {
            hideFeedback();
        }

        setTimeout(() => {
            hideFeedback();
        }, 100);
    };

    return (
        <AnimateOnMount
            mounted={show}
            enter={styles.feedbackEnter}
            start={styles.feedbackStart}
            leave={styles.feedbackLeave}
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
                        onClick={() => hideFeedback()}
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
