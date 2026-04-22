import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import type { CompiledPreview } from 'hooks/api/actions/useReleaseAgentApi/useReleaseAgentApi';

type Props = {
    preview: CompiledPreview;
};

const formatTime = (iso: string): string => {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
};

export const SequencePreview = ({ preview }: Props) => {
    return (
        <Paper variant='outlined' sx={{ p: 2 }}>
            <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                sx={{ mb: 1 }}
            >
                <Typography variant='subtitle2'>Preview</Typography>
                <Chip size='small' label={preview.model} />
            </Stack>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {preview.rationale}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
                {preview.actions.map((action, index) => (
                    <Paper
                        key={`${action.featureName}-${action.fireAt}-${index}`}
                        variant='outlined'
                        sx={{ p: 1.5 }}
                    >
                        <Stack
                            direction='row'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Typography variant='body2'>
                                #{action.sortOrder ?? index} ·{' '}
                                {action.actionType} · {action.featureName}
                            </Typography>
                            <Typography
                                variant='caption'
                                color='text.secondary'
                            >
                                fires {formatTime(action.fireAt)}
                            </Typography>
                        </Stack>
                        <Box
                            component='pre'
                            sx={{
                                m: 0,
                                mt: 1,
                                p: 1,
                                fontSize: 12,
                                overflow: 'auto',
                                backgroundColor: 'background.default',
                                borderRadius: 1,
                            }}
                        >
                            {JSON.stringify(action.payload, null, 2)}
                        </Box>
                    </Paper>
                ))}
            </Stack>
        </Paper>
    );
};
