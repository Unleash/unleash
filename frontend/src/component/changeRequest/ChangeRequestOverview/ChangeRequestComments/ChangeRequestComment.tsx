import type { FC } from 'react';
import { Markdown } from 'component/common/Markdown/Markdown';
import Paper from '@mui/material/Paper';
import { Box, styled, Typography } from '@mui/material';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { StyledAvatar } from './StyledAvatar.tsx';
import type { IChangeRequestComment } from '../../changeRequest.types';

const ChangeRequestCommentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(2),
}));
const CommentPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(1.5, 3, 2.5, 3),
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusLarge,
    borderColor: theme.palette.divider,
}));

const CommentHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    paddingBottom: theme.spacing(1.5),
}));

export const ChangeRequestComment: FC<{ comment: IChangeRequestComment }> = ({
    comment,
}) => (
    <ChangeRequestCommentWrapper>
        <StyledAvatar user={comment.createdBy} />
        <CommentPaper variant='outlined'>
            <CommentHeader>
                <Box>
                    <strong>{comment.createdBy.username}</strong>{' '}
                    <Typography color='text.secondary' component='span'>
                        commented <TimeAgo date={comment.createdAt} />
                    </Typography>
                </Box>
            </CommentHeader>
            <Box sx={{ paddingTop: 2.5 }}>
                <Markdown>{comment.text}</Markdown>
            </Box>
        </CommentPaper>
    </ChangeRequestCommentWrapper>
);
