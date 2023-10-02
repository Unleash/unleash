import { FC, useState } from 'react';
import { TextField, Box } from '@mui/material';
import { Dialogue } from '../../../common/Dialogue/Dialogue';

interface IChangeRequestDialogueProps {
    open: boolean;
    onConfirm: (comment?: string) => void;
    onClose: () => void;
}

export const ChangeRequestRejectDialogue: FC<IChangeRequestDialogueProps> = ({
    open,
    onConfirm,
    onClose,
}) => {
    const [commentText, setCommentText] = useState('');

    return (
        <Dialogue
            open={open}
            primaryButtonText='Reject changes'
            secondaryButtonText='Cancel'
            onClick={() => onConfirm(commentText)}
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
