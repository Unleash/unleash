import type { FC } from 'react';
import { Modal, Backdrop, styled, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Fade from '@mui/material/Fade';
import {
    dismissMethodFromCloseReason,
    useDialogTracking,
} from 'hooks/useDialogTracking';
import { SIDEBAR_MODAL_ID } from 'utils/testIds';
import type { DialogDismissMethod, Tracking } from 'utils/trackingEvents';
import type * as React from 'react';

interface ISidebarModalProps {
    open: boolean;
    onClose: () => void;
    label: string;
    onClick?: (e: React.SyntheticEvent) => void;
    children: React.ReactElement<any, any>;
    tracking?: Tracking;
}

interface IBaseModalProps {
    open: boolean;
    onClose: () => void;
    label: string;
    onClick?: (e: React.SyntheticEvent) => void;
    children: React.ReactElement<any, any>;
    onDismiss?: (method: DialogDismissMethod) => void;
}

const TRANSITION_DURATION = 250;

const ModalContentWrapper = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    height: '100vh',
    maxWidth: '98vw',
    overflow: 'auto',
    boxShadow: '0 0 1rem rgba(0, 0, 0, 0.25)',
    background: theme.palette.background.paper,
}));

const FixedWidthContentWrapper = styled(ModalContentWrapper)({
    width: 1300,
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    zIndex: 1,
    position: 'absolute',
    top: theme.spacing(3),
    right: theme.spacing(3),
}));

export const BaseModal: FC<IBaseModalProps> = ({
    open,
    onClose,
    onClick,
    label,
    children,
    onDismiss,
}) => {
    return (
        <Modal
            open={open}
            onClose={(_, reason) => {
                onDismiss?.(dismissMethodFromCloseReason(reason));
                onClose();
            }}
            onClick={onClick}
            closeAfterTransition
            aria-label={label}
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: TRANSITION_DURATION } }}
            data-testid={SIDEBAR_MODAL_ID}
            sx={{ minHeight: '100vh' }}
        >
            <Fade timeout={TRANSITION_DURATION} in={open}>
                {children}
            </Fade>
        </Modal>
    );
};

export const SidebarModal: FC<ISidebarModalProps> = (props) => {
    const emitDismissed = useDialogTracking(props.open, props.tracking);

    return (
        <BaseModal {...props} onDismiss={emitDismissed}>
            <FixedWidthContentWrapper>
                {props.children}
            </FixedWidthContentWrapper>
        </BaseModal>
    );
};

export const DynamicSidebarModal: FC<ISidebarModalProps> = (props) => {
    const emitDismissed = useDialogTracking(props.open, props.tracking);

    return (
        <BaseModal {...props} onDismiss={emitDismissed}>
            <ModalContentWrapper>
                <Tooltip title='Close' arrow describeChild>
                    <StyledIconButton
                        onClick={() => {
                            emitDismissed('close-icon');
                            props.onClose();
                        }}
                    >
                        <CloseIcon />
                    </StyledIconButton>
                </Tooltip>
                {props.children}
            </ModalContentWrapper>
        </BaseModal>
    );
};
