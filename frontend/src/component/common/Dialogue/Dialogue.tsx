import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './Dialogue.styles';
import { DIALOGUE_CONFIRM_ID } from 'utils/testIds';

interface IDialogue {
    primaryButtonText?: string;
    secondaryButtonText?: string;
    open: boolean;
    onClick?: (e: React.SyntheticEvent) => void;
    onClose?: (e: React.SyntheticEvent, reason?: string) => void;
    style?: object;
    title: string;
    fullWidth?: boolean;
    maxWidth?: 'lg' | 'sm' | 'xs' | 'md' | 'xl';
    disabledPrimaryButton?: boolean;
    formId?: string;
    permissionButton?: JSX.Element;
}

export const Dialogue: React.FC<IDialogue> = ({
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
    formId,
    permissionButton,
}) => {
    const { classes: styles } = useStyles();
    const handleClick = formId
        ? (e: React.SyntheticEvent) => {
              e.preventDefault();
              if (onClick) {
                  onClick(e);
              }
          }
        : onClick;
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
                condition={Boolean(children)}
                show={
                    <DialogContent className={styles.dialogContentPadding}>
                        {children}
                    </DialogContent>
                }
            />

            <DialogActions>
                <ConditionallyRender
                    condition={Boolean(permissionButton)}
                    show={permissionButton!}
                    elseShow={
                        <ConditionallyRender
                            condition={Boolean(onClick)}
                            show={
                                <Button
                                    form={formId}
                                    color="primary"
                                    variant="contained"
                                    onClick={handleClick}
                                    autoFocus={!formId}
                                    disabled={disabledPrimaryButton}
                                    data-testid={DIALOGUE_CONFIRM_ID}
                                    type={formId ? 'submit' : 'button'}
                                >
                                    {primaryButtonText || "Yes, I'm sure"}
                                </Button>
                            }
                        />
                    }
                />

                <ConditionallyRender
                    condition={Boolean(onClose)}
                    show={
                        <Button onClick={onClose}>
                            {secondaryButtonText || 'No, take me back'}
                        </Button>
                    }
                />
            </DialogActions>
        </Dialog>
    );
};
