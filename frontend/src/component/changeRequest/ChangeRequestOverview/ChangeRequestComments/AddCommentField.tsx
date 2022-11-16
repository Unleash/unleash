import { FC } from 'react';
import { Box, Button, styled, TextField } from '@mui/material';
import { StyledAvatar } from './StyledAvatar';

const AddCommentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

export const AddCommentField: FC<{
    imageUrl: string;
    commentText: string;
    onAddComment: () => void;
    onTypeComment: (text: string) => void;
}> = ({ imageUrl, commentText, onTypeComment, onAddComment }) => (
    <>
        <AddCommentWrapper>
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
        </AddCommentWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
                variant="outlined"
                onClick={onAddComment}
                disabled={
                    commentText.trim().length === 0 ||
                    commentText.trim().length > 1000
                }
            >
                Comment
            </Button>
        </Box>
    </>
);
