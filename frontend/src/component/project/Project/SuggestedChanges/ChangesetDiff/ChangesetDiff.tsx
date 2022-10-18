import { VFC } from 'react';
import { Box, Paper, Typography, Card } from '@mui/material';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip'; // FIXME: refactor - extract to common

type ChangesetDiffProps = {
    changeSet?: any;
};

export const ChangesetDiff: VFC<ChangesetDiffProps> = ({ changeSet }) => (
    <Paper
        elevation={4}
        sx={{
            border: '1px solid',
            p: 2,
            borderColor: theme => theme.palette.dividerAlternative,
            display: 'flex',
            gap: 2,
            flexDirection: 'column',
            borderRadius: theme => `${theme.shape.borderRadius}px`,
        }}
    >
        <Typography variant="h3">Changes</Typography>
        {/*// @ts-ignore FIXME: types */}
        {changeSet?.map(item => (
            <Card
                key={item.feature}
                elevation={0}
                sx={{
                    borderRadius: theme => `${theme.shape.borderRadius}px`,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: theme => theme.palette.dividerAlternative,
                }}
            >
                <Box
                    sx={{
                        backgroundColor: theme =>
                            theme.palette.tableHeaderBackground,
                        p: 2,
                    }}
                >
                    <Typography>{item.feature}</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                    {/*
                      // @ts-ignore FIXME: types */}
                    {item?.changes?.map(change => {
                        if (change?.action === 'updateEnabled') {
                            return (
                                <Box key={change?.id}>
                                    New status:{' '}
                                    <PlaygroundResultChip
                                        showIcon={false}
                                        label={
                                            change?.payload
                                                ? 'Enabled'
                                                : 'Disabled'
                                        }
                                        enabled={change?.payload}
                                    />
                                </Box>
                            );
                        }
                        return (
                            <Box key={change.id}>
                                Change with ID: {change.id}
                            </Box>
                        );
                    })}
                </Box>
            </Card>
        ))}
    </Paper>
);
