import { IconButton, Modal } from '@mui/material';
import React, { useContext } from 'react';
import {
    feedbackCESContext,
    IFeedbackCESState,
} from 'component/feedback/FeedbackCESContext/FeedbackCESContext';
import { FeedbackCESForm } from 'component/feedback/FeedbackCES/FeedbackCESForm';
import { useStyles } from 'component/feedback/FeedbackCES/FeedbackCES.styles';
import { CloseOutlined } from '@mui/icons-material';

export interface IFeedbackCESProps {
    state?: IFeedbackCESState;
}

export const FeedbackCES = ({ state }: IFeedbackCESProps) => {
    const { hideFeedbackCES } = useContext(feedbackCESContext);
    const { classes: styles } = useStyles();

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
                    <div className={styles.close}>
                        <IconButton onClick={hideFeedbackCES} size="large">
                            <CloseOutlined
                                titleAccess="Close"
                                className={styles.closeIcon}
                            />
                        </IconButton>
                    </div>
                    {modalContent}
                </div>
            </div>
        </Modal>
    );
};
