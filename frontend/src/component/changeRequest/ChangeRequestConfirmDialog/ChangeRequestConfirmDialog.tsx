import { FC } from 'react';
import { Alert, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface IChangeRequestDialogueProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    environment?: string;
    showBanner?: boolean;
    messageComponent: JSX.Element;
}

export const ChangeRequestDialogue: FC<IChangeRequestDialogueProps> = ({
    isOpen,
    onConfirm,
    onClose,
    showBanner,
    environment,
    messageComponent,
}) => (
    <Dialogue
        open={isOpen}
        primaryButtonText="Add suggestion to draft"
        secondaryButtonText="Cancel"
        onClick={onConfirm}
        onClose={onClose}
        title="Request changes"
        fullWidth
    >
        {showBanner && (
            <Alert severity="info" sx={{ mb: 2 }}>
                Change requests feature is enabled for {environment}. Your
                changes needs to be approved before they will be live. All the
                changes you do now will be added into a draft that you can
                submit for review.
            </Alert>
        )}
        <Typography variant="body2" color="text.secondary">
            Your suggestion:
        </Typography>
        {messageComponent}
    </Dialogue>
);
