import { FC } from 'react';
import { Avatar, Box, Card, Paper, Typography } from '@mui/material';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import TimeAgo from 'react-timeago';

export const ChangeRequestHeader: FC<{ changeRequest: any }> = ({
    changeRequest,
}) => {
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                p: theme.spacing(2, 4),
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <Box
                sx={theme => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    marginBottom: theme.spacing(2),
                })}
            >
                <Typography
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    variant="h1"
                >
                    Change request
                    <Typography variant="h1" component="p">
                        #{changeRequest.id}
                    </Typography>
                </Typography>
                <PlaygroundResultChip
                    // icon={<ChangesAppliedIcon strokeWidth="0.25" />}
                    label="Changes approved"
                    enabled
                />
            </Box>
            <Box sx={{ display: 'flex', verticalAlign: 'center', gap: 2 }}>
                <Typography sx={{ margin: 'auto 0' }}>
                    Created <TimeAgo date={new Date(changeRequest.createdAt)} />{' '}
                    by
                </Typography>
                <Avatar src={changeRequest?.createdBy?.avatar} />
                <Card
                    variant="outlined"
                    sx={theme => ({
                        padding: 1,
                        backgroundColor: theme.palette.tertiary.light,
                    })}
                >
                    Environment:{' '}
                    <Typography display="inline" fontWeight="bold">
                        {changeRequest?.environment}
                    </Typography>{' '}
                    | Updates:{' '}
                    <Typography display="inline" fontWeight="bold">
                        {changeRequest?.features.length} feature toggles
                    </Typography>
                </Card>
            </Box>
        </Paper>
    );
};
