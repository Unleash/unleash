import { type FC, useState } from 'react';
import { TextField, Box } from '@mui/material';
import { Dialogue } from '../../../common/Dialogue/Dialogue.tsx';
import type { Tracking } from 'utils/trackingEvents';

interface IChangeRequestDialogueProps {
    open: boolean;
    onConfirm: (comment?: string) => Promise<unknown>;
    onError?: (error: unknown) => void;
    onClose: () => void;
    disabled?: boolean;
    tracking: Tracking;
}

export const ChangeRequestRejectDialogue: FC<IChangeRequestDialogueProps> = ({
    open,
    onConfirm,
    onError,
    onClose,
    disabled = false,
    tracking,
}) => {
    const [commentText, setCommentText] = useState('');

    return (
        <Dialogue
            open={open}
            primaryButtonText='Reject changes'
            secondaryButtonText='Cancel'
            onSubmit={() => onConfirm(commentText)}
            onError={onError}
            disabledPrimaryButton={disabled}
            onClose={onClose}
            tracking={tracking}
            title='Reject changes'
            fullWidth
        >
            <Box>Add an optional comment why you reject those changes</Box>
            <TextField
                sx={{ mt: 1 }}
                variant='outlined'
                placeholder='Add your comment here'
                fullWidth
                multiline
                minRows={2}
                onChange={(e) => setCommentText(e.target.value)}
                value={commentText}
            />
        </Dialogue>
    );
};
