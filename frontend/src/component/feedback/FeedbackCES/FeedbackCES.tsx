import { Modal } from '@material-ui/core';
import React, { useContext } from 'react';
import {
    feedbackCESContext,
    IFeedbackCESState,
} from 'component/feedback/FeedbackCESContext/FeedbackCESContext';
import { FeedbackCESForm } from 'component/feedback/FeedbackCES/FeedbackCESForm';
import { useStyles } from 'component/feedback/FeedbackCES/FeedbackCES.styles';
import { CloseOutlined } from '@material-ui/icons';

export interface IFeedbackCESProps {
    state?: IFeedbackCESState;
}

export const FeedbackCES = ({ state }: IFeedbackCESProps) => {
    const { hideFeedbackCES } = useContext(feedbackCESContext);
    const styles = useStyles();

    const closeButton = (
        <button className={styles.close} onClick={hideFeedbackCES}>
            <CloseOutlined titleAccess="Close" className={styles.closeIcon} />
        </button>
    );

    const modalContent = state && (
        <FeedbackCESForm state={state} onClose={hideFeedbackCES} />
    );

    return (
        <Modal
            open={Boolean(state)}
            onClose={hideFeedbackCES}
            aria-label={state?.title}
        >
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    {closeButton}
                    {modalContent}
                </div>
            </div>
        </Modal>
    );
};
