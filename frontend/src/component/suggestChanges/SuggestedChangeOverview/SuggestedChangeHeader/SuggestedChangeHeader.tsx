import { FC } from 'react';
import { Avatar, Box, Card, Paper, Typography } from '@mui/material';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import TimeAgo from 'react-timeago';

export const SuggestedChangeHeader: FC<{ suggestedChange: any }> = ({
    suggestedChange,
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
                    Suggestion
                    <Typography variant="h1" component="p">
                        #{suggestedChange.id}
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
                    Created{' '}
                    <TimeAgo date={new Date(suggestedChange.createdAt)} /> by
                </Typography>
                <Avatar src={suggestedChange?.createdBy?.avatar} />
                <Card
                    variant="outlined"
                    sx={theme => ({
                        padding: 1,
                        backgroundColor: theme.palette.tertiary.light,
                    })}
                >
                    Environment:{' '}
                    <Typography display="inline" fontWeight="bold">
                        {suggestedChange?.environment}
                    </Typography>{' '}
                    | Updates:{' '}
                    <Typography display="inline" fontWeight="bold">
                        {suggestedChange?.features.length} feature toggles
                    </Typography>
                </Card>
            </Box>
        </Paper>
    );
};
