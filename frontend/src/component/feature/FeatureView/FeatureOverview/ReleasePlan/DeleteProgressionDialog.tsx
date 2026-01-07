import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface IDeleteProgressionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    milestoneName: string;
    isDeleting?: boolean;
}

export const DeleteProgressionDialog = ({
    open,
    onClose,
    onConfirm,
    milestoneName,
    isDeleting = false,
}: IDeleteProgressionDialogProps) => (
    <Dialogue
        title='Remove automation?'
        open={open}
        primaryButtonText={isDeleting ? 'Removing...' : 'Remove automation'}
        secondaryButtonText='Cancel'
        onClick={onConfirm}
        onClose={onClose}
        disabledPrimaryButton={isDeleting}
    >
        <p>
            You are about to remove the automation that progresses from{' '}
            <strong>{milestoneName}</strong> to the next milestone.
        </p>
        <br />
        <p>This action cannot be undone.</p>
    </Dialogue>
);
