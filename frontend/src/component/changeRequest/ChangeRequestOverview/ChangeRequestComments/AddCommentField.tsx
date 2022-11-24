import { FC } from 'react';
import { Box, Button, styled, TextField } from '@mui/material';
import { StyledAvatar } from './StyledAvatar';

const AddCommentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

export const AddCommentField: FC<{
    imageUrl: string;
    commentText: string;
    onTypeComment: (text: string) => void;
}> = ({ imageUrl, commentText, onTypeComment, children }) => (
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
            {children}
        </Box>
    </>
);
