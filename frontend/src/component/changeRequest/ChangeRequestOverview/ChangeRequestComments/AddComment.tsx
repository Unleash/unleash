import { FC } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { StyledAvatar } from '../ChangeRequestHeader/ChangeRequestHeader.styles';

export const AddComment: FC<{
    imageUrl: string;
    commentText: string;
    onAddComment: () => void;
    onTypeComment: (text: string) => void;
}> = ({ imageUrl, commentText, onTypeComment, onAddComment }) => (
    <>
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                marginTop: 2,
                marginBottom: 1,
            }}
        >
            <StyledAvatar src={imageUrl} />
            <TextField
                variant="outlined"
                placeholder="Add your comment here"
                fullWidth
                multiline
                minRows={2}
                onChange={e => onTypeComment(e.target.value)}
                value={commentText}
            />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
                variant="outlined"
                onClick={onAddComment}
                disabled={commentText.trim().length === 0}
            >
                Comment
            </Button>
        </Box>
    </>
);
