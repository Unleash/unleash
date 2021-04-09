import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import ConditionallyRender from '../ConditionallyRender/ConditionallyRender';

const ConfirmDialogue = ({
    children,
    open,
    onClick,
    onClose,
    title,
    primaryButtonText,
    secondaryButtonText,
    fullWidth = false,
}) => (
    <Dialog
        open={open}
        onClose={onClose}
        fullWidth={fullWidth}
        aria-labelledby={'simple-modal-title'}
        aria-describedby={'simple-modal-description'}
    >
        <DialogTitle>{title}</DialogTitle>
        <ConditionallyRender condition={children} show={<DialogContent>{children}</DialogContent>} />

        <DialogActions>
            <Button color="primary" onClick={onClick} autoFocus>
                {primaryButtonText || "Yes, I'm sure"}
            </Button>
            <Button onClick={onClose}>{secondaryButtonText || 'No take me back.'} </Button>
        </DialogActions>
    </Dialog>
);

ConfirmDialogue.propTypes = {
    primaryButtonText: PropTypes.string,
    secondaryButtonText: PropTypes.string,
    children: PropTypes.object,
    open: PropTypes.bool,
    onClick: PropTypes.func,
    onClose: PropTypes.func,
    ariaLabel: PropTypes.string,
    ariaDescription: PropTypes.string,
    title: PropTypes.string,
    fullWidth: PropTypes.bool,
};

export default ConfirmDialogue;
