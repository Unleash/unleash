import { type FC, useState } from 'react';
import { TextField, Box } from '@mui/material';
import { Dialogue } from '../../../common/Dialogue/Dialogue.tsx';

interface IChangeRequestDialogueProps {
    open: boolean;
    onConfirm: (comment?: string) => void;
    onClose: () => void;
    disabled?: boolean;
}

export const ChangeRequestRejectDialogue: FC<IChangeRequestDialogueProps> = ({
    open,
    onConfirm,
    onClose,
    disabled = false,
}) => {
    const [commentText, setCommentText] = useState('');

    return (
        <Dialogue
            open={open}
            primaryButtonText='Reject changes'
            secondaryButtonText='Cancel'
            onClick={() => onConfirm(commentText)}
            disabledPrimaryButton={disabled}
            onClose={onClose}
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
