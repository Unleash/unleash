import { FC } from 'react';
import { Box, styled, TextField, Tooltip } from '@mui/material';
import { StyledAvatar } from './StyledAvatar';
import { IUser } from 'interfaces/user';

const AddCommentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

export const AddCommentField: FC<{
    user: IUser | undefined;
    commentText: string;
    onTypeComment: (text: string) => void;
}> = ({ user, commentText, onTypeComment, children }) => (
    <>
        <AddCommentWrapper>
            <Tooltip title={user?.name || user?.username}>
                <StyledAvatar src={user?.imageUrl || ''} />
            </Tooltip>
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
