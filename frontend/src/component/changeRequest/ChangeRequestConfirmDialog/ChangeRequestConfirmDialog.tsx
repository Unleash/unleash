import { FC } from 'react';
import { Alert, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface IChangeRequestDialogueProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    featureName?: string;
    environment?: string;
    enabled?: boolean;
}

export const ChangeRequestDialogue: FC<IChangeRequestDialogueProps> = ({
    isOpen,
    onConfirm,
    onClose,
    enabled,
    featureName,
    environment,
}) => (
    <Dialogue
        open={isOpen}
        primaryButtonText="Add to draft"
        secondaryButtonText="Cancel"
        onClick={onConfirm}
        onClose={onClose}
        title="Request changes"
    >
        <Alert severity="info" sx={{ mb: 2 }}>
            Change requests is enabled for {environment}. Your changes needs to
            be approved before they will be live. All the changes you do now
            will be added into a draft that you can submit for review.
        </Alert>
        <Typography variant="body2" color="text.secondary">
            Change requests:
        </Typography>
        <Typography>
            <strong>{enabled ? 'Disable' : 'Enable'}</strong> feature toggle{' '}
            <strong>{featureName}</strong> in <strong>{environment}</strong>
        </Typography>
    </Dialogue>
);
