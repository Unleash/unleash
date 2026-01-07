import type React from 'react';
import type { FC } from 'react';
import { Box, styled, TextField } from '@mui/material';
import { StyledAvatar } from './StyledAvatar.tsx';
import type { IUser } from 'interfaces/user';

const AddCommentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

export const AddCommentField: FC<{
    user: IUser | undefined;
    commentText: string;
    onTypeComment: (text: string) => void;
    children?: React.ReactNode;
}> = ({ user, commentText, onTypeComment, children }) => (
    <>
        <AddCommentWrapper>
            <StyledAvatar user={user} />
            <TextField
                variant='outlined'
                placeholder='Add your comment here'
                fullWidth
                multiline
                minRows={2}
                onChange={(e) => onTypeComment(e.target.value)}
                value={commentText}
            />
        </AddCommentWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {children}
        </Box>
    </>
);
