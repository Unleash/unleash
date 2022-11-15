import { StyledAvatar } from '../ChangeRequestHeader/ChangeRequestHeader.styles';
import Paper from '@mui/material/Paper';
import { Box, Typography } from '@mui/material';
import TimeAgo from 'react-timeago';
import { IChangeRequestComment } from '../../changeRequest.types';
import { FC } from 'react';

export const ChangeRequestComment: FC<{ comment: IChangeRequestComment }> = ({
    comment,
}) => (
    <Box
        sx={{
            display: 'flex',
            gap: 2,
            marginTop: 2,
        }}
    >
        <StyledAvatar sx={{ marginTop: 1 }} src={comment.createdBy.imageUrl} />
        <Paper
            variant="outlined"
            sx={theme => ({
                width: '100%',
                padding: 2,
                backgroundColor: theme.palette.tertiary.light,
            })}
        >
            <Box
                sx={theme => ({
                    display: 'flex',
                    borderBottom: '1px solid',
                    borderColor: theme.palette.divider,
                    paddingBottom: 1,
                })}
            >
                <Box>
                    <strong>{comment.createdBy.username}</strong>{' '}
                    <Typography color="text.secondary" component="span">
                        commented <TimeAgo date={new Date(comment.createdAt)} />
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ paddingTop: 2 }}>{comment.text}</Box>
        </Paper>
    </Box>
);
