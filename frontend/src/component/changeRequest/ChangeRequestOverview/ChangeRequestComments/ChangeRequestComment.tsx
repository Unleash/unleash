import { FC } from 'react';
import Paper from '@mui/material/Paper';
import { Box, styled, Typography, Tooltip } from '@mui/material';
import TimeAgo from 'react-timeago';
import { StyledAvatar } from './StyledAvatar';
import { IChangeRequestComment } from '../../changeRequest.types';
import Linkify from 'react-linkify';

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
        <Tooltip title={comment.createdBy.username}>
            <StyledAvatar src={comment.createdBy.imageUrl} />
        </Tooltip>
        <CommentPaper variant="outlined">
            <CommentHeader>
                <Box>
                    <strong>{comment.createdBy.username}</strong>{' '}
                    <Typography color="text.secondary" component="span">
                        commented{' '}
                        <TimeAgo
                            minPeriod={60}
                            date={new Date(comment.createdAt)}
                        />
                    </Typography>
                </Box>
            </CommentHeader>
            <Box sx={{ paddingTop: 2.5 }}>
                <Linkify>{comment.text}</Linkify>
            </Box>
        </CommentPaper>
    </ChangeRequestCommentWrapper>
);
