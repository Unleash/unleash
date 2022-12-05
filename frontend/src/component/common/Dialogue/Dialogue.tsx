import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    styled,
} from '@mui/material';

import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DIALOGUE_CONFIRM_ID } from 'utils/testIds';

const StyledDialog = styled(Dialog)(({ theme, maxWidth }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: !maxWidth ? theme.spacing(85) : undefined,
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.tertiaryContrast,
    padding: theme.spacing(3.5, 6),
    fontWeight: theme.fontWeight.medium,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    marginTop: theme.spacing(5),
    padding: theme.spacing(0, 6),
    marginBottom: theme.spacing(1.5),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(6),
    gap: theme.spacing(2),
}));

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
    maxWidth,
    fullWidth = false,
    formId,
    permissionButton,
}) => {
    const handleClick = formId
        ? (e: React.SyntheticEvent) => {
              e.preventDefault();
              if (onClick) {
                  onClick(e);
              }
          }
        : onClick;
    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            fullWidth={fullWidth}
            aria-labelledby={'simple-modal-title'}
            aria-describedby={'simple-modal-description'}
            maxWidth={maxWidth}
        >
            <StyledDialogTitle>{title}</StyledDialogTitle>
            <ConditionallyRender
                condition={Boolean(children)}
                show={<StyledDialogContent>{children}</StyledDialogContent>}
            />

            <StyledDialogActions>
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
            </StyledDialogActions>
        </StyledDialog>
    );
};
