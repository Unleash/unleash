import { FC } from 'react';
import { Modal, Backdrop, styled, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Fade from '@mui/material/Fade';
import { SIDEBAR_MODAL_ID } from 'utils/testIds';
import * as React from 'react';

interface ISidebarModalProps {
    open: boolean;
    onClose: () => void;
    label: string;
    children: React.ReactElement<any, any>;
}

const TRANSITION_DURATION = 250;

const ModalContentWrapper = styled('div')({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    height: '100vh',
    maxWidth: '98vw',
    overflow: 'auto',
    boxShadow: '0 0 1rem rgba(0, 0, 0, 0.25)',
});

const FixedWidthContentWrapper = styled(ModalContentWrapper)({
    width: 1300,
});

export const BaseModal: FC<ISidebarModalProps> = ({
    open,
    onClose,
    label,
    children,
}) => {
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
                {children}
            </Fade>
        </Modal>
    );
};

export const SidebarModal: FC<ISidebarModalProps> = props => {
    return (
        <BaseModal {...props}>
            <FixedWidthContentWrapper>
                {props.children}
            </FixedWidthContentWrapper>
        </BaseModal>
    );
};

export const DynamicSidebarModal: FC<ISidebarModalProps> = props => {
    return (
        <BaseModal {...props}>
            <ModalContentWrapper>
                <Tooltip title="Close" arrow describeChild>
                    <IconButton
                        sx={theme => ({
                            position: 'absolute',
                            top: theme.spacing(3),
                            right: theme.spacing(3),
                        })}
                        onClick={props.onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
                {props.children}
            </ModalContentWrapper>
        </BaseModal>
    );
};
