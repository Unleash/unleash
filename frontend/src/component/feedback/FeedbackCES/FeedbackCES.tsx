import { IconButton, Modal, styled } from '@mui/material';
import React, { useContext } from 'react';
import {
    feedbackCESContext,
    IFeedbackCESState,
} from 'component/feedback/FeedbackCESContext/FeedbackCESContext';
import { FeedbackCESForm } from 'component/feedback/FeedbackCES/FeedbackCESForm';
import { CloseOutlined } from '@mui/icons-material';

export interface IFeedbackCESProps {
    state?: IFeedbackCESState;
}

const StyledOverlay = styled('div')(({ theme }) => ({
    pointerEvents: 'none',
    display: 'grid',
    padding: theme.spacing(2),
    overflowY: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
}));

const StyledModal = styled('div')(({ theme }) => ({
    pointerEvents: 'auto',
    position: 'relative',
    padding: theme.spacing(8),
    background: theme.palette.background.paper,
    boxShadow: theme.boxShadows.popup,
    borderRadius: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(4),
    },
}));

const StyledClose = styled('div')({
    all: 'unset',
    position: 'absolute',
    top: 0,
    right: 0,
});

const StyledCloseIcon = styled(CloseOutlined)(({ theme }) => ({
    fontSize: '1.5rem',
    color: theme.palette.action.active,
}));

export const FeedbackCES = ({ state }: IFeedbackCESProps) => {
    const { hideFeedbackCES } = useContext(feedbackCESContext);

    const modalContent = state && (
        <FeedbackCESForm state={state} onClose={hideFeedbackCES} />
    );

    return (
        <Modal
            open={Boolean(state)}
            onClose={hideFeedbackCES}
            aria-label={state?.title}
        >
            <StyledOverlay>
                <StyledModal>
                    <StyledClose>
                        <IconButton onClick={hideFeedbackCES} size="large">
                            <StyledCloseIcon titleAccess="Close" />
                        </IconButton>
                    </StyledClose>
                    {modalContent}
                </StyledModal>
            </StyledOverlay>
        </Modal>
    );
};
