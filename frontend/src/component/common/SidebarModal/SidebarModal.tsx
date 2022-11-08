import { ReactNode } from 'react';
import { Modal, Backdrop, styled } from '@mui/material';
import Fade from '@mui/material/Fade';
import { SIDEBAR_MODAL_ID } from 'utils/testIds';

interface ISidebarModalProps {
    open: boolean;
    onClose: () => void;
    label: string;
    children: ReactNode;
}

const TRANSITION_DURATION = 250;

const ModalContentWrapper = styled('div')({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    height: '100vh',
    maxWidth: '98vw',
    width: 1300,
    overflow: 'auto',
    boxShadow: '0 0 1rem rgba(0, 0, 0, 0.25)',
});

export const SidebarModal = ({
    open,
    onClose,
    label,
    children,
}: ISidebarModalProps) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            aria-label={label}
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: TRANSITION_DURATION }}
            data-testid={SIDEBAR_MODAL_ID}
        >
            <Fade timeout={TRANSITION_DURATION} in={open}>
                <ModalContentWrapper>{children}</ModalContentWrapper>
            </Fade>
        </Modal>
    );
};
