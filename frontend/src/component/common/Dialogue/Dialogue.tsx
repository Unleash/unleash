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
        backgroundColor: 'transparent',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.background.alternative,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(3.5, 6),
    fontWeight: theme.fontWeight.medium,
}));

const StyledDialogBody = styled('div')(({ theme }) => ({
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: 0,
    marginBottom: theme.spacing(6),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    gap: theme.spacing(2),
    padding: 0,
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
            <StyledDialogBody>
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
            </StyledDialogBody>
        </StyledDialog>
    );
};
