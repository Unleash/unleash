import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Button,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import ConditionallyRender from '../ConditionallyRender/ConditionallyRender';
import { useStyles } from './Dialogue.styles';

const Dialogue = ({
    children,
    open,
    onClick,
    onClose,
    title,
    primaryButtonText,
    disabledPrimaryButton = false,
    secondaryButtonText,
    maxWidth = 'sm',
    fullWidth = false,
}) => {
    const styles = useStyles();
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth={fullWidth}
            aria-labelledby={'simple-modal-title'}
            aria-describedby={'simple-modal-description'}
            maxWidth={maxWidth}
        >
            <DialogTitle className={styles.dialogTitle}>{title}</DialogTitle>
            <ConditionallyRender
                condition={children}
                show={
                    <DialogContent className={styles.dialogContentPadding}>
                        {children}
                    </DialogContent>
                }
            />

            <DialogActions>
                <ConditionallyRender
                    condition={onClick}
                    show={
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={onClick}
                            autoFocus
                            disabled={disabledPrimaryButton}
                        >
                            {primaryButtonText || "Yes, I'm sure"}
                        </Button>
                    }
                />

                <ConditionallyRender
                    condition={onClose}
                    show={
                        <Button onClick={onClose}>
                            {secondaryButtonText || 'No take me back'}{' '}
                        </Button>
                    }
                />
            </DialogActions>
        </Dialog>
    );
};

Dialogue.propTypes = {
    primaryButtonText: PropTypes.string,
    secondaryButtonText: PropTypes.string,
    open: PropTypes.bool,
    onClick: PropTypes.func,
    onClose: PropTypes.func,
    ariaLabel: PropTypes.string,
    ariaDescription: PropTypes.string,
    title: PropTypes.string,
    fullWidth: PropTypes.bool,
};

export default Dialogue;
