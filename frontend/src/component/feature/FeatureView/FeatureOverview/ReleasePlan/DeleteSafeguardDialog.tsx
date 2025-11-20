import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface IDeleteSafeguardDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export const DeleteSafeguardDialog = ({
    open,
    onClose,
    onConfirm,
    isDeleting = false,
}: IDeleteSafeguardDialogProps) => (
    <Dialogue
        title='Remove safeguard?'
        open={open}
        primaryButtonText={isDeleting ? 'Removing...' : 'Remove safeguard'}
        secondaryButtonText='Cancel'
        onClick={onConfirm}
        onClose={onClose}
        disabledPrimaryButton={isDeleting}
    >
        <p>
            You are about to remove the safeguard that pauses automation when
            conditions are met.
        </p>
        <br />
        <p>This action cannot be undone.</p>
    </Dialogue>
);
